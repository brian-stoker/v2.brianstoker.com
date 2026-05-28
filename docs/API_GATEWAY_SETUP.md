# API Gateway Setup for Next.js Lambda

This document explains the API Gateway configuration that works around the broken Lambda Function URL service in AWS account 167217327520.

## Problem

AWS account 167217327520 (created 2026-04-17) has a broken Lambda Function URL service. All Lambda Function URLs return `AccessDeniedException` regardless of `AuthType` setting, even with no credentials. This is an account-level block, not a configuration issue.

## Solution

We use API Gateway HTTP API as a proxy in front of the Lambda function:

```
CloudFront (E1JN9JWBQ37JT2)
  ↓ (with x-cloudfront-secret header)
API Gateway HTTP API
  ↓ (Lambda Authorizer validates secret)
Lambda Function (Next.js via OpenNext)
```

### Architecture Components

1. **SST Next.js Component** (`stacks/site.ts`)
   - Creates the Next.js Lambda function via OpenNext
   - Creates CloudFront distribution (with default Lambda Function URL origins that we'll replace)
   - Creates S3 bucket for assets

2. **API Gateway HTTP API** (`stacks/apigateway.ts`)
   - HTTP API (not REST API) for lower latency
   - $default route catches all paths
   - AWS_PROXY integration to Lambda function
   - No custom domain (uses default execute-api domain)

3. **Lambda Authorizer** (`stacks/authorizer.ts`, `stacks/authorizer-handler.ts`)
   - Validates `x-cloudfront-secret` header
   - Uses simple response format (boolean allow/deny)
   - Prevents direct access to API Gateway

4. **CloudFront Secret** (SST Secret)
   - Shared secret between CloudFront and API Gateway
   - Stored in AWS Secrets Manager via SST
   - Generated during first deployment

### Security

- **CloudFront Secret Header**: CloudFront adds `x-cloudfront-secret` header to all origin requests
- **Lambda Authorizer**: API Gateway validates the secret before forwarding to Lambda
- **No OAC Required**: OAC (Origin Access Control) was for Lambda Function URLs; not needed for API Gateway
- **HTTPS Only**: CloudFront → API Gateway communication is HTTPS only

## Deployment

### First-Time Setup

```bash
# 1. Deploy the full stack with API Gateway
AWS_PROFILE=stokd-cloud ./scripts/deploy-with-apigateway.sh
```

This script:
1. Creates/retrieves the CloudFront secret
2. Sets it in SST secrets
3. Deploys SST stack (Next.js + API Gateway)
4. Updates CloudFront origins to use API Gateway

### Subsequent Deployments

```bash
# Regular deployment (no CloudFront changes needed)
AWS_PROFILE=stokd-cloud pnpm deploy:prod
```

### Manual CloudFront Update

If you need to update CloudFront origins separately:

```bash
# Export the secret
export CLOUDFRONT_SECRET=$(aws --profile stokd-cloud secretsmanager get-secret-value \
  --secret-id CloudFrontSecret \
  --query SecretString \
  --output text)

# Run the update script
AWS_PROFILE=stokd-cloud node scripts/update-cloudfront-origins.js
```

## Infrastructure Files

### SST Configuration

- `sst.config.ts` - Main SST config, instantiates API Gateway
- `stacks/apigateway.ts` - API Gateway HTTP API creation
- `stacks/authorizer.ts` - Lambda authorizer setup
- `stacks/authorizer-handler.ts` - Authorizer Lambda code
- `stacks/site.ts` - Next.js site (unchanged)

### Scripts

- `scripts/deploy-with-apigateway.sh` - Complete deployment workflow
- `scripts/update-cloudfront-origins.js` - Updates CloudFront to use API Gateway

## CloudFront Configuration

### Origins Changed

- **default** origin: `{lambda-url}` → `{api-id}.execute-api.us-east-1.amazonaws.com`
- **imageOptimizer** origin: `{lambda-url}` → `{api-id}.execute-api.us-east-1.amazonaws.com`
- **s3** origin: Unchanged (still uses OAC)

### Custom Headers Added

Both `default` and `imageOptimizer` origins now include:
```json
{
  "HeaderName": "x-cloudfront-secret",
  "HeaderValue": "<secret-from-secrets-manager>"
}
```

### OAC Removed

`OriginAccessControlId` removed from `default` and `imageOptimizer` origins (not applicable to API Gateway).

## Testing

### Verify API Gateway

```bash
# Get API Gateway URL from SST outputs
pnpm sst outputs --stage production

# Should return 403 (no secret header)
curl https://{api-id}.execute-api.us-east-1.amazonaws.com

# Should work (with secret header)
curl -H "x-cloudfront-secret: $CLOUDFRONT_SECRET" \
  https://{api-id}.execute-api.us-east-1.amazonaws.com
```

### Verify CloudFront

```bash
# Should work (CloudFront adds secret header)
curl https://brian.stokd.cloud
```

### Check CloudFront Origins

```bash
aws --profile stokd-cloud cloudfront get-distribution-config \
  --id E1JN9JWBQ37JT2 | \
  jq '.DistributionConfig.Origins.Items[] | select(.Id == "default" or .Id == "imageOptimizer")'
```

## Troubleshooting

### API Gateway returns 403

Check authorizer logs:
```bash
aws --profile stokd-cloud logs tail /aws/lambda/ApiGatewayAuthorizer --follow
```

### CloudFront still uses Lambda URLs

Re-run the update script:
```bash
AWS_PROFILE=stokd-cloud ./scripts/deploy-with-apigateway.sh
```

### Secret mismatch

Regenerate and redeploy:
```bash
# Update secret in Secrets Manager
aws --profile stokd-cloud secretsmanager update-secret \
  --secret-id CloudFrontSecret \
  --secret-string "$(openssl rand -base64 32)"

# Update SST secret
pnpm sst secret set CloudFrontSecret "$(openssl rand -base64 32)" --stage production

# Update CloudFront
AWS_PROFILE=stokd-cloud node scripts/update-cloudfront-origins.js
```

## Resources

- [API Gateway HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html)
- [Lambda Authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-lambda-authorizer.html)
- [CloudFront Origins](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistS3AndCustomOrigins.html)
- [OpenNext](https://open-next.js.org/)
- [SST](https://sst.dev/)
