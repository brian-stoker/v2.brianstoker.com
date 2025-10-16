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

    // Get all events from MongoDB
    const eventsCollection = db.collection('github_events');
    const allEvents = await eventsCollection.find({}).sort({ created_at: -1 }).toArray() as any as GitHubEvent[];

    console.log(`Retrieved ${allEvents.length} events from MongoDB`);

    if (allEvents.length === 0) {
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

    // Apply filters
    let filteredEvents = allEvents;

    if (repo) {
      filteredEvents = filteredEvents.filter(event => event.repo.name === repo);
    }

    if (action) {
      filteredEvents = filteredEvents.filter(event => {
        const eventAction = event.type.replace('Event', '');
        return eventAction === action;
      });
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

      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.created_at);
        return eventDate >= cutoffDate;
      });
    }

    if (description) {
      filteredEvents = filteredEvents.filter(event => {
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

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const perPage = parseInt(per_page as string);
    const startIndex = (pageNum - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    // Extract unique values for filters
    const repositories = [...new Set(allEvents.map(event => event.repo.name))].sort();
    const actionTypes = [...new Set(allEvents.map(event => event.type.replace('Event', '')))].sort();

    // Return paginated results with metadata
    return res.status(200).json({
      events: paginatedEvents,
      total: filteredEvents.length,
      repositories,
      actionTypes,
      page: pageNum,
      per_page: perPage,
      total_pages: Math.ceil(filteredEvents.length / perPage),
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
