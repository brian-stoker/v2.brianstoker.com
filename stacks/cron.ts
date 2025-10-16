/// <reference path="../.sst/platform/config.d.ts" />

export const createGithubSyncCron = (siteUrl: string) => {
  // Create a cron job that runs every hour to sync GitHub events
  const syncEndpoint = `${siteUrl}/api/github/sync-events`;

  const githubSyncCron = new sst.aws.Cron("GithubSyncCron", {
    schedule: "rate(1 hour)",
    job: {
      handler: "cron/github-sync.handler",
      timeout: "5 minutes",
      environment: {
        GITHUB_TOKEN: process.env.GITHUB_TOKEN!,
        GITHUB_USERNAME: process.env.GITHUB_USERNAME || 'brian-stoker',
        MONGODB_URI: process.env.MONGODB_URI!,
        SYNC_SECRET: process.env.SYNC_SECRET!,
        SYNC_ENDPOINT: syncEndpoint
      }
    }
  });

  console.log(`✓ GitHub sync cron configured to call: ${syncEndpoint}`);
  return githubSyncCron;
};
