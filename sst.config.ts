/// <reference path="./.sst/platform/config.d.ts" />

import {getDomainInfo} from "./infra/domains";

if (!process.env.ROOT_DOMAIN) {
  throw new Error("ROOT_DOMAIN environment variable is required");
}

export default $config({
  app(input) {
    return {
      name: getDomainInfo(process.env.ROOT_DOMAIN!, input.stage).appName,
      removal: input.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input.stage),
      home: "aws",
    }
  },
  async run() {
    const { createSite, createApi } = await import('./infra');
    const domainInfo = getDomainInfo(process.env.ROOT_DOMAIN!, $app.stage);
    createSite(domainInfo);
    createApi(domainInfo);
  },
});
