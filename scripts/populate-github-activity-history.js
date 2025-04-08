// Script to populate GitHub activity data with years of history
import fetch from 'node-fetch';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

// Helper function to format date for GraphQL
const formatDateForGraphQL = (date) => {
  return date.toISOString(); // Returns format: YYYY-MM-DDTHH:mm:ss.sssZ
};

// Helper function to fetch contribution data for a specific year
const fetchYearContributionData = async (startDate, endDate, githubToken, githubUser) => {
  console.log(`Fetching data from ${startDate.toISOString()} to ${endDate.toISOString()}`);
  
  const query = `
    query($username: String!, $fromDate: DateTime!, $toDate: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $fromDate, to: $toDate, includePrivateContributions: true) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;
  
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { 
        username: githubUser,
        fromDate: formatDateForGraphQL(startDate),
        toDate: formatDateForGraphQL(endDate)
      },
    }),
  });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  const result = await response.json();
  
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }
  
  const contributionData = result.data.user.contributionsCollection.contributionCalendar;
  console.log(`Total contributions for this period: ${contributionData.totalContributions}`);
  
  // Process the contribution data
  const activityData = [];
  
  contributionData.weeks.forEach(week => {
    week.contributionDays.forEach(day => {
      if (day.contributionCount > 0) {
        activityData.push({
          date: day.date,
          count: day.contributionCount,
          level: getActivityLevel(day.contributionCount)
        });
      }
    });
  });
  
  return activityData;
};

// Helper function to fetch contribution data using GraphQL
const fetchContributionData = async () => {
  const githubToken = process.env.GITHUB_TOKEN;
  const githubUser = process.env.GITHUB_USERNAME || 'brian-stoker';

  if (!githubToken) {
    throw new Error('GitHub token not configured');
  }

  console.log(`Fetching contribution data for user: ${githubUser}`);
  
  // Calculate date ranges for the past 5 years
  const endDate = new Date();
  let allActivityData = [];
  
  // Fetch data year by year
  for (let i = 0; i < 5; i++) {
    const yearEndDate = new Date(endDate);
    yearEndDate.setFullYear(endDate.getFullYear() - i);
    
    const yearStartDate = new Date(yearEndDate);
    yearStartDate.setFullYear(yearEndDate.getFullYear() - 1);
    
    // Add a small delay between requests to avoid rate limiting
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const yearData = await fetchYearContributionData(yearStartDate, yearEndDate, githubToken, githubUser);
    allActivityData = [...allActivityData, ...yearData];
  }
  
  // Sort the data by date
  allActivityData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  console.log(`Processed ${allActivityData.length} total days of activity data`);
  return allActivityData;
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
const populateGitHubActivityHistory = async () => {
  try {
    console.log('Starting GitHub activity history population...');
    
    // Fetch contribution data
    const activityData = await fetchContributionData();
    
    // Create response with current timestamp
    const response = {
      data: activityData,
      lastUpdated: new Date().toISOString()
    };
    
    // Write to S3
    await writeToS3(response);
    
    console.log(`Successfully populated GitHub activity data with ${activityData.length} days of activity`);
  } catch (error) {
    console.error('Error populating GitHub activity history:', error);
  }
};

// Run the script
populateGitHubActivityHistory(); 