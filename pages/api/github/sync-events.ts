import type { NextApiRequest, NextApiResponse } from 'next';
import { syncGitHubEvents } from '../../../lib/github-sync';
import type { SyncGitHubEventsError } from '../../../lib/github-sync';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const result = await syncGitHubEvents({
      fullRefresh: req.query.fullRefresh === 'true',
    });

    return res.status(200).json(result);
  } catch (error) {
    const syncError = error as SyncGitHubEventsError;

    return res.status(syncError.statusCode || 500).json({
      message: 'Error during sync',
      error: syncError.message,
      ...(syncError.details ? syncError.details : {}),
    });
  }
}
