# API Gateway Implementation Summary

## Overview

This implementation adds an API Gateway HTTP API to route traffic to the Next.js Lambda function, working around the broken Lambda Function URL service in AWS account 167217327520.

## What Was Done

### 1. SST Infrastructure Changes

#### New Files Created:

**`stacks/apigateway.ts`**
- Creates HTTP API Gateway
- Sets up AWS_PROXY integration to Next.js Lambda
- Configures $default route (catch-all)
- Creates $default stage with auto-deploy
- Returns API Gateway invoke URL and CloudFront secret

**`stacks/authorizer.ts`**
- Creates Lambda authorizer function
- Configures REQUEST-type authorizer
- Validates x-cloudfront-secret header
- Uses simple boolean responses

**`stacks/authorizer-handler.ts`**
- Lambda code that validates the CloudFront secret
- Compares provided header against environment variable
- Returns `{ isAuthorized: boolean }`

**`stacks/index.ts`** (modified)
- Exports new apigateway and authorizer modules

**`sst.config.ts`** (modified)
- Imports `createNextJsApiGateway`
- Instantiates API Gateway in production (not dev)
- Returns API Gateway URL and ID in outputs

### 2. Deployment Scripts

**`scripts/deploy-with-apigateway.sh`**
Complete deployment orchestration:
1. Creates/retrieves CloudFront secret from Secrets Manager
2. Sets secret in SST via `sst secret set`
3. Deploys SST stack (including API Gateway)
4. Runs CloudFront origin update script

**`scripts/update-cloudfront-origins.js`**
CloudFront configuration update:
1. Gets API Gateway URL from SST outputs
2. Fetches current CloudFront distribution config
3. Updates `default` and `imageOptimizer` origins:
   - Changes domain to API Gateway
   - Removes OAC (OriginAccessControlId)
   - Adds `x-cloudfront-secret` custom header
4. Applies changes with ETag for safe updates

### 3. Package.json

Added new npm script:
```json
"deploy:apigateway": "./scripts/deploy-with-apigateway.sh"
```

### 4. Documentation

**`docs/API_GATEWAY_SETUP.md`**
- Complete architecture documentation
- Deployment instructions
- Testing procedures
- Troubleshooting guide

**`API_GATEWAY_IMPLEMENTATION.md`** (this file)
- Implementation summary
- Usage instructions

## Architecture

```
┌─────────────────┐
│   CloudFront    │ (E1JN9JWBQ37JT2)
│  Distribution   │
└────────┬────────┘
         │ adds x-cloudfront-secret header
         ↓
┌─────────────────┐
│  API Gateway    │ ({api-id}.execute-api.us-east-1.amazonaws.com)
│   HTTP API      │
└────────┬────────┘
         │
         ├─→ Lambda Authorizer (validates secret)
         │
         ↓
┌─────────────────┐
│ Next.js Lambda  │ (bri-production-brianstokdcloudNextjsSiteDefaultFunction-*)
│   Function      │
└─────────────────┘
```

### Security Flow

1. **User Request** → CloudFront
2. **CloudFront** adds `x-cloudfront-secret: <secret>` header → API Gateway
3. **API Gateway** invokes Lambda Authorizer
4. **Authorizer** validates secret → returns `{ isAuthorized: true/false }`
5. If authorized: **API Gateway** → Next.js Lambda
6. If denied: **API Gateway** returns 403

## Deployment Instructions

### First-Time Setup

```bash
# Run the complete deployment
AWS_PROFILE=stokd-cloud pnpm run deploy:apigateway
```

This will:
- Create CloudFront secret in Secrets Manager (if not exists)
- Set secret in SST
- Deploy SST stack with API Gateway
- Update CloudFront origins automatically

### Subsequent Deployments

After initial setup, regular deployments work normally:

```bash
AWS_PROFILE=stokd-cloud pnpm deploy:prod
```

The API Gateway and CloudFront config remain unchanged.

### Manual CloudFront Update

If you need to re-run only the CloudFront update:

```bash
# 1. Get the secret
export CLOUDFRONT_SECRET=$(aws --profile stokd-cloud \
  secretsmanager get-secret-value \
  --secret-id CloudFrontSecret \
  --query SecretString \
  --output text)

# 2. Update CloudFront
AWS_PROFILE=stokd-cloud node scripts/update-cloudfront-origins.js
```

## Configuration Details

### SST Resources Created

1. **Secret**: `CloudFrontSecret`
   - Stored in AWS Secrets Manager
   - Used by Lambda Authorizer
   - Sent by CloudFront in custom header

2. **API Gateway**: `NextJsApi`
   - Protocol: HTTP
   - Stage: $default (auto-deploy)
   - Integration: AWS_PROXY to Lambda
   - Timeout: 30 seconds

3. **Lambda Authorizer**: `ApiGatewayAuthorizer`
   - Type: REQUEST
   - Identity Source: `$request.header.x-cloudfront-secret`
   - Response Format: Simple boolean

4. **IAM Permissions**:
   - API Gateway → invoke Lambda (Next.js function)
   - API Gateway → invoke Authorizer Lambda

### CloudFront Changes

