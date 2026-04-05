import { syncGitHubEvents } from '../lib/github-sync';
import type { SyncGitHubEventsError } from '../lib/github-sync';

export const handler = async () => {
  try {
    console.log('Starting GitHub events sync...');

    const data = await syncGitHubEvents();

    console.log('Sync completed successfully:', data);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'GitHub events synced successfully',
        data,
      }),
    };
  } catch (error) {
    const syncError = error as SyncGitHubEventsError;

    console.error('Error during GitHub sync cron:', syncError);
    return {
      statusCode: syncError.statusCode || 500,
      body: JSON.stringify({
        message: 'Error during sync',
        error: syncError.message,
        ...(syncError.details ? syncError.details : {}),
      }),
    };
  }
};
