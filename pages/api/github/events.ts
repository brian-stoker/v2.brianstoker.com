import type { NextApiRequest, NextApiResponse } from 'next'
import { GitHubEvent } from '../../../src/types/github';
import { getDatabase } from '../lib/mongodb';

interface SyncMetadata {
  _id: string;
  lastSync: Date;
  eventCount: number;
  success: boolean;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      page = '1',
      per_page = '100',
      repo = '',
      action = '',
      date = '',
      description = ''
    } = req.query;

    const db = await getDatabase();
    if (!db) {
      return res.status(500).json({ message: 'Database not available' });
    }

    // Get sync metadata
    const metadataCollection = db.collection('sync_metadata');
    const syncMetadata = await metadataCollection.findOne({ _id: 'github_events_sync' } as any) as SyncMetadata | null;

    const eventsCollection = db.collection('github_events');

    // Build MongoDB filter query
    const query: any = {};

    if (repo) {
      query['repo.name'] = repo;
    }

    if (action) {
      query.type = `${action}Event`;
    }

    if (date) {
      const now = new Date();
      let cutoffDate: Date;

      switch (date) {
        case 'today':
          cutoffDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'yesterday':
          cutoffDate = new Date(now);
          cutoffDate.setDate(cutoffDate.getDate() - 1);
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate = new Date(now);
          cutoffDate.setDate(cutoffDate.getDate() - 7);
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          cutoffDate = new Date(now);
          cutoffDate.setMonth(cutoffDate.getMonth() - 1);
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        default:
          cutoffDate = new Date(0);
      }

      query.created_at = { $gte: cutoffDate.toISOString() };
    }

    // For description filtering, we need to fetch and filter in memory since it requires payload inspection
    // Get total count with filters
    const totalCount = await eventsCollection.countDocuments(query);

    if (totalCount === 0) {
      return res.status(200).json({
        events: [],
        total: 0,
        repositories: [],
        actionTypes: [],
        page: 1,
        per_page: parseInt(per_page as string),
        total_pages: 0,
        syncMetadata: syncMetadata || null
      });
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const perPage = parseInt(per_page as string);
    const skip = (pageNum - 1) * perPage;

    // Get paginated events using MongoDB skip/limit for efficiency
    let paginatedEvents = await eventsCollection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(perPage)
      .toArray() as any as GitHubEvent[];

    // Apply description filter in memory if needed
    if (description) {
      paginatedEvents = paginatedEvents.filter(event => {
        let eventDescription = '';
        if (event.type === 'PushEvent') {
          const commitCount = event.payload?.commits ? event.payload.commits.length : (event.payload?.size || 0);
          eventDescription = `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''}`;
        } else if (event.type === 'PullRequestEvent' && event.payload.pull_request?.title) {
          eventDescription = event.payload.pull_request.title;
        } else if (event.type === 'IssuesEvent' && event.payload.issue?.title) {
          eventDescription = event.payload.issue.title;
        } else if (event.type === 'IssueCommentEvent' && event.payload.issue?.title) {
          eventDescription = `Commented on issue: ${event.payload.issue.title}`;
        }
        return eventDescription.toLowerCase().includes((description as string).toLowerCase());
      });
    }

    console.log(`[API] Retrieved ${paginatedEvents.length} events from MongoDB (page ${pageNum}, total: ${totalCount}, totalPages: ${Math.ceil(totalCount / perPage)})`);

    // Return paginated results with metadata
    // Note: repositories and actionTypes removed to improve performance
    // The frontend can build these from cached events instead
    return res.status(200).json({
      events: paginatedEvents,
      total: totalCount,
      page: pageNum,
      per_page: perPage,
      total_pages: Math.ceil(totalCount / perPage),
      syncMetadata: syncMetadata || null
    });

  } catch (error) {
    console.error('Error fetching GitHub events from MongoDB:', error);
    return res.status(500).json({
      message: 'Error fetching GitHub events',
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 
