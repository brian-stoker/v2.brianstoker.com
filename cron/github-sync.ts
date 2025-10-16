export const handler = async () => {
  try {
    const syncEndpoint = process.env.SYNC_ENDPOINT;
    const syncSecret = process.env.SYNC_SECRET;

    if (!syncEndpoint) {
      console.error('SYNC_ENDPOINT environment variable is not set');
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'SYNC_ENDPOINT not configured' })
      };
    }

    if (!syncSecret) {
      console.error('SYNC_SECRET environment variable is not set');
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'SYNC_SECRET not configured' })
      };
    }

    console.log('Starting GitHub events sync...');

    const response = await fetch(syncEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${syncSecret}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Sync failed:', data);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          message: 'Sync failed',
          error: data
        })
      };
    }

    console.log('Sync completed successfully:', data);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'GitHub events synced successfully',
        data
      })
    };

  } catch (error) {
    console.error('Error during GitHub sync cron:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error during sync',
        error: error instanceof Error ? error.message : String(error)
      })
    };
  }
};
