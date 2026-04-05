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

    // Get repo stats (count + most recent event + recent event types) via aggregation
    const repoAggregation = await eventsCollection.aggregate([
      { $sort: { created_at: -1 } },
      { $group: {
        _id: '$repo.name',
        count: { $sum: 1 },
        lastEventDate: { $max: '$created_at' },
        recentTypes: { $push: '$type' }
      }},
      { $project: {
        count: 1,
        lastEventDate: 1,
        recentTypes: { $slice: ['$recentTypes', 8] }
      }},
      { $sort: { lastEventDate: -1 } }
    ]).toArray();

    const eventTypes = await eventsCollection.distinct('type');

    // Transform event types (remove 'Event' suffix)
    const actionTypes = eventTypes.map((t: string) => t.replace('Event', '')).sort();

    // Repos sorted by most recent activity
    const sortedRepositories = repoAggregation.map(r => r._id as string);

    // Per-repo stats for mobile strip
    const repositoryStats = repoAggregation.map(r => ({
      name: r._id as string,
      count: r.count as number,
      lastEventDate: r.lastEventDate as string,
      recentTypes: r.recentTypes as string[]
    }));

    return res.status(200).json({
      repositories: sortedRepositories,
      repositoryStats,
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