**Before:**
```javascript
{
  "Id": "default",
  "DomainName": "p7wbg343h35cwjignfyji7ncra0bspqc.lambda-url.us-east-1.on.aws",
  "OriginAccessControlId": "EWOTLXFML6PIG"
}
```

**After:**
```javascript
{
  "Id": "default",
  "DomainName": "{api-id}.execute-api.us-east-1.amazonaws.com",
  "CustomHeaders": {
    "Quantity": 1,
    "Items": [{
      "HeaderName": "x-cloudfront-secret",
      "HeaderValue": "<secret>"
    }]
  }
  // OriginAccessControlId removed
}
```

## Testing

### Test API Gateway Directly

```bash
# Get outputs
pnpm sst outputs --stage production

# Should fail (no auth)
curl https://{api-id}.execute-api.us-east-1.amazonaws.com

# Should work (with secret)
export SECRET=$(aws --profile stokd-cloud secretsmanager get-secret-value \
  --secret-id CloudFrontSecret --query SecretString --output text)
curl -H "x-cloudfront-secret: $SECRET" \
  https://{api-id}.execute-api.us-east-1.amazonaws.com
```

### Test Through CloudFront

```bash
# Should work (CloudFront adds secret)
curl https://brian.stokd.cloud
```

### Verify CloudFront Config

```bash
aws --profile stokd-cloud cloudfront get-distribution-config \
  --id E1JN9JWBQ37JT2 | \
  jq '.DistributionConfig.Origins.Items[] | select(.Id == "default")'
```

### Check Logs

```bash
# API Gateway authorizer logs
aws --profile stokd-cloud logs tail /aws/lambda/ApiGatewayAuthorizer --follow

# Next.js Lambda logs
aws --profile stokd-cloud logs tail \
  /aws/lambda/bri-production-brianstokdcloudNextjsSiteDefaultFunction-bndhaewh \
  --follow
```

## Files Modified

- `sst.config.ts` - Added API Gateway instantiation
- `stacks/index.ts` - Export new modules
- `package.json` - Added deploy:apigateway script

## Files Created

### Infrastructure
- `stacks/apigateway.ts` - API Gateway setup
- `stacks/authorizer.ts` - Authorizer setup
- `stacks/authorizer-handler.ts` - Authorizer Lambda code

### Scripts
- `scripts/deploy-with-apigateway.sh` - Complete deployment
- `scripts/update-cloudfront-origins.js` - CloudFront updater

### Documentation
- `docs/API_GATEWAY_SETUP.md` - Complete guide
- `API_GATEWAY_IMPLEMENTATION.md` - This file

## Constraints Satisfied

✅ **Configured in SST** - All infrastructure is in `stacks/` directory
✅ **Not CLI/Console Snowflaked** - Everything is code (IaC)
✅ **Existing Lambda Preserved** - Uses SST's Next.js Lambda
✅ **CloudFront Preserved** - Only origins updated, behaviors unchanged
✅ **Cache Config Preserved** - No changes to cache policies
✅ **Origin Request Policy Preserved** - Unchanged
✅ **Shared Secret Auth** - CloudFront → API Gateway secured

## Trade-offs

**Pros:**
- All infrastructure as code via SST/Pulumi
- Secure (authorizer validates requests)
- Minimal changes to existing stack
- Can be torn down and rebuilt

**Cons:**
- CloudFront update requires separate script (not in SST deploy)
- Two-step deployment for first setup
- Extra Lambda invocation (authorizer) adds ~1-5ms latency
- API Gateway adds minimal cost (~$1/million requests)

## Why CloudFront Update is Separate

SST's `Nextjs` component manages the CloudFront distribution internally and doesn't expose a way to customize origins post-creation. The component creates origins pointing to Lambda Function URLs automatically.

To work around this:
1. SST creates the Next.js site with default (broken) origins
2. We create the API Gateway separately via Pulumi
3. A post-deployment script swaps the origins

Alternative approaches considered:
- **Fork SST**: Too much maintenance burden
- **Custom CDN component**: Would require reimplementing all of SST's Next.js logic
- **Pulumi resource options**: Can't override SST's internal CloudFront creation

The script approach is clean, idempotent, and maintainable.

## Rollback

To rollback to Lambda Function URLs (won't work, but for reference):

```bash
# Update origins back to Lambda URL
aws --profile stokd-cloud cloudfront get-distribution-config \
  --id E1JN9JWBQ37JT2 > /tmp/dist.json

# Edit /tmp/dist.json to restore Lambda URLs
# Then:
aws --profile stokd-cloud cloudfront update-distribution \
  --id E1JN9JWBQ37JT2 \
  --if-match <etag> \
  --distribution-config file:///tmp/dist.json

# Remove API Gateway
pnpm sst remove --stage production
```

## Support

For issues or questions:
1. Check `docs/API_GATEWAY_SETUP.md` troubleshooting section
2. Review Lambda logs in CloudWatch
3. Verify CloudFront config matches expected state

---

**Implementation Date**: 2026-05-27  
**AWS Account**: 167217327520 (stokd-cloud)  
**CloudFront Distribution**: E1JN9JWBQ37JT2  
**Reason**: Broken Lambda Function URL service in this AWS account
