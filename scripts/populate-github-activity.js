// Script to populate GitHub activity data
const fetch = require('node-fetch');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Initialize S3 client - will use credentials from profile
const s3Client = new S3Client({
  region: 'us-east-1',
});

const S3_BUCKET = 'cenv-public';
const S3_KEY = 'brian-stoker-github-activity.json';

// Helper function to determine activity level based on count
const getActivityLevel = (count) => {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
};

// Helper function to fetch GitHub events with pagination
const fetchAllGitHubEvents = async () => {
  const githubToken = process.env.GITHUB_TOKEN;
  const githubUser = process.env.GITHUB_USERNAME || 'brian-stoker';

  if (!githubToken) {
    throw new Error('GitHub token not configured');
  }

  let allEvents = [];
  let page = 1;
  let hasMorePages = true;
  
  console.log(`Fetching GitHub events for user: ${githubUser}`);
  
  // Fetch all available pages (GitHub limits to 90 days of activity)
  while (hasMorePages) {
    console.log(`Fetching page ${page}...`);
    
    const response = await fetch(`https://api.github.com/users/${githubUser}/events?page=${page}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        'User-Agent': 'brianstoker.com-website',
      },
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      hasMorePages = false;
    } else {
      allEvents = [...allEvents, ...data];
      page++;
      
      // Check rate limit headers
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      const rateLimitReset = response.headers.get('x-ratelimit-reset');
      
      console.log(`Rate limit remaining: ${rateLimitRemaining}`);
      
      if (rateLimitRemaining && parseInt(rateLimitRemaining) < 10) {
        const resetTime = new Date(parseInt(rateLimitReset) * 1000);
        console.log(`Rate limit low. Will reset at: ${resetTime.toLocaleString()}`);
        
        // If rate limit is very low, wait a bit before continuing
        if (parseInt(rateLimitRemaining) < 5) {
          console.log('Waiting 60 seconds before continuing...');
          await new Promise(resolve => setTimeout(resolve, 60000));
        }
      }
    }
  }
  
  console.log(`Fetched ${allEvents.length} events in total`);
  return allEvents;
};

// Helper function to process events into activity data
const processEventsToActivityData = (events) => {
  // Group events by date
  const eventsByDate = {};
  
  events.forEach(event => {
    const date = event.created_at.split('T')[0]; // Extract YYYY-MM-DD
    eventsByDate[date] = (eventsByDate[date] || 0) + 1;
  });
  
  // Convert to activity data format
  return Object.entries(eventsByDate).map(([date, count]) => ({
    date,
    count,
    level: getActivityLevel(count)
  }));
};

// Helper function to write to S3
const writeToS3 = async (data) => {
  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: S3_KEY,
      Body: JSON.stringify(data),
      ContentType: 'application/json',
    });
    
    await s3Client.send(command);
    console.log('Successfully wrote data to S3');
  } catch (error) {
    console.error('Error writing to S3:', error);
    throw error;
  }
};

// Main function
const populateGitHubActivity = async () => {
  try {
    console.log('Starting GitHub activity data population...');
    
    // Fetch all GitHub events
    const events = await fetchAllGitHubEvents();
    
    // Process events into activity data
    const activityData = processEventsToActivityData(events);
    
    // Create response with current timestamp
    const response = {
      data: activityData,
      lastUpdated: new Date().toISOString()
    };
    
    // Write to S3
    await writeToS3(response);
    
    console.log(`Successfully populated GitHub activity data with ${activityData.length} days of activity`);
  } catch (error) {
    console.error('Error populating GitHub activity:', error);
  }
};

// Run the script
populateGitHubActivity(); 