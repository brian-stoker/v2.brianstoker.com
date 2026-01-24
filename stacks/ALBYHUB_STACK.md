# AlbyHub SST Stack

This document describes the SST infrastructure configuration for the AlbyHub NestJS API.

## Overview

The AlbyHub stack deploys a NestJS application to AWS Lambda with API Gateway integration, providing a serverless Lightning Network API.

## Resources Created

### 1. Lambda Function (`AlbyHubFunction`)

**Purpose**: Runs the NestJS application in serverless mode

**Configuration**:
- Handler: `albyhub/dist/lambda.handler`
- Runtime: Node.js 20.x
- Memory: 512 MB
- Timeout: 29 seconds (API Gateway maximum)
- Architecture: arm64 (AWS Graviton2 for cost optimization)

**Environment Variables**:
- `NODE_ENV`: production or development (based on stage)
- `APP_VERSION`: 1.0.0
- `LOG_LEVEL`: warn (production) or debug (development)

**Bundling**:
- Uses esbuild for fast bundling
- Minified in production
- Source maps enabled
- External modules: `@nestjs/microservices`, `@nestjs/websockets`, `cache-manager`, `class-transformer/storage`

### 2. CloudWatch Log Group (`AlbyHubLogs`)

**Purpose**: Stores Lambda execution logs

**Configuration**:
- Name: `/aws/lambda/AlbyHubFunction`
- Retention: 30 days

### 3. API Gateway (`AlbyHubApi`)

**Purpose**: HTTP endpoint for invoking the Lambda function

**Configuration**:

#### Development Mode ($dev)
- CORS: Allow all origins (`*`)
- No custom domain
- Endpoint: Auto-generated AWS API Gateway URL

#### Production Mode
- Custom Domain: `albyhub.brianstoker.com`
- DNS: Cloudflare
- CORS: Restricted to main site domains
- HTTPS only

**CORS Headers**:
- Allowed Headers: `Content-Type`, `Authorization`, `X-Requested-With`
- Allowed Methods: `GET`, `POST`, `OPTIONS`, `PUT`, `PATCH`, `DELETE`
- Credentials: false (dev), true (production)

**Routes**:
- `GET /health` - Health check endpoint
- `GET /{proxy+}` - All GET requests
- `POST /{proxy+}` - All POST requests
- `PUT /{proxy+}` - All PUT requests
- `PATCH /{proxy+}` - All PATCH requests
- `DELETE /{proxy+}` - All DELETE requests

## Testing the Stack

### Unit Tests

The stack configuration includes comprehensive unit tests:

```bash
# Run stack tests (from project root)
pnpm test stacks/albyhub.test.ts
```

Tests validate:
- Lambda configuration (runtime, memory, timeout, architecture)
- Environment variable setup
- Bundling configuration
- API Gateway CORS settings
- CloudWatch log retention
- Route configuration

### Integration Tests

After deployment, test the live API:

```bash
# Test health endpoint
curl https://albyhub.brianstoker.com/health

# Expected response:
# {"status":"ok","timestamp":"2026-01-24T12:00:00.000Z","environment":"production","version":"1.0.0"}
```

## Performance Expectations

### Cold Start
- Target: <3 seconds
- Measured from first invocation after 15+ minutes idle

### Warm Response
- Target: <100ms
- Measured for subsequent requests

## Cost Optimization

1. **arm64 Architecture**: ~20% cost savings vs x86_64
2. **512 MB Memory**: Balanced performance/cost (adjustable based on testing)
3. **30-day Log Retention**: Prevents unbounded CloudWatch storage costs
4. **Efficient Bundling**: Smaller deployment package = faster cold starts

## Monitoring

### CloudWatch Metrics
- Invocations
- Duration
- Errors
- Throttles

### CloudWatch Logs
- Log Group: `/aws/lambda/AlbyHubFunction`
- Retention: 30 days
- Includes all NestJS logs (error, warn, log levels)

### Alerts (To Be Configured)
- Error rate >5%
- Duration >5s (p99)
- Throttling events

## Security

1. **HTTPS Only**: API Gateway enforces HTTPS
2. **CORS**: Restricted to known origins in production
3. **Least Privilege**: Lambda has minimal IAM permissions
4. **No Secrets in Code**: Environment variables managed via SST

## Deployment

See acceptance criteria tests in work item 1.2:

- **Test-1.2.a**: Deployment completes in <5 minutes
- **Test-1.2.b**: Health endpoint returns 200
- **Test-1.2.c**: Cold start <3 seconds
- **Test-1.2.d**: Environment variables accessible
- **Test-1.2.e**: CORS headers present

## Troubleshooting

### Deployment Fails

1. Check AWS credentials: `aws sts get-caller-identity`
2. Verify build succeeded: `cd albyhub && pnpm build`
3. Check SST version: `sst version`
4. Review CloudFormation events in AWS Console

### Lambda Errors

1. Check CloudWatch Logs: `/aws/lambda/AlbyHubFunction`
2. Verify environment variables are set
3. Test locally: `cd albyhub && pnpm start:dev`
4. Check bundle size (should be <50MB)

### API Gateway Issues

1. Verify routes are configured
2. Check CORS settings
3. Test with curl including `-v` for headers
4. Review API Gateway logs (if enabled)

## Future Enhancements

1. Add API Gateway access logging
2. Configure CloudWatch alarms
3. Add AWS X-Ray tracing
4. Implement Lambda SnapStart
5. Add VPC configuration for database access
6. Configure reserved concurrency
7. Add custom metrics
