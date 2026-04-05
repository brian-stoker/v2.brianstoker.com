import type { GitHubEvent } from '../src/types/github';
import { getDatabase } from '../pages/api/lib/mongodb';

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  resource: string;
  lastChecked: Date;
}

export interface SyncGitHubEventsOptions {
  fullRefresh?: boolean;
  githubToken?: string;
  githubUser?: string;
}

export interface SyncGitHubEventsResult {
  success: true;
  mode: 'full_refresh' | 'incremental';
  newEventCount: number;
  duplicatesSkipped: number;
  totalEventsInDb: number;
  pagesChecked: number;
  lastSync: string;
}

export interface SyncGitHubEventsError extends Error {
  statusCode?: number;
  details?: Record<string, unknown>;
}

const createSyncError = (
  message: string,
  statusCode = 500,
  details?: Record<string, unknown>,
): SyncGitHubEventsError => {
  const error = new Error(message) as SyncGitHubEventsError;
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

const getGitHubHeaders = (githubToken: string) => ({
  Authorization: `token ${githubToken}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'brianstoker.com-website',
  'X-GitHub-Api-Version': '2022-11-28',
});

export async function syncGitHubEvents(
  options: SyncGitHubEventsOptions = {},
): Promise<SyncGitHubEventsResult> {
  const githubToken = options.githubToken ?? process.env.GITHUB_TOKEN;
  const githubUser = options.githubUser ?? process.env.GITHUB_USERNAME ?? 'brian-stoker';
  const fullRefresh = options.fullRefresh === true;

  if (!githubToken) {
    throw createSyncError('GitHub token not configured');
  }

  try {
    const db = await getDatabase();
    if (!db) {
      throw createSyncError('Database not available');
    }

    const eventsCollection = db.collection('github_events');

    await eventsCollection.createIndex({ created_at: -1 });
    await eventsCollection.createIndex({ id: 1 }, { unique: true });
    await eventsCollection.createIndex({ 'repo.name': 1 });
    await eventsCollection.createIndex({ type: 1 });

    let mostRecentEvent: GitHubEvent | null = null;
    if (!fullRefresh) {
      mostRecentEvent = await eventsCollection.findOne(
        {},
        { sort: { created_at: -1 } as any },
      ) as GitHubEvent | null;

      if (mostRecentEvent) {
        console.log(`Most recent event in DB: ${mostRecentEvent.id} from ${mostRecentEvent.created_at}`);
      }
    } else {
      console.log('Full refresh requested - will re-fetch all events');
    }

    const rateLimitCollection = db.collection('github_rate_limits');
    const rateLimitInfo = await rateLimitCollection.findOne({ resource: 'core' } as any) as RateLimitInfo | null;

    const now = Math.floor(Date.now() / 1000);
    if (rateLimitInfo && rateLimitInfo.remaining <= 10 && rateLimitInfo.reset > now) {
      const resetDate = new Date(rateLimitInfo.reset * 1000);
      throw createSyncError(
        'Rate limit too low, waiting for reset',
        429,
        {
          rateLimit: rateLimitInfo,
          resetAt: resetDate.toISOString(),
        },
      );
    }

    console.log(`Starting ${fullRefresh ? 'full' : 'incremental'} sync for user: ${githubUser}`);

    if (fullRefresh) {
      console.log('Full refresh: Clearing existing events');
      await eventsCollection.deleteMany({});
    }

    let newEvents: GitHubEvent[] = [];
    let duplicateCount = 0;
    let githubPage = 1;
    let pagesChecked = 0;
    // GitHub caps this endpoint well below unlimited pagination.
    // With `per_page=40`, page 8 currently returns HTTP 422 in production.
    const maxPages = 7;
    let shouldContinue = true;

    while (shouldContinue && githubPage <= maxPages) {
      console.log(`Fetching page ${githubPage}...`);

      const response = await fetch(
        `https://api.github.com/users/${githubUser}/events?page=${githubPage}&per_page=40`,
        {
          cache: 'no-store',
          headers: getGitHubHeaders(githubToken),
        },
      );

      const rateLimit: RateLimitInfo = {
        limit: parseInt(response.headers.get('x-ratelimit-limit') || '5000', 10),
        remaining: parseInt(response.headers.get('x-ratelimit-remaining') || '0', 10),
        reset: parseInt(response.headers.get('x-ratelimit-reset') || '0', 10),
        resource: response.headers.get('x-ratelimit-resource') || 'core',
        lastChecked: new Date(),
      };

      await rateLimitCollection.updateOne(
        { resource: rateLimit.resource } as any,
        { $set: rateLimit },
        { upsert: true },
      );

      console.log(`Rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub API error: ${response.status}`, errorText);

        if (response.status === 403 && rateLimit.remaining === 0) {
          throw createSyncError(
            'Rate limit exceeded during sync',
            429,
            {
              rateLimit,
              eventsSynced: newEvents.length,
            },
          );
        }

        throw createSyncError(`GitHub API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as GitHubEvent[];
      pagesChecked += 1;
      console.log(`Page ${githubPage}: Received ${data.length} events`);

      if (data.length === 0) {
        shouldContinue = false;
      } else {
        if (!fullRefresh && mostRecentEvent) {
          const mostRecentDate = new Date(mostRecentEvent.created_at);

          const eventsToProcess = data.filter((event: GitHubEvent) => {
            const eventDate = new Date(event.created_at);
            return eventDate > mostRecentDate;
          });

          duplicateCount += data.length - eventsToProcess.length;

          if (eventsToProcess.length === 0) {
            console.log(`All events on page ${githubPage} already exist in DB, stopping sync`);
            shouldContinue = false;
            break;
          }

          if (eventsToProcess.length < data.length) {
            console.log(`Found ${eventsToProcess.length} new events and ${data.length - eventsToProcess.length} existing events`);
            data.length = 0;
            data.push(...eventsToProcess);
            shouldContinue = false;
          }
        }

        if (githubPage <= 2) {
          let rateLimitHit = false;

          for (const event of data) {
            if (rateLimitHit) {
              break;
            }

            if (event.type === 'PullRequestEvent' && event.payload.pull_request && !event.payload.pull_request._enriched) {
              try {
                const prNumber = event.payload.pull_request.number;
                const prUrl = `https://api.github.com/repos/${event.repo.name}/pulls/${prNumber}`;

                const prResponse = await fetch(prUrl, {
                  cache: 'no-store',
                  headers: getGitHubHeaders(githubToken),
                });

                if (prResponse.ok) {
                  const prData = await prResponse.json();

                  event.payload.pull_request = {
                    ...event.payload.pull_request,
                    ...prData,
                    _enriched: true,
                  };

                  try {
                    const commitsUrl = `https://api.github.com/repos/${event.repo.name}/pulls/${prNumber}/commits`;
                    const commitsResponse = await fetch(commitsUrl, {
                      cache: 'no-store',
                      headers: getGitHubHeaders(githubToken),
                    });

                    if (commitsResponse.ok) {
                      const commitsData = await commitsResponse.json();
                      event.payload.pull_request.commits_list = commitsData;
                    }
                  } catch (err) {
                    console.error(`Failed to fetch PR commits: ${err}`);
                  }

                  try {
                    const filesUrl = `https://api.github.com/repos/${event.repo.name}/pulls/${prNumber}/files`;
                    const filesResponse = await fetch(filesUrl, {
                      cache: 'no-store',
                      headers: getGitHubHeaders(githubToken),
                    });

                    if (filesResponse.ok) {
                      const filesData = await filesResponse.json();
                      event.payload.pull_request.files = filesData;
                    }
                  } catch (err) {
                    console.error(`Failed to fetch PR files: ${err}`);
                  }

                  console.log(`Enriched PullRequestEvent #${prNumber} for ${event.repo.name}`);
                } else if (prResponse.status === 403) {
                  const rateLimitRemaining = parseInt(prResponse.headers.get('x-ratelimit-remaining') || '0', 10);
                  if (rateLimitRemaining === 0) {
                    console.warn('Rate limit hit during PR enrichment');
                    rateLimitHit = true;
                    break;
                  } else {
                    console.warn(`PR #${prNumber} access forbidden (private repo without access)`);
                  }
                } else if (prResponse.status === 404) {
                  console.warn(`PR #${prNumber} not found (deleted or private)`);
                }
              } catch (err) {
                console.error(`Failed to enrich PullRequestEvent: ${err}`);
              }
            }
          }

          if (!rateLimitHit) {
            for (const event of data) {
              if (event.type === 'PushEvent' && !event.payload.size && event.payload.before && event.payload.head) {
                try {
                  const compareUrl = `https://api.github.com/repos/${event.repo.name}/compare/${event.payload.before}...${event.payload.head}`;
                  const compareResponse = await fetch(compareUrl, {
                    cache: 'no-store',
                    headers: getGitHubHeaders(githubToken),
                  });

                  if (compareResponse.ok) {
                    const compareData = await compareResponse.json();
                    event.payload.size = compareData.total_commits || compareData.commits?.length || 1;
                    event.payload.commits = compareData.commits || [];
                    event.payload.files = compareData.files || [];
                  } else if (compareResponse.status === 403) {
                    console.warn('Rate limit hit during push enrichment');
                    event.payload.size = 1;
                    break;
                  } else {
                    event.payload.size = 1;
                  }
                } catch (err) {
                  console.error(`Failed to enrich PushEvent: ${err}`);
                  event.payload.size = 1;
                }
              }
            }
          }
        } else {
          for (const event of data) {
            if (event.type === 'PushEvent' && !event.payload.size) {
              event.payload.size = 1;
            }
          }
        }

        if (data.length > 0) {
          for (const event of data) {
            await eventsCollection.updateOne(
              { _id: event.id } as any,
              {
                $set: {
                  ...event,
                  _syncedAt: new Date(),
                  _id: event.id,
                },
              },
              { upsert: true },
            );
          }
          newEvents = [...newEvents, ...data];
          console.log(`Stored ${data.length} events from page ${githubPage}`);
        }

        if (githubPage >= maxPages) {
          console.log(`Reached maximum page limit (${maxPages}), stopping sync`);
          shouldContinue = false;
        } else {
          githubPage += 1;
        }
      }

      if (rateLimit.remaining <= 10) {
        console.warn('Approaching rate limit, stopping sync');
        shouldContinue = false;
      }
    }

    console.log(`Sync complete: ${newEvents.length} new events fetched${duplicateCount > 0 ? ` (${duplicateCount} duplicates skipped)` : ''}`);

    if (fullRefresh) {
      console.log('Full refresh completed');
    } else if (newEvents.length === 0) {
      console.log('No new events to sync');
    }

    const metadataCollection = db.collection('sync_metadata');
    const totalEvents = await eventsCollection.countDocuments({});
    const lastSync = new Date();

    await metadataCollection.updateOne(
      { _id: 'github_events_sync' } as any,
      {
        $set: {
          lastSync,
          totalEventCount: totalEvents,
          newEventCount: newEvents.length,
          fullRefresh,
          success: true,
        },
        $unset: {
          error: '',
        },
      },
      { upsert: true },
    );

    return {
      success: true,
      mode: fullRefresh ? 'full_refresh' : 'incremental',
      newEventCount: newEvents.length,
      duplicatesSkipped: duplicateCount,
      totalEventsInDb: totalEvents,
      pagesChecked,
      lastSync: lastSync.toISOString(),
    };
  } catch (error) {
    console.error('Error during sync:', error);

    try {
      const db = await getDatabase();
      if (db) {
        const metadataCollection = db.collection('sync_metadata');
        await metadataCollection.updateOne(
          { _id: 'github_events_sync' } as any,
          {
            $set: {
              lastSync: new Date(),
              success: false,
              error: error instanceof Error ? error.message : String(error),
            },
          },
          { upsert: true },
        );
      }
    } catch (metaError) {
      console.error('Failed to update metadata:', metaError);
    }

    throw error;
  }
}
