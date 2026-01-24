# Environment Variables Reference

This document describes all environment variables used by the AlbyHub API, including custom domain configuration.

## Environment Variable Groups

### Custom Domain Configuration

#### `CUSTOM_DOMAIN`

The custom domain for the Lightning Address endpoint.

- **Type:** String
- **Default:** Empty string (in development)
- **Stage:** Production only
- **Example:** `albyhub.brianstoker.com`
- **Usage:** Used to construct the Lightning Address and callback URLs

**Development:**
```env
CUSTOM_DOMAIN=
```

**Production:**
```env
CUSTOM_DOMAIN=albyhub.brianstoker.com
```

### Application Configuration

#### `NODE_ENV`

Node.js environment mode.

- **Type:** `production` | `development`
- **Default:** Set automatically by SST based on stage
- **Production:** `production`
- **Development:** `development`

#### `APP_VERSION`

Application version number.

- **Type:** String (semver)
- **Default:** `1.0.0`
- **Example:** `1.0.0`, `1.2.3-beta`

#### `LOG_LEVEL`

Logging verbosity level.

- **Type:** `error` | `warn` | `info` | `debug` | `verbose`
- **Default:** `debug` in development, `warn` in production
- **Production:** `warn` (minimal logs)
- **Development:** `debug` (detailed logs)

### AWS Configuration

#### `AWS_REGION`

AWS region for Lambda and Secrets Manager.

- **Type:** String (AWS region code)
- **Default:** `us-east-1`
- **Example:** `us-east-1`, `us-west-2`, `eu-west-1`
- **Note:** Must match the region where Lambda is deployed

#### `SECRETS_MANAGER_NAME`

AWS Secrets Manager secret name for storing sensitive credentials.

- **Type:** String
- **Format:** `albyhub/secrets/{stage}`
- **Default:** Automatically set by SST
- **Examples:**
  - Development: `albyhub/secrets/dev`
  - Staging: `albyhub/secrets/staging`
  - Production: `albyhub/secrets/production`

### LNURL Configuration

These variables control the Lightning Address metadata and payment limits.

#### `MIN_SENDABLE`

Minimum amount that can be sent in a single payment (in millisatoshis).

- **Type:** Number (integer)
- **Default:** `1000` (1 sat)
- **Range:** 1 - 9,223,372,036,854,775,807
- **Units:** millisatoshis (1 sat = 1000 millisats)
- **Example Values:**
  - `1000` = 1 satoshi
  - `100000` = 100 satoshis
  - `1000000` = 1000 satoshis

#### `MAX_SENDABLE`

Maximum amount that can be sent in a single payment (in millisatoshis).

- **Type:** Number (integer)
- **Default:** `100000000` (100,000 sats)
- **Range:** >= MIN_SENDABLE
- **Units:** millisatoshis
- **Example Values:**
  - `100000000` = 100,000 satoshis
  - `1000000000` = 1,000,000 satoshis
  - `1000000000000` = 1,000,000,000 satoshis (1 million sats)

#### `COMMENT_ALLOWED`

Maximum length for payment comments/memos (in characters).

- **Type:** Number (integer)
- **Default:** `280` (similar to Twitter)
- **Range:** 0 - 65,535
- **Example Values:**
  - `0` = Comments disabled
  - `280` = Twitter-like comments
  - `500` = Medium comments
  - `1000` = Long comments

#### `LNURL_CALLBACK_URL`

Full URL to the LNURL-pay callback endpoint for generating invoices.

- **Type:** URL string
- **Format:** `https://{CUSTOM_DOMAIN}/lnurl/callback`
- **Development:** `http://localhost:3000/lnurl/callback`
- **Production:** `https://albyhub.brianstoker.com/lnurl/callback`
- **Note:** Set automatically by SST based on stage

### Setting Environment Variables in Different Environments

#### Local Development

Create a `.env.local` file:

```bash
cd albyhub
cp .env.example .env.local
```

Edit `.env.local`:

