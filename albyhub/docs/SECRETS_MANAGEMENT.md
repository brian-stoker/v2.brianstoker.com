# Secrets Management

This document describes the secrets management system for the AlbyHub NestJS API.

## Overview

The application uses AWS Secrets Manager to securely store and retrieve sensitive credentials. Secrets are loaded at application startup and cached in memory for 30 minutes to minimize AWS API calls.

## Architecture

### Components

1. **SecretsService** (`src/config/secrets.config.ts`)
   - Manages retrieval and caching of secrets from AWS Secrets Manager
   - Implements retry logic with exponential backoff for transient failures
   - Sanitizes error messages to prevent secret value leakage

2. **ConfigModule** (`src/config/config.module.ts`)
   - Global module that provides SecretsService to the entire application
   - Integrates with NestJS ConfigModule for environment variable validation

3. **Lambda IAM Role** (`stacks/albyhub.ts`)
   - Grants `secretsmanager:GetSecretValue` permission to Lambda execution role
   - Scoped to specific secret ARN pattern for security

## Secrets Structure

Secrets are stored in AWS Secrets Manager as JSON with the following structure:

```json
{
  "VOLTAGE_API_KEY": "your-voltage-api-key",
  "VOLTAGE_MACAROON": "your-voltage-macaroon",
  "VOLTAGE_CONNECTION_URL": "https://voltage-node.example.com",
  "NOSTR_PRIVATE_KEY": "your-nostr-private-key-hex",
  "NOSTR_PUBLIC_KEY": "your-nostr-public-key-hex",
  "NWC_RELAY_URL": "wss://relay.example.com"
}
```

### Secret Name Convention

- Development: `albyhub/secrets/dev`
- Production: `albyhub/secrets/production`
- Test: `albyhub/secrets/test`

The secret name is determined by the `SECRETS_MANAGER_NAME` environment variable, which is automatically set based on the SST stage.

## Usage

### Accessing Secrets in Your Code

```typescript
import { Injectable } from '@nestjs/common';
import { SecretsService } from '../config/secrets.config';

@Injectable()
export class MyService {
  constructor(private readonly secretsService: SecretsService) {}

  async doSomething() {
    const secrets = await this.secretsService.getSecrets();

    // Access Voltage credentials
    const voltageApiKey = secrets.voltage.apiKey;
    const voltageMacaroon = secrets.voltage.macaroon;
    const voltageUrl = secrets.voltage.connectionUrl;

    // Access Nostr credentials
    const nostrPrivateKey = secrets.nostr.privateKey;
    const nostrPublicKey = secrets.nostr.publicKey;
    const nwcRelayUrl = secrets.nostr.relayUrl;
  }
}
```

### Caching Behavior

- Secrets are loaded automatically during application startup via `onModuleInit`
- First call to `getSecrets()` fetches from AWS Secrets Manager
- Subsequent calls within 30 minutes return cached value
- After 30 minutes, cache expires and next call fetches fresh secrets
- Cache can be manually cleared with `secretsService.clearCache()` (useful for testing)

## Error Handling

### Startup Failures

The application will fail to start if:
- Secrets cannot be retrieved from AWS Secrets Manager
- Required secret keys are missing from the JSON
- AWS API returns non-retryable errors (4xx)

### Retry Logic

The service automatically retries transient failures with exponential backoff:
- **Max retries**: 3
- **Backoff schedule**: 100ms, 200ms, 400ms
- **Retryable errors**: 5xx status codes, network errors, throttling

### Error Messages

Error messages are sanitized to prevent leaking secret values:

```typescript
// Good: Secret name is mentioned, but not the value
"Missing required secrets in albyhub/secrets/production: VOLTAGE_API_KEY"

// Good: Specific, actionable error
"Access denied to secret \"albyhub/secrets/production\". Check Lambda IAM permissions."

// Bad: Would expose secret value (prevented by sanitization)
"Secret VOLTAGE_API_KEY has invalid value: sk_live_abc123..."
```

## Security Best Practices

### Never Log Secret Values

```typescript
// ❌ BAD - Logs secret value
logger.log(`API Key: ${secrets.voltage.apiKey}`);

// ✅ GOOD - Logs that secrets are loaded without values
logger.log('Secrets loaded successfully');
```

### Never Return Secrets in HTTP Responses

