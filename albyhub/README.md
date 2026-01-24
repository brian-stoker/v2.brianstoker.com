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
- Strict TypeScript configuration
- Comprehensive test coverage

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
NODE_ENV=development
PORT=3000

# Alby Hub Configuration
ALBY_HUB_URL=https://api.getalby.com
ALBY_HUB_CLIENT_ID=your_client_id_here
ALBY_HUB_CLIENT_SECRET=your_client_secret_here
```

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