```env
NODE_ENV=development
PORT=3000
CUSTOM_DOMAIN=
AWS_REGION=us-east-1
SECRETS_MANAGER_NAME=albyhub/secrets/dev
MIN_SENDABLE=1000
MAX_SENDABLE=100000000
COMMENT_ALLOWED=280
LNURL_CALLBACK_URL=http://localhost:3000/lnurl/callback
```

#### AWS Lambda (Production)

Environment variables are set in `stacks/albyhub.ts`:

```typescript
const envVars = {
  NODE_ENV: $app.stage === "production" ? "production" : "development",
  APP_VERSION: "1.0.0",
  LOG_LEVEL: $app.stage === "production" ? "warn" : "debug",
  SECRETS_MANAGER_NAME: secretName,
  AWS_REGION: $app.providers?.aws?.region || "us-east-1",
  CUSTOM_DOMAIN: customDomain || "",
  // LNURL Configuration
  MIN_SENDABLE: "1000",
  MAX_SENDABLE: "100000000",
  COMMENT_ALLOWED: "280",
  LNURL_CALLBACK_URL: $app.stage === "production"
    ? `https://albyhub.${domainInfo.domains[0]}/lnurl/callback`
    : "http://localhost:3000/lnurl/callback",
};
```

To modify Lambda environment variables:

1. Edit `stacks/albyhub.ts`
2. Update the `envVars` object
3. Redeploy: `sst deploy --stage production`

#### Environment Variable Validation

The application validates all environment variables on startup and fails fast if required variables are missing.

**Required Variables:**
- `SECRETS_MANAGER_NAME`
- `AWS_REGION`

**Optional Variables (have defaults):**
- `NODE_ENV`
- `APP_VERSION`
- `LOG_LEVEL`
- `CUSTOM_DOMAIN`
- `MIN_SENDABLE`
- `MAX_SENDABLE`
- `COMMENT_ALLOWED`
- `LNURL_CALLBACK_URL`

### Viewing Lambda Environment Variables

Check what environment variables are set in a deployed Lambda:

```bash
# Get function configuration
aws lambda get-function-configuration \
  --function-name AlbyHubFunction \
  --region us-east-1

# Extract just environment variables
aws lambda get-function-configuration \
  --function-name AlbyHubFunction \
  --region us-east-1 \
  --query 'Environment.Variables' \
  --output json | jq
```

### Modifying Environment Variables at Runtime

For production deployments, modify environment variables by:

1. **Using SST** (recommended):
   ```bash
   # Edit stacks/albyhub.ts
   vim stacks/albyhub.ts

   # Update the envVars object with new values

   # Redeploy
   sst deploy --stage production
   ```

2. **Using AWS Console**:
   - Navigate to Lambda service
   - Select AlbyHubFunction
   - Go to Configuration → Environment Variables
   - Edit the values
   - Click Save

3. **Using AWS CLI**:
   ```bash
   aws lambda update-function-configuration \
     --function-name AlbyHubFunction \
     --environment 'Variables={
       NODE_ENV=production,
       CUSTOM_DOMAIN=albyhub.brianstoker.com,
       MIN_SENDABLE=1000,
       MAX_SENDABLE=100000000
     }' \
     --region us-east-1
   ```

### Best Practices

1. **Never commit secrets to Git** - Use AWS Secrets Manager instead
2. **Use `.env.local` for development** - Add to `.gitignore`
3. **Keep production values in SST** - Avoid manual AWS console changes
4. **Document all custom variables** - Add to this file
5. **Validate early** - Application fails on startup if required vars are missing
6. **Use environment-specific values** - Different settings for dev/staging/prod

### Related Documentation

- [SECRETS_MANAGEMENT.md](./SECRETS_MANAGEMENT.md) - Sensitive credentials in AWS Secrets Manager
- [DNS_CONFIGURATION.md](./DNS_CONFIGURATION.md) - Custom domain setup
- [../README.md](../README.md) - AlbyHub API overview
- [Lightning Address Spec](https://github.com/fiatjaf/lnurl-rfc) - LNURL protocol
