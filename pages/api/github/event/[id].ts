import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Event ID required' });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const eventsCollection = db.collection('github_events');
    const event = await eventsCollection.findOne({ id });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Remove MongoDB _id field
    const { _id, ...eventData } = event;

    res.status(200).json(eventData);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
}
