import type { NextApiRequest, NextApiResponse } from 'next'
import { getDatabase } from '../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      return res.status(500).json({ message: 'Database not available' });
    }

    const eventsCollection = db.collection('github_events');

    // Get unique repositories and event types
    // These queries use the indexes we created, so they should be fast
    const repositories = await eventsCollection.distinct('repo.name');
    const eventTypes = await eventsCollection.distinct('type');

    // Transform event types (remove 'Event' suffix)
    const actionTypes = eventTypes.map((t: string) => t.replace('Event', '')).sort();

    // Sort repositories
    const sortedRepositories = repositories.sort();

    return res.status(200).json({
      repositories: sortedRepositories,
      actionTypes,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching GitHub event filters:', error);
    return res.status(500).json({
      message: 'Error fetching filters',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
