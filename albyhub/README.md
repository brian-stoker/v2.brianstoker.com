# AlbyHub NestJS API

NestJS NWC (Nostr Wallet Connect) API for Lightning Address integration with Alby Hub.

## Project Structure

```
albyhub/
├── src/
│   ├── modules/          # Feature modules
│   ├── common/           # Shared utilities, decorators, filters, pipes
│   │   ├── filters/      # Exception filters
│   │   ├── pipes/        # Validation pipes
│   │   ├── decorators/   # Custom decorators
│   │   └── interceptors/ # Request/response interceptors
│   ├── config/           # Configuration management
│   ├── app.module.ts     # Root application module
│   └── main.ts           # Application entry point
├── test/                 # E2E tests
└── package.json
```

## Features

- Production-ready NestJS application structure
- Global exception filter for consistent error responses
- Global validation pipe for automatic DTO validation
- Environment variable validation with fail-fast on startup
- Secure secrets management with AWS Secrets Manager
- In-memory caching with 30-minute TTL
- Retry logic with exponential backoff for AWS API failures
- Strict TypeScript configuration
- Comprehensive test coverage
- LNURL-pay Lightning Address support (LUD-06, LUD-16 compliant)

## API Endpoints

### Lightning Address (LNURL-pay)

#### GET /.well-known/lnurlp/pay

Returns LNURL-pay metadata for Lightning Address (LUD-16 compliant).

**Response:**
```json
{
  "callback": "https://albyhub.brianstoker.com/lnurl/callback",
  "minSendable": 1000,
  "maxSendable": 100000000,
  "metadata": "[[\"text/plain\",\"Pay to Brian Stoker\"],[\"text/identifier\",\"pay@brianstoker.com\"]]",
  "tag": "payRequest",
  "commentAllowed": 280
}
```

#### GET /lnurl/callback

Generates a Lightning invoice for payment (LUD-06 compliant).

**Query Parameters:**
- `amount` (required): Payment amount in millisatoshis (integer, min: 1000, max: 100000000)
- `comment` (optional): Payment comment/memo (string, max: 280 characters)

**Success Response (200):**
```json
{
  "pr": "lnbc10n1234567890p...",
  "routes": [],
  "successAction": {
    "tag": "message",
    "message": "Payment received! Thank you."
  }
}
```

**Error Response (400):**
```json
{
  "status": "ERROR",
  "reason": "Amount 500 is below minimum sendable 1000"
}
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
NODE_ENV=development
PORT=3000

# AWS Secrets Manager Configuration
SECRETS_MANAGER_NAME=albyhub/secrets
AWS_REGION=us-east-1

# LNURL Configuration (optional)
MIN_SENDABLE=1000              # Minimum payment amount in millisats
MAX_SENDABLE=100000000         # Maximum payment amount in millisats (100k sats)
COMMENT_ALLOWED=280            # Max comment length
LNURL_CALLBACK_URL=https://albyhub.brianstoker.com/lnurl/callback
```

## Secrets Management

Sensitive credentials are stored in AWS Secrets Manager. See [SECRETS_MANAGEMENT.md](./docs/SECRETS_MANAGEMENT.md) for details.

Required secrets in AWS Secrets Manager:
- `VOLTAGE_API_KEY` - Voltage API authentication key
- `VOLTAGE_MACAROON` - Voltage node macaroon
- `VOLTAGE_CONNECTION_URL` - Voltage node connection URL
- `NOSTR_PRIVATE_KEY` - Nostr private key (hex format)
- `NOSTR_PUBLIC_KEY` - Nostr public key (hex format)
- `NWC_RELAY_URL` - NWC relay URL

## Installation

```bash
pnpm install
```

## Running the Application

```bash
# Development mode
pnpm start:dev

# Production mode
pnpm build
pnpm start

# Debug mode
pnpm start:debug
```

## Testing

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Test coverage
pnpm test:cov

# E2E tests
pnpm test:e2e
```

## Deployment

The application is deployed to AWS Lambda using SST (Serverless Stack).

### Prerequisites

- AWS credentials configured
- SST installed globally or in the parent project
- Environment variables set (see root `.env`)

### Deploy to AWS

From the project root (not albyhub directory):

```bash
# Deploy to development
sst deploy

# Deploy to production
sst deploy --stage production
```

### Lambda Configuration

- Runtime: Node.js 20.x
- Memory: 512 MB
- Timeout: 29 seconds
- Architecture: arm64 (AWS Graviton2)

### Health Check

The health endpoint is available at:

- Development: `https://<api-id>.execute-api.us-east-1.amazonaws.com/health`
- Production: `https://albyhub.brianstoker.com/health`

### Monitoring

Logs are available in CloudWatch with 30-day retention:
- Log Group: `/aws/lambda/AlbyHubFunction`

### Environment Variables in Lambda

The following environment variables are automatically injected:

- `NODE_ENV`: production or development (based on stage)
- `APP_VERSION`: Application version
- `LOG_LEVEL`: warn (production) or debug (development)
- `SECRETS_MANAGER_NAME`: AWS Secrets Manager secret name (e.g., `albyhub/secrets/production`)
- `AWS_REGION`: AWS region for Secrets Manager

### Secrets Management in Lambda

The Lambda function has the following IAM permissions:
- `secretsmanager:GetSecretValue` - Scoped to `albyhub/secrets/[stage]` secret

Secrets are loaded at startup and cached for 30 minutes. See [SECRETS_MANAGEMENT.md](./docs/SECRETS_MANAGEMENT.md).

## Development

### Global Exception Filter

All exceptions are caught and formatted consistently:

```json
{
  "statusCode": 400,
  "timestamp": "2026-01-24T12:00:00.000Z",
  "path": "/api/endpoint",
  "message": "Validation failed",
  "error": "BadRequestException"
}
```

### Global Validation Pipe

DTOs are automatically validated using `class-validator` decorators:

```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

Invalid requests return 400 with detailed validation errors.

### Environment Validation

The application validates required environment variables on startup and fails fast with clear error messages if any are missing or invalid.

## License

MIT
