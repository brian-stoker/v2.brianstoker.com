import type { NextApiRequest, NextApiResponse } from 'next'
import { GitHubEvent } from '../../../src/types/github';
import { getDatabase } from '../lib/mongodb';

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  resource: string;
  lastChecked: Date;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Optional: Add authentication to prevent unauthorized syncing
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const githubUser = process.env.GITHUB_USERNAME || 'brian-stoker';

    // Check if this is a full refresh (query param: ?fullRefresh=true)
    const fullRefresh = req.query.fullRefresh === 'true';

    if (!githubToken) {
      return res.status(500).json({ message: 'GitHub token not configured' });
    }

    const db = await getDatabase();
    if (!db) {
      return res.status(500).json({ message: 'Database not available' });
    }

    const eventsCollection = db.collection('github_events');

    // Ensure indexes exist for performance
    await eventsCollection.createIndex({ created_at: -1 });
    await eventsCollection.createIndex({ id: 1 }, { unique: true });
    await eventsCollection.createIndex({ 'repo.name': 1 });
    await eventsCollection.createIndex({ type: 1 });

    // Get the most recent event from the database (unless doing full refresh)
    let mostRecentEvent: GitHubEvent | null = null;
    if (!fullRefresh) {
      mostRecentEvent = await eventsCollection.findOne(
        {},
        { sort: { created_at: -1 } as any }
      ) as GitHubEvent | null;

      if (mostRecentEvent) {
        console.log(`Most recent event in DB: ${mostRecentEvent.id} from ${mostRecentEvent.created_at}`);
      }
    } else {
      console.log('Full refresh requested - will re-fetch all events');
    }

    // Check rate limit before starting
    const rateLimitCollection = db.collection('github_rate_limits');
    const rateLimitInfo = await rateLimitCollection.findOne({ resource: 'core' } as any) as RateLimitInfo | null;

    const now = Math.floor(Date.now() / 1000);
    if (rateLimitInfo && rateLimitInfo.remaining <= 10 && rateLimitInfo.reset > now) {
      const resetDate = new Date(rateLimitInfo.reset * 1000);
      return res.status(429).json({
        message: 'Rate limit too low, waiting for reset',
        rateLimit: rateLimitInfo,
        resetAt: resetDate.toISOString()
      });
    }

    console.log(`Starting ${fullRefresh ? 'full' : 'incremental'} sync for user: ${githubUser}`);

    let newEvents: GitHubEvent[] = [];
    let duplicateCount = 0;
    let githubPage = 1;
    const maxPages = 30;
    let shouldContinue = true;

    while (shouldContinue && githubPage <= maxPages) {
      console.log(`Fetching page ${githubPage}...`);

      const response = await fetch(
        `https://api.github.com/users/${githubUser}/events?page=${githubPage}&per_page=100`,
        {
          headers: {
            Authorization: `token ${githubToken}`,
            'User-Agent': 'brianstoker.com-website',
          },
        }
      );

      // Save rate limit info
      const rateLimit: RateLimitInfo = {
        limit: parseInt(response.headers.get('x-ratelimit-limit') || '5000'),
        remaining: parseInt(response.headers.get('x-ratelimit-remaining') || '0'),
        reset: parseInt(response.headers.get('x-ratelimit-reset') || '0'),
        resource: response.headers.get('x-ratelimit-resource') || 'core',
        lastChecked: new Date()
      };

      await rateLimitCollection.updateOne(
        { resource: rateLimit.resource } as any,
        { $set: rateLimit },
        { upsert: true }
      );

      console.log(`Rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub API error: ${response.status}`, errorText);

        if (response.status === 403 && rateLimit.remaining === 0) {
          return res.status(429).json({
            message: 'Rate limit exceeded during sync',
            rateLimit,
            eventsSynced: newEvents.length
          });
        }

        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`Page ${githubPage}: Received ${data.length} events`);

      if (data.length === 0) {
        shouldContinue = false;
      } else {
        // For incremental sync, stop when we encounter events we already have
        if (!fullRefresh && mostRecentEvent) {
          const mostRecentDate = new Date(mostRecentEvent.created_at);

          // Filter out events we already have
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

          // If we got some new events but also some duplicates, we're at the boundary
          if (eventsToProcess.length < data.length) {
            console.log(`Found ${eventsToProcess.length} new events and ${data.length - eventsToProcess.length} existing events`);
            data.length = 0; // Clear the original array
            data.push(...eventsToProcess); // Replace with only new events
            shouldContinue = false; // Stop after this page
          }
        }
        // Enrich PushEvents and PullRequestEvents (only first 2 pages to conserve rate limit)
        if (githubPage <= 2) {
          let rateLimitHit = false;

          // First, enrich PullRequestEvents (prioritize these since they're more important)
          for (const event of data) {
            if (rateLimitHit) break;

            if (event.type === 'PullRequestEvent' && event.payload.pull_request && !event.payload.pull_request._enriched) {
              try {
                const prNumber = event.payload.pull_request.number;
                const prUrl = `https://api.github.com/repos/${event.repo.name}/pulls/${prNumber}`;

                const prResponse = await fetch(prUrl, {
                  headers: {
                    Authorization: `token ${githubToken}`,
                    'User-Agent': 'brianstoker.com-website',
                  },
                });

                if (prResponse.ok) {
                  const prData = await prResponse.json();

                  // Merge detailed PR data into the existing payload
                  event.payload.pull_request = {
                    ...event.payload.pull_request,
                    ...prData,
                    _enriched: true
                  };

                  // Fetch commits for the PR
                  try {
                    const commitsUrl = `https://api.github.com/repos/${event.repo.name}/pulls/${prNumber}/commits`;
                    const commitsResponse = await fetch(commitsUrl, {
                      headers: {
                        Authorization: `token ${githubToken}`,
                        'User-Agent': 'brianstoker.com-website',
                      },
                    });

                    if (commitsResponse.ok) {
                      const commitsData = await commitsResponse.json();
                      event.payload.pull_request.commits_list = commitsData;
                    }
                  } catch (err) {
                    console.error(`Failed to fetch PR commits: ${err}`);
                  }

                  // Fetch files for the PR
                  try {
                    const filesUrl = `https://api.github.com/repos/${event.repo.name}/pulls/${prNumber}/files`;
                    const filesResponse = await fetch(filesUrl, {
                      headers: {
                        Authorization: `token ${githubToken}`,
                        'User-Agent': 'brianstoker.com-website',
                      },
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
                  // Check if it's a real rate limit or just access denied
                  const rateLimitRemaining = parseInt(prResponse.headers.get('x-ratelimit-remaining') || '0');
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

          // Then enrich PushEvents with commit details (if we haven't hit rate limit)
          if (!rateLimitHit) {
            for (const event of data) {
              if (event.type === 'PushEvent' && !event.payload.size && event.payload.before && event.payload.head) {
                try {
                  const compareUrl = `https://api.github.com/repos/${event.repo.name}/compare/${event.payload.before}...${event.payload.head}`;
                  const compareResponse = await fetch(compareUrl, {
                    headers: {
                      Authorization: `token ${githubToken}`,
                      'User-Agent': 'brianstoker.com-website',
                    },
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
          // For pages beyond first 2, set default size for push events
          for (const event of data) {
            if (event.type === 'PushEvent' && !event.payload.size) {
              event.payload.size = 1;
            }
          }
        }

        newEvents = [...newEvents, ...data];
        githubPage++;
      }

      // Stop if we're getting close to rate limit
      if (rateLimit.remaining <= 10) {
        console.warn('Approaching rate limit, stopping sync');
        shouldContinue = false;
      }
    }

    console.log(`Sync complete: ${newEvents.length} new events fetched${duplicateCount > 0 ? ` (${duplicateCount} duplicates skipped)` : ''}`);

    // Store events in MongoDB
    if (fullRefresh) {
      // For full refresh, clear everything and insert all events
      console.log('Full refresh: Clearing existing events');
      await eventsCollection.deleteMany({});

      if (newEvents.length > 0) {
        const eventsWithMetadata = newEvents.map(event => ({
          ...event,
          _syncedAt: new Date(),
          _id: event.id
        }));

        await eventsCollection.insertMany(eventsWithMetadata as any);
        console.log(`Inserted ${newEvents.length} events`);
      }
    } else {
      // For incremental sync, upsert only new events
      if (newEvents.length > 0) {
        let insertedCount = 0;
        let updatedCount = 0;

        for (const event of newEvents) {
          const result = await eventsCollection.updateOne(
            { _id: event.id } as any,
            {
              $set: {
                ...event,
                _syncedAt: new Date(),
                _id: event.id
              }
            },
            { upsert: true }
          );

          if (result.upsertedCount) {
            insertedCount++;
          } else if (result.modifiedCount) {
            updatedCount++;
          }
        }

        console.log(`Upserted ${insertedCount} new events, updated ${updatedCount} existing events`);
      } else {
        console.log('No new events to sync');
      }
    }

    // Update sync metadata
    const metadataCollection = db.collection('sync_metadata');
    const totalEvents = await eventsCollection.countDocuments({});

    await metadataCollection.updateOne(
      { _id: 'github_events_sync' } as any,
      {
        $set: {
          lastSync: new Date(),
          totalEventCount: totalEvents,
          newEventCount: newEvents.length,
          fullRefresh: fullRefresh,
          success: true
        }
      },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      mode: fullRefresh ? 'full_refresh' : 'incremental',
      newEventCount: newEvents.length,
      duplicatesSkipped: duplicateCount,
      totalEventsInDb: totalEvents,
      pagesChecked: githubPage - 1,
      lastSync: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error during sync:', error);

    // Update sync metadata with error
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
              error: error instanceof Error ? error.message : String(error)
            }
          },
          { upsert: true }
        );
      }
    } catch (metaError) {
      console.error('Failed to update metadata:', metaError);
    }

    return res.status(500).json({
      message: 'Error during sync',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
