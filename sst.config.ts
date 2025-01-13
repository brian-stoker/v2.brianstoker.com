/// <reference path="./.sst/platform/config.d.ts" />
const domains = ["brianstoker.com", "www.brianstoker.com"];
export default $config({
  app(input) {
    return {
      name: "brianstoker-com",
      removal: input?.stage === "prod" ? "retain" : "remove",
      protect: ["prod"].includes(input?.stage),
      home: "aws",
      providers: { aws: "6.66.2" },
    };
  },
  async run() {
    new sst.aws.Nextjs("brianstoker-com", {
      domain: {
        name: domains.pop()!,
        aliases: domains, // Assumes the domain is in Route 53
      },
      environment: {
        runtime: "nodejs20.x", // Match the Node.js runtime
      },
    });
  },
});