```typescript
// ❌ BAD - Exposes secrets to client
@Get('/config')
getConfig() {
  return this.secretsService.getSecrets();
}

// ✅ GOOD - Returns only non-sensitive configuration
@Get('/config')
getConfig() {
  return {
    nodeUrl: process.env.NODE_URL,
    environment: process.env.NODE_ENV,
  };
}
```

### Error Handling

All errors from SecretsService are sanitized to remove secret values. The service:
- Removes stack traces in production
- Replaces raw AWS errors with safe, descriptive messages
- Only includes secret key names (not values) in error messages

## Deployment

### Creating Secrets in AWS

Use the AWS CLI or Console to create secrets:

```bash
# Development
aws secretsmanager create-secret \
  --name albyhub/secrets/dev \
  --secret-string file://secrets-dev.json

# Production
aws secretsmanager create-secret \
  --name albyhub/secrets/production \
  --secret-string file://secrets-prod.json
```

### Updating Secrets

```bash
aws secretsmanager update-secret \
  --secret-id albyhub/secrets/production \
  --secret-string file://secrets-prod.json
```

After updating secrets in AWS Secrets Manager, the application will use the new values after:
1. Cache expires (30 minutes), OR
2. Application restarts

### IAM Permissions

The Lambda execution role automatically receives the following permission:

```json
{
  "Effect": "Allow",
  "Action": "secretsmanager:GetSecretValue",
  "Resource": "arn:aws:secretsmanager:*:*:secret:albyhub/secrets/[stage]-*"
}
```

This permission is scoped to only the secrets for the current stage (dev/production).

## Testing

### Unit Tests

The `secrets.config.spec.ts` file contains unit tests for:
- Caching behavior (30-minute TTL)
- Missing secret validation
- Retry logic with exponential backoff
- Error sanitization
- Secret value protection

### Integration Tests

The `secrets.e2e-spec.ts` file contains integration tests for:
- Application startup with secrets loading (<2s)
- Startup failure scenarios
- Cache behavior within TTL window
- Secret value protection in error responses
- Retry behavior with AWS Secrets Manager failures

### Mocking in Tests

Tests use a mocked AWS SDK to avoid actual AWS API calls:

```typescript
jest.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({
      SecretString: JSON.stringify({
        VOLTAGE_API_KEY: 'test-api-key',
        // ... other test secrets
      }),
    }),
  })),
  GetSecretValueCommand: jest.fn(),
}));
```

## Performance

### Startup Time

- **Target**: <2 seconds to load all secrets
- **Typical**: 50-200ms for AWS Secrets Manager API call
- **Cached**: 0ms (in-memory access)

### Cache Efficiency

With 30-minute cache TTL:
- 1 request per secret set per 30 minutes per Lambda instance
- Cold start: 1 AWS API call
- Warm instance: 0 AWS API calls for 30 minutes

### Cost Optimization

AWS Secrets Manager pricing:
- $0.40 per secret per month
- $0.05 per 10,000 API calls
- With caching, typically <1,000 API calls/month for moderate traffic

## Monitoring

### CloudWatch Logs

The SecretsService logs:
- Successful secret loading with duration
- Cache hits (debug level)
- Retry attempts with backoff timing
- Sanitized error messages

### Metrics to Monitor

1. **Startup time**: Should be <2s
2. **Error rate**: Should be 0% in steady state
3. **Cache hit rate**: Should be >99% after warm-up
4. **AWS API calls**: Should match expected rate based on cache TTL

## Troubleshooting

### Application won't start

1. **Check secret exists**:
   ```bash
   aws secretsmanager describe-secret --secret-id albyhub/secrets/[stage]
   ```

2. **Verify IAM permissions**:
   - Lambda execution role must have `secretsmanager:GetSecretValue`
   - Resource ARN must match secret name pattern

3. **Validate secret structure**:
   ```bash
   aws secretsmanager get-secret-value --secret-id albyhub/secrets/[stage] \
     | jq -r '.SecretString' | jq .
   ```

### Secrets not updating

1. **Wait for cache expiration** (30 minutes)
2. **Restart application** to force reload
3. **Check AWS secret value** was actually updated

### Performance issues

1. **Check AWS Secrets Manager latency** in CloudWatch
2. **Verify caching is working** (check debug logs)
3. **Consider increasing cache TTL** if secrets rarely change

## Related Documentation

- [AWS Secrets Manager Documentation](https://docs.aws.amazon.com/secretsmanager/)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [SST AWS Function](https://docs.sst.dev/constructs/Function)
