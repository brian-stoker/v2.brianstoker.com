/// <reference path="../.sst/platform/config.d.ts" />

import { DomainInfo } from "./domains";

export const createAlbyHubApi = (domainInfo: DomainInfo) => {
  const secretName = `albyhub/secrets/${$app.stage}`;

  // Custom domain configuration for Lightning Address
  // Subdomain approach: albyhub.brianstoker.com
  // This is safer than using the main domain and allows separation of concerns
  const customDomain = $app.stage === "production"
    ? `albyhub.${domainInfo.domains[0]}`
    : undefined;

  // Environment variables for AlbyHub Lambda
  const envVars = {
    NODE_ENV: $app.stage === "production" ? "production" : "development",
    APP_VERSION: "1.0.0",
    LOG_LEVEL: $app.stage === "production" ? "warn" : "debug",
    SECRETS_MANAGER_NAME: secretName,
    AWS_REGION: $app.providers?.aws?.region || "us-east-1",
    // Custom Domain Configuration
    CUSTOM_DOMAIN: customDomain || "",
    // LNURL Configuration
    MIN_SENDABLE: "1000",
    MAX_SENDABLE: "100000000",
    COMMENT_ALLOWED: "280",
    LNURL_CALLBACK_URL:
      $app.stage === "production"
        ? `https://albyhub.${domainInfo.domains[0]}/lnurl/callback`
        : "http://localhost:3000/lnurl/callback",
  };

  // Create the AlbyHub Lambda function
  const albyHubFunction = new sst.aws.Function("AlbyHubFunction", {
    handler: "albyhub/dist/lambda.handler",
    runtime: "nodejs20.x",
    memory: "512 MB",
    timeout: "29 seconds",
    architecture: "arm64",
    environment: envVars,
    permissions: [
      {
        actions: ["secretsmanager:GetSecretValue"],
        resources: [`arn:aws:secretsmanager:*:*:secret:${secretName}-*`],
      },
    ],
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
  // Custom domain configuration for Lightning Address (LNURL-pay)
  // DNS Records Required:
  //   - CNAME: albyhub.brianstoker.com -> <api-gateway-domain>
  // SSL/TLS:
  //   - Certificate in ACM (us-east-1 region)
  //   - Auto-managed by SST via API Gateway custom domain
  // Endpoints exposed:
  //   - GET /.well-known/lnurlp/pay (Lightning Address metadata)
  //   - GET /lnurl/callback (LNURL-pay callback for invoice generation)
  //   - GET /health (Health check)
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
