/// <reference path="../.sst/platform/config.d.ts" />

import { DomainInfo } from "./domains";

export const createAlbyHubApi = (domainInfo: DomainInfo) => {
  // Environment variables for AlbyHub Lambda
  const envVars = {
    NODE_ENV: $app.stage === "production" ? "production" : "development",
    APP_VERSION: "1.0.0",
    LOG_LEVEL: $app.stage === "production" ? "warn" : "debug",
  };

  // Create the AlbyHub Lambda function
  const albyHubFunction = new sst.aws.Function("AlbyHubFunction", {
    handler: "albyhub/dist/lambda.handler",
    runtime: "nodejs20.x",
    memory: "512 MB",
    timeout: "29 seconds",
    architecture: "arm64",
    environment: envVars,
    nodejs: {
      esbuild: {
        bundle: true,
        minify: $app.stage === "production",
        sourcemap: true,
        external: [
          "@nestjs/microservices",
          "@nestjs/websockets",
          "cache-manager",
          "class-transformer/storage",
        ],
      },
    },
  });

  // Create CloudWatch log group with retention
  const logGroup = new sst.aws.CloudWatchLogGroup("AlbyHubLogs", {
    name: `/aws/lambda/${albyHubFunction.name}`,
    retentionInDays: 30,
  });

  // Create API Gateway with AlbyHub routes
  const albyHubApi = new sst.aws.ApiGatewayV2(
    "AlbyHubApi",
    $dev
      ? {
          cors: {
            allowOrigins: ["*"],
            allowHeaders: [
              "Content-Type",
              "Authorization",
              "X-Requested-With",
            ],
            allowMethods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
            allowCredentials: false,
          },
        }
      : {
          domain: {
            name: `albyhub.${domainInfo.domains[0]}`,
            dns: sst.cloudflare.dns(),
          },
          cors: {
            allowOrigins: [
              `https://${domainInfo.domains[0]}`,
              `https://www.${domainInfo.domains[0]}`,
            ],
            allowHeaders: [
              "Content-Type",
              "Authorization",
              "X-Requested-With",
            ],
            allowMethods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
            allowCredentials: true,
          },
        }
  );

  // Route all requests to the AlbyHub Lambda function
  albyHubApi.route("GET /health", albyHubFunction.arn);
  albyHubApi.route("GET /{proxy+}", albyHubFunction.arn);
  albyHubApi.route("POST /{proxy+}", albyHubFunction.arn);
  albyHubApi.route("PUT /{proxy+}", albyHubFunction.arn);
  albyHubApi.route("PATCH /{proxy+}", albyHubFunction.arn);
  albyHubApi.route("DELETE /{proxy+}", albyHubFunction.arn);

  console.log(
    `✓ AlbyHub API configured${!$dev ? ` at: https://albyhub.${domainInfo.domains[0]}` : ""}`
  );

  return {
    api: albyHubApi,
    function: albyHubFunction,
    logGroup,
  };
};
