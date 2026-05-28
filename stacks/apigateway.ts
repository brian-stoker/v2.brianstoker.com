/// <reference path="../.sst/platform/config.d.ts" />
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { createApiGatewayAuthorizer } from "./authorizer";

/**
 * Creates an API Gateway HTTP API that fronts the Next.js Lambda function.
 *
 * This is a workaround for AWS account 167217327520's broken Lambda Function URL service.
 * The API Gateway provides an HTTP endpoint that CloudFront can route to instead of
 * the broken Lambda Function URLs.
 *
 * Architecture:
 * CloudFront → API Gateway HTTP API (with Lambda Authorizer) → Lambda (Next.js function)
 *
 * After deploying this stack, update CloudFront origins by running:
 *   AWS_PROFILE=stokd-cloud ./scripts/deploy-with-apigateway.sh
 */

export const createNextJsApiGateway = (nextJsSite: any) => {
  // Generate a shared secret for CloudFront → API Gateway authentication
  const cloudfrontSecret = new sst.Secret("CloudFrontSecret");

  // Get the server function - it's an Output<Function> so we need to handle it properly
  const serverFunction = nextJsSite.nodes.server;

  // Create HTTP API Gateway
  const httpApi = new aws.apigatewayv2.Api("NextJsApi", {
    protocolType: "HTTP",
    description: "API Gateway for Next.js Lambda (workaround for broken Function URLs)",
  });

  // Create Lambda authorizer to validate CloudFront secret
  const { authorizer, authorizerFunction } = createApiGatewayAuthorizer(
    httpApi,
    cloudfrontSecret.value
  );

  // Create Lambda integration using pulumi.all to handle Output types
  const integration = pulumi.all([serverFunction]).apply(([fn]) => {
    return new aws.apigatewayv2.Integration("NextJsApiIntegration", {
      apiId: httpApi.id,
      integrationType: "AWS_PROXY",
      integrationUri: fn.nodes.function.invokeArn,
      integrationMethod: "POST",
      payloadFormatVersion: "2.0",
      timeoutMilliseconds: 30000,
    });
  });

  // Create catch-all route ($default handles all unmatched routes)
  const route = pulumi.all([integration, authorizer]).apply(([integ, auth]) => {
    return new aws.apigatewayv2.Route("NextJsApiDefaultRoute", {
      apiId: httpApi.id,
      routeKey: "$default",
      target: pulumi.interpolate`integrations/${integ.id}`,
      authorizationType: "CUSTOM",
      authorizerId: auth.id,
    });
  });

  // Create $default stage (required for HTTP API to be accessible)
  const stage = new aws.apigatewayv2.Stage("NextJsApiStage", {
    apiId: httpApi.id,
    name: "$default",
    autoDeploy: true,
    description: "Default stage for Next.js API Gateway",
  });

  // Grant API Gateway permission to invoke the Lambda function
  const permission = pulumi.all([serverFunction]).apply(([fn]) => {
    return new aws.lambda.Permission("NextJsApiInvokePermission", {
      action: "lambda:InvokeFunction",
      function: fn.nodes.function.name,
      principal: "apigateway.amazonaws.com",
      sourceArn: pulumi.interpolate`${httpApi.executionArn}/*/*`,
    });
  });

  const invokeUrl = pulumi.interpolate`${httpApi.apiEndpoint}`;

  return {
    httpApi,
    integration,
    route,
    stage,
    permission,
    authorizer,
    authorizerFunction,
    invokeUrl,
    cloudfrontSecret: cloudfrontSecret.value,
  };
};
