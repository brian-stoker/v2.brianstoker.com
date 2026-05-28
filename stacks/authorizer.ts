/// <reference path="../.sst/platform/config.d.ts" />
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

/**
 * Creates a Lambda authorizer for API Gateway that validates the CloudFront secret header.
 *
 * This ensures that requests can only come through CloudFront, not directly to the API Gateway.
 * The authorizer checks for the x-cloudfront-secret header and compares it to the stored secret.
 */

export const createApiGatewayAuthorizer = (
  httpApi: aws.apigatewayv2.Api,
  cloudfrontSecret: pulumi.Output<string>
) => {
  // Create the authorizer Lambda function
  const authorizerFunction = new sst.aws.Function("ApiGatewayAuthorizer", {
    handler: "stacks/authorizer-handler.handler",
    environment: {
      CLOUDFRONT_SECRET: cloudfrontSecret,
    },
    description: "Validates CloudFront secret header for API Gateway requests",
  });

  // Create the Lambda authorizer
  const authorizer = new aws.apigatewayv2.Authorizer("ApiGatewayLambdaAuthorizer", {
    apiId: httpApi.id,
    authorizerType: "REQUEST",
    authorizerUri: authorizerFunction.nodes.function.invokeArn,
    identitySources: ["$request.header.x-cloudfront-secret"],
    name: "CloudFrontSecretAuthorizer",
    authorizerPayloadFormatVersion: "2.0",
    enableSimpleResponses: true,
  });

  // Grant API Gateway permission to invoke the authorizer Lambda
  const permission = new aws.lambda.Permission("AuthorizerInvokePermission", {
    action: "lambda:InvokeFunction",
    function: authorizerFunction.nodes.function.name,
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${httpApi.executionArn}/authorizers/${authorizer.id}`,
  });

  return {
    authorizer,
    authorizerFunction,
    permission,
  };
};
