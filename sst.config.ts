/// <reference path="./.sst/platform/config.d.ts" />


if (!process.env.ROOT_DOMAIN) {
  throw new Error("ROOT_DOMAIN environment variable is required");
}

export default $config({
  app(input) {
    return {
      name: "brianstoker-com",
      /*removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),*/
      home: "aws",
    };
  },
  async run() {
    // Apply our externals configuration to SST's build process
    process.env.SST_ESBUILD_CONFIG_TRANSFORMER = "addExternals";
    const { createSite, createApi, getDomainInfo, createGithubSyncCron } = await import("./stacks");
    process.env.SST_STAGE = $app.stage || "local";

    const domainInfo = getDomainInfo(process.env.ROOT_DOMAIN!, $app.stage);
    const web = createSite(domainInfo);

    // Build site URL for cron job
    const siteUrl = $app.stage === "production"
      ? `https://${domainInfo.domains[0]}`
      : "http://localhost:5040";

    const githubSyncCron = createGithubSyncCron(siteUrl);

    return {
      ...web,
      cron: githubSyncCron.name,
    };
  },
});
