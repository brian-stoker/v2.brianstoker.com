# API Gateway Deployment Checklist

## Pre-Deployment

- [ ] Ensure AWS CLI is configured with `stokd-cloud` profile
- [ ] Verify you're in the correct AWS account (167217327520)
- [ ] Check current CloudFront distribution is E1JN9JWBQ37JT2
- [ ] Backup current CloudFront config (optional):
  ```bash
  aws --profile stokd-cloud cloudfront get-distribution-config \
    --id E1JN9JWBQ37JT2 > cloudfront-backup-$(date +%Y%m%d).json
  ```

## Deployment Steps

### Option 1: Complete Automated Deployment (Recommended)

```bash
# Run the complete deployment script
AWS_PROFILE=stokd-cloud pnpm run deploy:apigateway
```

This script will:
1. ✅ Create/retrieve CloudFront secret
2. ✅ Set secret in SST
3. ✅ Deploy SST stack with API Gateway
4. ✅ Update CloudFront origins

**Expected Duration**: 5-10 minutes

### Option 2: Manual Step-by-Step

If you prefer to run steps manually:

#### 1. Create CloudFront Secret (if not exists)

```bash
# Check if secret exists
aws --profile stokd-cloud secretsmanager describe-secret \
  --secret-id CloudFrontSecret

# If not, create it
SECRET=$(openssl rand -base64 32)
aws --profile stokd-cloud secretsmanager create-secret \
  --name CloudFrontSecret \
  --description "CloudFront to API Gateway shared secret" \
  --secret-string "$SECRET"
```

#### 2. Set SST Secret

```bash
# Get the secret value
SECRET=$(aws --profile stokd-cloud secretsmanager get-secret-value \
  --secret-id CloudFrontSecret \
  --query SecretString \
  --output text)

# Set in SST
pnpm sst secret set CloudFrontSecret "$SECRET" --stage production
```

#### 3. Deploy SST Stack

```bash
AWS_PROFILE=stokd-cloud pnpm deploy:prod
```

#### 4. Update CloudFront Origins

```bash
export CLOUDFRONT_SECRET="$SECRET"
AWS_PROFILE=stokd-cloud node scripts/update-cloudfront-origins.js
```

## Post-Deployment Verification

### 1. Check SST Outputs

```bash
pnpm sst outputs --stage production
```

Expected outputs:
- `apiGatewayUrl`: https://{api-id}.execute-api.us-east-1.amazonaws.com
- `apiGatewayId`: {api-id}
- `url`: https://brian.stokd.cloud

### 2. Verify API Gateway

```bash
# Should return 403 (Forbidden - no auth)
curl -v https://{api-id}.execute-api.us-east-1.amazonaws.com

# Should return 200 (with secret header)
SECRET=$(aws --profile stokd-cloud secretsmanager get-secret-value \
  --secret-id CloudFrontSecret --query SecretString --output text)
curl -v -H "x-cloudfront-secret: $SECRET" \
  https://{api-id}.execute-api.us-east-1.amazonaws.com
```

### 3. Verify CloudFront Configuration

```bash
# Check that origins were updated
aws --profile stokd-cloud cloudfront get-distribution-config \
  --id E1JN9JWBQ37JT2 | \
  jq '.DistributionConfig.Origins.Items[] | select(.Id == "default" or .Id == "imageOptimizer") | {Id, DomainName, CustomHeaders}'
```

Expected output:
- `DomainName` should be `{api-id}.execute-api.us-east-1.amazonaws.com`
- `CustomHeaders` should include `x-cloudfront-secret`

### 4. Test Live Site

```bash
# Test home page
curl -I https://brian.stokd.cloud

# Test specific route
curl -I https://brian.stokd.cloud/about

# Test with browser
open https://brian.stokd.cloud
```

### 5. Check Logs

```bash
# API Gateway Authorizer logs
aws --profile stokd-cloud logs tail \
  /aws/lambda/ApiGatewayAuthorizer \
  --follow

# Next.js Lambda logs
aws --profile stokd-cloud logs tail \
  /aws/lambda/bri-production-brianstokdcloudNextjsSiteDefaultFunction-bndhaewh \
  --follow
```

## Monitoring Checklist

After deployment, monitor for:

- [ ] No 403 errors from CloudFront (check authorizer is working)
- [ ] No 500 errors from API Gateway
- [ ] Response times are reasonable (< 200ms for cached, < 1s for SSR)
- [ ] All routes working (/, /about, /products, etc.)
- [ ] Image optimization working
- [ ] Static assets loading from S3

## Troubleshooting

### Issue: 403 Forbidden from CloudFront

**Symptom**: All requests return 403
**Cause**: Secret mismatch or authorizer failing
**Fix**:
```bash
# Check authorizer logs
aws --profile stokd-cloud logs tail /aws/lambda/ApiGatewayAuthorizer

# Verify secret in CloudFront matches SST
aws --profile stokd-cloud cloudfront get-distribution-config \
  --id E1JN9JWBQ37JT2 | jq '.DistributionConfig.Origins.Items[1].CustomHeaders'

# If mismatch, regenerate and redeploy
```

### Issue: CloudFront Still Using Lambda URLs

**Symptom**: Site doesn't work, origins show lambda-url domains
**Cause**: CloudFront update script didn't run
**Fix**:
```bash
export CLOUDFRONT_SECRET=$(aws --profile stokd-cloud \
  secretsmanager get-secret-value \
  --secret-id CloudFrontSecret \
  --query SecretString --output text)
AWS_PROFILE=stokd-cloud node scripts/update-cloudfront-origins.js
```

### Issue: API Gateway Not Found in SST Outputs

**Symptom**: `apiGatewayUrl` missing from outputs
**Cause**: API Gateway wasn't created (dev mode or deploy failed)
**Fix**:
```bash
# Ensure deploying to production
AWS_PROFILE=stokd-cloud pnpm sst deploy --stage production
```

### Issue: High Latency

**Symptom**: Requests taking > 2 seconds
**Cause**: Lambda cold starts or authorizer overhead
**Investigation**:
```bash
# Check API Gateway metrics
aws --profile stokd-cloud cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Latency \
  --dimensions Name=ApiId,Value={api-id} \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

## Rollback Plan

If issues arise and you need to rollback:

### Quick Rollback (CloudFront Only)

```bash
# Restore from backup
aws --profile stokd-cloud cloudfront update-distribution \
  --id E1JN9JWBQ37JT2 \
  --if-match <etag-from-backup> \
  --distribution-config file://cloudfront-backup-<date>.json
```

### Full Rollback (Remove API Gateway)

```bash
# Remove API Gateway from SST (comment out in sst.config.ts)
# Then redeploy
AWS_PROFILE=stokd-cloud pnpm deploy:prod
```

## Success Criteria

Deployment is successful when:

✅ SST stack deploys without errors  
✅ API Gateway URL appears in SST outputs  
✅ CloudFront origins use API Gateway domain  
✅ `x-cloudfront-secret` header present in origins  
✅ Live site (brian.stokd.cloud) loads correctly  
✅ No 403 errors in CloudFront  
✅ No errors in Lambda logs  
✅ All routes accessible  
✅ Images and static assets load  

---

**Note**: CloudFront changes can take 2-5 minutes to propagate globally. Be patient after updating origins.

**Documentation**: See `docs/API_GATEWAY_SETUP.md` for detailed architecture and troubleshooting.
