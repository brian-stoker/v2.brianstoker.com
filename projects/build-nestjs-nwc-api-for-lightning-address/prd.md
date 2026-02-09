# Product Requirements Document (Sequential)

## 0. Source Context
**Derived From:** Product Feature Brief
**Source Document:** ./projects/build-nestjs-nwc-api-for-lightning-address/pfb.md
**Feature Name:** Lightning Address NWC API
**PRD Owner:** Brian Stoker
**Last Updated:** 2026-01-24

### Feature Brief Summary
A serverless NestJS API deployed on AWS Lambda via SST that enables Lightning Network payments through a Lightning Address (pay@brianstoker.com) with Nostr Wallet Connect (NWC) integration to a Voltage-hosted Lightning node. This feature enables seamless reception of Bitcoin Lightning payments using a human-readable email-style address while maintaining full custody through a personal Lightning node.

---

## 1. Objectives & Constraints

### Objectives
- Enable automated Lightning payment reception via pay@brianstoker.com
- Implement LNURL-pay protocol (LUD-06) for invoice generation
- Implement Lightning Address protocol (LUD-16) for address resolution
- Establish NWC connection (NIP-47) to Voltage node for programmatic wallet operations
- Deploy serverless infrastructure with minimal operational overhead
- Maintain full custody of funds through personal Lightning node
- Achieve API endpoint response time < 2 seconds (p95)
- Achieve 99.9% uptime for critical payment endpoints
- Lambda cold start time < 3 seconds

### Constraints

**Technical:**
- AWS Lambda cold starts (3-5 second latency possible)
- Lambda execution timeout (max 29 seconds for API Gateway)
- Voltage API rate limits (assume 100 req/min)
- NWC relay latency and availability
- Single developer resource (Brian Stoker)
- Must work within existing SST infrastructure in repository

**Legal / Compliance:**
- Self-custodial setup (no third-party custody compliance needed)
- Personal use only (no money transmission license required)

**Timeline:**
- Target completion: 4-6 weeks from project start
- MVP deployment: 2 weeks

**Resources:**
- No additional budget required beyond existing AWS/Voltage costs
- Voltage node must be operational with API access enabled
- Voltage node must have sufficient inbound liquidity for receiving payments
- Domain brianstoker.com DNS must be configurable for Lightning Address
- AWS account must have necessary permissions for Lambda, API Gateway, Secrets Manager, CloudWatch

---

## 2. Execution Phases

> Phases below are ordered and sequential.
> A phase cannot begin until all acceptance criteria of the previous phase are met.

---

## Phase 1: Foundation & Infrastructure
**Purpose:** Establish core NestJS application structure, SST deployment configuration, and AWS infrastructure before implementing any Lightning-specific functionality. This foundation ensures a deployable, testable application skeleton that can be iteratively enhanced.

### 1.1 NestJS Application Scaffolding
Create a production-ready NestJS application structure with proper module organization, dependency injection, and TypeScript configuration.

**Implementation Details**
- Systems affected: New NestJS project within existing repository structure
- Directory structure:
  - `/albyhub/src/` - NestJS application source
  - `/albyhub/src/modules/` - Feature modules
  - `/albyhub/src/common/` - Shared utilities, decorators, filters
  - `/albyhub/src/config/` - Configuration management
- Core dependencies:
  - `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`
  - `@nestjs/config` for environment variable management
  - `class-validator`, `class-transformer` for DTO validation
- Configure TypeScript with strict mode enabled
- Implement global exception filters for consistent error responses
- Implement global validation pipe for automatic DTO validation
- Setup environment variable validation schema
- Failure modes: Application fails fast on startup if required environment variables missing

**Acceptance Criteria**
- AC-1.1.a: When application starts → all required modules load without errors in <1s
- AC-1.1.b: When invalid environment variable provided → application fails to start with clear error message
- AC-1.1.c: When exception thrown in any controller → global exception filter returns consistent JSON error response with proper HTTP status code
- AC-1.1.d: When invalid DTO submitted to any endpoint → validation pipe returns 400 with detailed validation errors

**Acceptance Tests**
- Test-1.1.a: Unit test validates AppModule bootstraps successfully with valid configuration
- Test-1.1.b: Integration test validates application startup fails with exit code 1 when required env vars missing
- Test-1.1.c: Unit test validates global exception filter formats errors correctly with status code, message, timestamp
- Test-1.1.d: Integration test validates validation pipe rejects invalid DTOs with 400 status and detailed field errors

---

### 1.2 SST Configuration & AWS Lambda Setup
Configure SST infrastructure as code to deploy NestJS application to AWS Lambda with API Gateway integration.

**Implementation Details**
- Dependencies: Requires 1.1 (working NestJS application)
- Systems affected:
  - `/stacks/albyhub.ts` - New SST stack definition
  - `/sst.config.ts` - Update to include new stack
- SST resources:
  - `Api` construct for API Gateway with HTTP routes
  - `Function` construct for Lambda with NestJS handler
  - Environment linking for stage-based configuration
  - CloudWatch log group with retention policy (30 days)
- Lambda configuration:
  - Runtime: Node.js 20.x
  - Memory: 512 MB (adjustable based on testing)
  - Timeout: 29 seconds (API Gateway maximum)
  - Architecture: arm64 (Graviton2 for cost optimization)
- Bundling strategy:
  - Use esbuild for fast bundling
  - Exclude dev dependencies
  - External: `@nestjs/microservices`, `@nestjs/websockets` (not needed)
- API Gateway configuration:
  - CORS enabled for future web integration
  - Custom domain: api.brianstoker.com (or subdomain for Lightning endpoints)
  - HTTPS only
- Failure modes: Deployment fails if AWS credentials invalid, permissions insufficient, or stack definition errors

**Acceptance Criteria**
- AC-1.2.a: When `sst deploy` executed → Lambda function deploys successfully in <5 minutes
- AC-1.2.b: When Lambda invoked via API Gateway → NestJS application responds with 200 status for health check endpoint
- AC-1.2.c: When Lambda cold start occurs → application initializes and responds in <3s
- AC-1.2.d: When environment variable accessed in Lambda → value correctly retrieved from SST environment binding
- AC-1.2.e: When API Gateway receives HTTP request → CORS headers present in response

**Acceptance Tests**
- Test-1.2.a: Deployment test validates `sst deploy` completes without errors and outputs API Gateway URL
- Test-1.2.b: Integration test validates HTTP GET to API Gateway health endpoint returns 200 with `{"status":"ok"}`
- Test-1.2.c: Performance test measures cold start time (invoke after 15min idle) completes in <3s
- Test-1.2.d: Integration test validates environment variable injected by SST accessible in Lambda runtime
- Test-1.2.e: Integration test validates OPTIONS request returns CORS headers (Access-Control-Allow-Origin)

---

### 1.3 Secrets Management & Configuration
Implement secure storage and retrieval of sensitive credentials using AWS Secrets Manager.

**Implementation Details**
- Dependencies: Requires 1.2 (deployed Lambda with AWS access)
- Systems affected:
  - AWS Secrets Manager - store secrets
  - Lambda execution role - grant permissions
  - NestJS ConfigModule - access secrets at runtime
- Secrets to manage:
  - Voltage API key
  - Voltage node macaroon
  - Voltage node connection URL
  - Nostr private key (hex format)
  - Nostr public key (hex format)
  - NWC relay URL
- Implementation approach:
  - Create secrets in AWS Secrets Manager (JSON format)
  - Grant Lambda execution role `secretsmanager:GetSecretValue` permission
  - Use `@aws-sdk/client-secrets-manager` for retrieval
  - Create custom NestJS configuration service to load secrets on startup
  - Cache secrets in memory after first retrieval (30min TTL)
  - Never log or expose secrets in error messages
- Failure modes:
  - Application fails to start if secrets missing or inaccessible
  - Clear error message indicates which secret missing (without exposing value)
  - Automatic retry with exponential backoff for transient AWS API failures

**Acceptance Criteria**
- AC-1.3.a: When application starts → all secrets loaded from AWS Secrets Manager in <2s
- AC-1.3.b: When secret missing in Secrets Manager → application fails to start with error message identifying missing secret name
- AC-1.3.c: When secret accessed multiple times → subsequent accesses use cached value without additional AWS API calls within TTL window
- AC-1.3.d: When secret value retrieved → never appears in application logs or error responses
- AC-1.3.e: When Secrets Manager API temporarily unavailable → application retries 3 times with exponential backoff before failing

**Acceptance Tests**
- Test-1.3.a: Integration test validates secrets loaded successfully from Secrets Manager mock in <2s
- Test-1.3.b: Integration test validates startup failure when required secret missing, error message contains secret key name
- Test-1.3.c: Unit test validates configuration service caches secrets for 30min, AWS SDK called once per secret
- Test-1.3.d: Integration test validates secret values never present in CloudWatch logs or HTTP error responses
- Test-1.3.e: Integration test validates retry logic with exponential backoff (100ms, 200ms, 400ms) when Secrets Manager returns 500

---

### 1.4 Health Check & Monitoring Endpoints
Implement health check endpoints and structured logging for operational visibility.

**Implementation Details**
- Dependencies: Requires 1.1, 1.2, 1.3 (deployed application with secrets)
- Systems affected:
  - `/src/modules/health/` - Health check module
  - CloudWatch Logs - structured log output
- Health check endpoints:
  - `GET /health` - Basic liveness check (returns 200 if app running)
  - `GET /health/ready` - Readiness check (validates secrets loaded, Voltage API reachable)
- Use `@nestjs/terminus` for health checks
- Health check components:
  - Memory heap check (threshold: 150 MB)
  - Voltage API connectivity check (HTTP ping)
  - Secrets availability check
- Structured logging:
  - Use `winston` or `pino` for JSON-formatted logs
  - Log levels: error, warn, info, debug
  - Include correlation IDs for request tracing
  - Contextual metadata: timestamp, environment, Lambda request ID
- CloudWatch integration:
  - All logs sent to CloudWatch Logs
  - Log group: `/aws/lambda/albyhub-{stage}`
  - Retention: 30 days
- Failure modes: Health check returns 503 if any component unhealthy

**Acceptance Criteria**
- AC-1.4.a: When GET /health requested → returns 200 with `{"status":"ok"}` in <100ms
- AC-1.4.b: When GET /health/ready requested and all systems healthy → returns 200 with component status details in <1s
- AC-1.4.c: When Voltage API unreachable → GET /health/ready returns 503 with component failure details
- AC-1.4.d: When application logs error → structured JSON log appears in CloudWatch with timestamp, level, message, context
- AC-1.4.e: When HTTP request processed → request correlation ID included in all related log entries

**Acceptance Tests**
- Test-1.4.a: Integration test validates /health endpoint returns 200 in <100ms
- Test-1.4.b: Integration test validates /health/ready returns 200 with `{"voltage":{"status":"up"},"secrets":{"status":"up"}}` when healthy
- Test-1.4.c: Integration test validates /health/ready returns 503 when Voltage API mock unreachable
- Test-1.4.d: Integration test validates CloudWatch logs contain JSON with required fields (timestamp, level, message, requestId)
- Test-1.4.e: Integration test validates all logs for single request share same correlation ID

---

## Phase 2: Lightning Address Implementation
**Purpose:** Implement LNURL-pay and Lightning Address protocols to enable payment requests via pay@brianstoker.com. This phase builds on the foundation to add Lightning-specific functionality without requiring wallet integration yet (can use mock invoice generation initially).

### 2.1 Lightning Address Metadata Endpoint
Implement the Lightning Address resolution endpoint that returns LNURL-pay metadata according to LUD-16 specification.

**Implementation Details**
- Dependencies: Requires Phase 1 (deployed API with health checks)
- Systems affected:
  - `/src/modules/lightning/` - New Lightning module
  - `/src/modules/lightning/controllers/lnurl.controller.ts` - LNURL endpoints
  - API Gateway route: `GET /.well-known/lnurlp/pay`
- Lightning Address flow:
  1. Sender's wallet queries `https://brianstoker.com/.well-known/lnurlp/pay`
  2. Endpoint returns JSON with LNURL-pay metadata
  3. Metadata includes callback URL for invoice generation
- Response format (LUD-16 compliant):
  ```json
  {
    "callback": "https://api.brianstoker.com/lnurl/callback",
    "minSendable": 1000,
    "maxSendable": 100000000,
    "metadata": "[['text/plain','Pay to Brian Stoker'],['text/identifier','pay@brianstoker.com']]",
    "tag": "payRequest",
    "commentAllowed": 280
  }
  ```
- Configuration:
  - `minSendable`: 1 sat (1000 millisats) - configurable via environment variable
  - `maxSendable`: 1M sats (100000000 millisats) - configurable via environment variable
  - `commentAllowed`: 280 characters - configurable
- Input validation: No parameters required (static endpoint)
- Error handling: Returns 500 if configuration invalid
- Failure modes: Endpoint unreachable if Lambda down, returns 500 if metadata generation fails

**Acceptance Criteria**
- AC-2.1.a: When GET /.well-known/lnurlp/pay requested → returns 200 with valid LUD-16 JSON metadata in <500ms
- AC-2.1.b: When response received → metadata field contains valid JSON-stringified array with text/plain and text/identifier entries
- AC-2.1.c: When response received → callback URL is absolute HTTPS URL pointing to invoice generation endpoint
- AC-2.1.d: When response received → minSendable value equals configured minimum (default 1000 millisats)
- AC-2.1.e: When response received → maxSendable value equals configured maximum (default 100000000 millisats)
- AC-2.1.f: When response received → commentAllowed equals 280

**Acceptance Tests**
- Test-2.1.a: Integration test validates GET /.well-known/lnurlp/pay returns 200 in <500ms
- Test-2.1.b: Integration test validates metadata field parses as valid JSON array with required entries
- Test-2.1.c: Integration test validates callback URL matches expected format and is accessible HTTPS endpoint
- Test-2.1.d: Integration test validates minSendable equals environment variable value (or 1000 default)
- Test-2.1.e: Integration test validates maxSendable equals environment variable value (or 100000000 default)
- Test-2.1.f: Integration test validates commentAllowed equals 280

---

### 2.2 LNURL-pay Callback Endpoint (Mock Implementation)
Implement the LNURL-pay callback endpoint that generates Lightning invoices, initially with mock invoice generation for testing.

**Implementation Details**
- Dependencies: Requires 2.1 (metadata endpoint working)
- Systems affected:
  - `/src/modules/lightning/controllers/lnurl.controller.ts` - Add callback endpoint
  - `/src/modules/lightning/services/invoice.service.ts` - Invoice generation service (mock for now)
  - API Gateway route: `GET /lnurl/callback`
- LNURL-pay callback flow:
  1. Sender's wallet calls callback URL with amount parameter
  2. Endpoint validates amount within min/max range
  3. Endpoint generates Lightning invoice (mock bolt11 for now)
  4. Returns JSON with invoice and payment metadata
- Request parameters:
  - `amount` (required): Payment amount in millisats (query param)
  - `comment` (optional): Payment comment/memo (query param, max 280 chars)
- Response format (LUD-06 compliant):
  ```json
  {
    "pr": "lnbc...",
    "routes": [],
    "successAction": {
      "tag": "message",
      "message": "Payment received! Thank you."
    }
  }
  ```
- Mock invoice generation:
  - Generate valid-looking bolt11 invoice structure
  - Use deterministic payment hash based on amount + timestamp
  - Include payment amount in invoice
  - Set expiry to 10 minutes (600 seconds)
- Input validation:
  - Amount must be integer >= minSendable and <= maxSendable
  - Comment must be <= 280 characters if provided
- Error responses:
  - 400 if amount missing or invalid
  - 400 if amount outside allowed range
  - 400 if comment exceeds max length
  - 500 if invoice generation fails
- Failure modes: Returns error JSON with status and reason per LUD-06 spec

**Acceptance Criteria**
- AC-2.2.a: When GET /lnurl/callback?amount=10000 requested → returns 200 with valid LNURL-pay response JSON in <1s
- AC-2.2.b: When amount within allowed range → response contains pr field with valid bolt11 invoice format
- AC-2.2.c: When amount < minSendable → returns 400 with error JSON containing reason
- AC-2.2.d: When amount > maxSendable → returns 400 with error JSON containing reason
- AC-2.2.e: When amount parameter missing → returns 400 with error JSON
- AC-2.2.f: When comment provided and <= 280 chars → request succeeds and comment stored/logged
- AC-2.2.g: When comment > 280 chars → returns 400 with error JSON
- AC-2.2.h: When successAction present in response → contains tag:"message" and message field

**Acceptance Tests**
- Test-2.2.a: Integration test validates callback with valid amount returns 200 in <1s
- Test-2.2.b: Integration test validates pr field matches bolt11 format (starts with "lnbc", contains amount)
- Test-2.2.c: Integration test validates amount=500 (below min 1000) returns 400 with error.reason
- Test-2.2.d: Integration test validates amount=200000000 (above max) returns 400 with error.reason
- Test-2.2.e: Integration test validates callback without amount parameter returns 400
- Test-2.2.f: Integration test validates callback with comment="test payment" succeeds and comment logged
- Test-2.2.g: Integration test validates callback with 281-char comment returns 400
- Test-2.2.h: Integration test validates successAction object structure with tag and message fields

---

### 2.3 DNS Configuration & Domain Routing
Configure DNS and domain routing to make Lightning Address discoverable and route requests to API.

**Implementation Details**
- Dependencies: Requires 2.1, 2.2 (working LNURL endpoints)
- Systems affected:
  - Domain DNS settings (brianstoker.com)
  - API Gateway custom domain configuration
  - SSL/TLS certificate (AWS Certificate Manager or existing cert)
- DNS configuration:
  - Point brianstoker.com (or subdomain) to API Gateway
  - Ensure /.well-known/lnurlp/ routes correctly
  - Configure HTTPS with valid SSL certificate
- Two routing approaches:
  1. Use apex domain (brianstoker.com) → requires A/ALIAS record to API Gateway
  2. Use subdomain (api.brianstoker.com) → requires CNAME to API Gateway
- API Gateway custom domain:
  - Domain name: brianstoker.com or api.brianstoker.com
  - Base path mapping: map to API Gateway stage
  - Certificate: ACM certificate for domain (must be in us-east-1 for edge-optimized)
- Lightning Address verification:
  - Test with Lightning wallet (e.g., Alby, Zeus, Breez)
  - Verify address resolves: pay@brianstoker.com
- Failure modes: DNS propagation delays (24-48hrs), certificate validation failures, routing misconfigurations

**Acceptance Criteria**
- AC-2.3.a: When HTTPS request to https://brianstoker.com/.well-known/lnurlp/pay → returns 200 with valid metadata in <2s
- AC-2.3.b: When SSL certificate validated → certificate is valid, not expired, matches domain
- AC-2.3.c: When Lightning wallet queries pay@brianstoker.com → successfully resolves to LNURL-pay metadata endpoint
- AC-2.3.d: When DNS lookup performed → domain resolves to API Gateway IP/endpoint
- AC-2.3.e: When HTTP (non-HTTPS) request attempted → redirects to HTTPS or returns error

**Acceptance Tests**
- Test-2.3.a: Integration test validates curl https://brianstoker.com/.well-known/lnurlp/pay returns 200 in <2s
- Test-2.3.b: Integration test validates SSL certificate with openssl s_client, verifies valid and matches domain
- Test-2.3.c: Manual test with Lightning wallet validates pay@brianstoker.com resolves successfully
- Test-2.3.d: Integration test validates DNS resolution returns expected IP/CNAME
- Test-2.3.e: Integration test validates HTTP request either redirects to HTTPS (301/302) or returns 4xx error

---

## Phase 3: NWC Integration & Voltage API
**Purpose:** Replace mock invoice generation with real Voltage API integration via Nostr Wallet Connect protocol. This phase enables actual Lightning invoice generation and payment reception on the Voltage node.

### 3.1 Nostr Client & NWC Connection
Implement Nostr client to establish and maintain NWC connection with Voltage node.

**Implementation Details**
- Dependencies: Requires Phase 1 (secrets management), Phase 2 (LNURL endpoints)
- Systems affected:
  - `/src/modules/nwc/` - New NWC module
  - `/src/modules/nwc/services/nostr-client.service.ts` - Nostr WebSocket client
  - `/src/modules/nwc/services/nwc-connection.service.ts` - NWC protocol handler
- Nostr dependencies:
  - `nostr-tools` - Nostr protocol utilities (event signing, verification)
  - `ws` - WebSocket client for relay connection
- NWC connection flow:
  1. Load Nostr private key from Secrets Manager
  2. Connect to NWC relay via WebSocket
  3. Subscribe to events for wallet pubkey
  4. Maintain persistent connection with auto-reconnect
  5. Handle NIP-47 request/response messages
- NWC protocol (NIP-47) implementation:
  - Request structure: Nostr event kind 23194 with encrypted content
  - Response structure: Nostr event kind 23195 with encrypted content
  - Encryption: NIP-04 encryption/decryption
  - Supported methods: `make_invoice`, `get_balance`, `get_info`
- Connection management:
  - Persistent connection with heartbeat/ping every 30s
  - Automatic reconnection on disconnect (exponential backoff)
  - Connection status monitoring (connected, disconnected, error)
  - Graceful shutdown on Lambda termination
- Error handling:
  - Relay connection failures
  - Encryption/decryption errors
  - Invalid event format errors
  - Timeout on responses (30s timeout)
- Failure modes: Connection fails if relay unreachable, invalid keys, or network issues

**Acceptance Criteria**
- AC-3.1.a: When NWC service initialized → successfully connects to Nostr relay via WebSocket in <5s
- AC-3.1.b: When connection established → subscribes to events for wallet pubkey and receives subscription confirmation
- AC-3.1.c: When connection drops → automatically attempts reconnection with exponential backoff (1s, 2s, 4s, 8s, 16s, 30s max)
- AC-3.1.d: When Nostr event received → successfully decrypts NIP-04 encrypted content using private key
- AC-3.1.e: When sending NWC request → event properly formatted as kind 23194 with encrypted content
- AC-3.1.f: When NWC response not received within 30s → request times out with error
- AC-3.1.g: When Lambda shutdown signal received → gracefully closes WebSocket connection

**Acceptance Tests**
- Test-3.1.a: Integration test validates connection to Nostr relay mock succeeds in <5s
- Test-3.1.b: Integration test validates subscription event sent and REQ message received
- Test-3.1.c: Unit test validates reconnection logic with exponential backoff timing
- Test-3.1.d: Unit test validates NIP-04 decryption with test keypair and sample encrypted content
- Test-3.1.e: Unit test validates NWC request event structure (kind 23194, encrypted content, valid signature)
- Test-3.1.f: Integration test validates request timeout after 30s with no response
- Test-3.1.g: Integration test validates WebSocket close event sent on graceful shutdown

---

### 3.2 Voltage API Invoice Generation
Implement real Lightning invoice generation using Voltage API via NWC protocol.

**Implementation Details**
- Dependencies: Requires 3.1 (working NWC connection)
- Systems affected:
  - `/src/modules/lightning/services/invoice.service.ts` - Replace mock with real implementation
  - `/src/modules/nwc/services/nwc-wallet.service.ts` - Voltage wallet operations
- Replace mock invoice generation from Phase 2.2 with real Voltage API calls
- NWC `make_invoice` method:
  - Request parameters:
    - `amount`: Amount in millisats (integer)
    - `description`: Invoice description/memo (string, optional)
    - `expiry`: Invoice expiry in seconds (default 600)
  - Response format:
    - `invoice`: bolt11 invoice string
    - `payment_hash`: Payment hash (hex)
    - `expires_at`: Expiry timestamp (unix seconds)
- Invoice generation flow:
  1. Validate amount within allowed range
  2. Create invoice description from metadata + optional comment
  3. Send NWC `make_invoice` request to Voltage
  4. Wait for response (with timeout)
  5. Return bolt11 invoice to caller
- Invoice metadata:
  - Include Lightning Address identifier
  - Include payment comment if provided
  - Hash metadata per LNURL spec for verification
- Error handling:
  - Voltage API errors (insufficient liquidity, routing issues)
  - NWC protocol errors (invalid request, unsupported method)
  - Timeout errors (no response)
  - Invalid response format
- Retry logic:
  - Retry on transient errors (network issues) - max 3 attempts
  - No retry on permanent errors (invalid amount, insufficient liquidity)
- Failure modes: Returns error if Voltage unreachable, insufficient liquidity, or NWC request fails

**Acceptance Criteria**
- AC-3.2.a: When invoice requested with valid amount → returns real bolt11 invoice from Voltage in <3s
- AC-3.2.b: When bolt11 invoice generated → payment hash matches invoice and is valid 32-byte hex string
- AC-3.2.c: When invoice generated → expiry set to 10 minutes (600 seconds) from creation
- AC-3.2.d: When comment provided → invoice description includes comment text
- AC-3.2.e: When Voltage API returns error → error propagated with clear message (e.g., "insufficient liquidity")
- AC-3.2.f: When NWC request times out → returns 500 error after 30s
- AC-3.2.g: When transient network error occurs → automatically retries up to 3 times before failing
- AC-3.2.h: When invoice requested for amount > available liquidity → returns clear error about liquidity

**Acceptance Tests**
- Test-3.2.a: Integration test validates invoice generation via NWC mock returns bolt11 in <3s
- Test-3.2.b: Integration test validates payment_hash field is 64-char hex string and matches hash in bolt11
- Test-3.2.c: Integration test validates invoice expiry timestamp is current_time + 600 seconds
- Test-3.2.d: Integration test validates comment "test payment" appears in invoice description
- Test-3.2.e: Integration test validates Voltage error response propagates with error message
- Test-3.2.f: Integration test validates timeout after 30s when mock doesn't respond
- Test-3.2.g: Unit test validates retry logic attempts 3 times for network errors with backoff
- Test-3.2.h: Integration test validates liquidity error when requested amount exceeds available

---

### 3.3 Payment Webhook & Verification
Implement webhook endpoint to receive payment notifications from Voltage when invoices are paid.

**Implementation Details**
- Dependencies: Requires 3.2 (real invoice generation)
- Systems affected:
  - `/src/modules/lightning/controllers/webhook.controller.ts` - Webhook endpoint
  - `/src/modules/lightning/services/payment-verification.service.ts` - Payment verification
  - API Gateway route: `POST /webhooks/voltage`
- Voltage webhook flow:
  1. Voltage sends POST request to webhook URL when invoice paid
  2. Endpoint validates webhook signature/authentication
  3. Endpoint verifies payment details (amount, hash)
  4. Endpoint logs payment event
  5. Endpoint returns 200 to acknowledge receipt
- Webhook request format (Voltage-specific):
  - Headers: `X-Voltage-Signature` for verification
  - Body: JSON with payment details (payment_hash, amount, settled_at, etc.)
- Webhook verification:
  - Verify signature using shared secret (stored in Secrets Manager)
  - Validate payment_hash matches expected format
  - Verify amount matches invoice amount
  - Check payment not already processed (idempotency)
- Idempotency tracking:
  - Use in-memory cache (30min TTL) to track processed payment hashes
  - Prevent duplicate processing of same payment
- Payment logging:
  - Structured log with payment details
  - Include: payment_hash, amount_sats, settled_at, comment (if provided)
  - Log level: info for successful payments, warn for verification failures
- Error handling:
  - 401 if signature invalid
  - 400 if request format invalid
  - 200 even if payment already processed (idempotent)
- Failure modes: Webhook fails verification if signature invalid, silently ignores if already processed

**Acceptance Criteria**
- AC-3.3.a: When valid webhook POST received → verifies signature and returns 200 in <500ms
- AC-3.3.b: When webhook signature invalid → returns 401 with error message
- AC-3.3.c: When webhook body invalid JSON → returns 400 with error message
- AC-3.3.d: When payment_hash missing in webhook → returns 400 with error message
- AC-3.3.e: When payment successfully verified → structured log entry created with payment details
- AC-3.3.f: When same payment_hash received twice within 30min → both requests return 200 but second is not reprocessed
- AC-3.3.g: When payment amount verified → logged amount matches invoice amount
- AC-3.3.h: When webhook processing fails → returns 500 but does not lose payment data

**Acceptance Tests**
- Test-3.3.a: Integration test validates valid webhook request returns 200 in <500ms
- Test-3.3.b: Integration test validates invalid signature returns 401
- Test-3.3.c: Integration test validates malformed JSON returns 400
- Test-3.3.d: Integration test validates missing payment_hash returns 400
- Test-3.3.e: Integration test validates CloudWatch log contains payment details (hash, amount, timestamp)
- Test-3.3.f: Integration test sends duplicate webhook, validates both return 200 but only one processed
- Test-3.3.g: Integration test validates logged amount equals webhook amount field
- Test-3.3.h: Integration test validates error during processing returns 500 and payment logged before error

---

## Phase 4: Testing & Security Hardening
**Purpose:** Implement comprehensive testing, security hardening, error handling, and performance optimizations to ensure production readiness. This phase validates all previous work and adds protective measures.

### 4.1 End-to-End Integration Tests
Create comprehensive integration test suite covering full Lightning Address payment flow.

**Implementation Details**
- Dependencies: Requires Phase 3 (complete NWC integration and webhooks)
- Systems affected:
  - `/albyhub/test/` - Integration test directory
  - `/albyhub/test/e2e/` - End-to-end test specs
- Testing framework:
  - Jest for test runner
  - Supertest for HTTP endpoint testing
  - Test containers or mocks for external dependencies
- Test coverage areas:
  1. Lightning Address resolution flow
  2. LNURL-pay invoice generation flow
  3. Payment webhook processing flow
  4. Error scenarios and edge cases
  5. Performance and timeout scenarios
- E2E test scenarios:
  - **Happy path**: Query metadata → request invoice → webhook notification → verify payment logged
  - **Amount validation**: Test min/max boundaries
  - **Comment handling**: Test with/without comments, max length
  - **Error recovery**: Network failures, Voltage API errors, timeouts
  - **Concurrent requests**: Multiple invoice requests in parallel
  - **Idempotency**: Duplicate webhook delivery
- Mock external services:
  - NWC relay (mock WebSocket server)
  - Voltage API responses
  - AWS Secrets Manager
  - Webhook signature generation
- Test data fixtures:
  - Sample bolt11 invoices
  - Sample webhook payloads
  - Sample NWC events
  - Test keypairs for Nostr
- Performance testing:
  - Cold start simulation
  - Response time validation (<2s for all endpoints)
  - Concurrent request handling
- Failure modes: Tests fail if any acceptance criteria from previous phases not met

**Acceptance Criteria**
- AC-4.1.a: When full E2E test suite executed → all tests pass in <60s
- AC-4.1.b: When happy path test runs → metadata query, invoice generation, webhook delivery all succeed with mocked services
- AC-4.1.c: When amount boundary tests run → correctly rejects below min and above max, accepts valid range
- AC-4.1.d: When comment tests run → accepts valid comments, rejects oversized comments
- AC-4.1.e: When error scenario tests run → all error cases handled gracefully with proper status codes
- AC-4.1.f: When concurrent request test runs → 10 parallel invoice requests all succeed without race conditions
- AC-4.1.g: When test coverage measured → minimum 80% code coverage across all modules
- AC-4.1.h: When performance test runs → all endpoints respond within SLA (<2s for p95)

**Acceptance Tests**
- Test-4.1.a: E2E test validates `npm run test:e2e` completes in <60s with all passing
- Test-4.1.b: E2E test validates full flow from metadata → invoice → webhook using mocks
- Test-4.1.c: E2E test validates amount=999 rejected, amount=1001 accepted, amount=100000001 rejected
- Test-4.1.d: E2E test validates 280-char comment accepted, 281-char rejected
- Test-4.1.e: E2E test validates 500 error on Voltage timeout, 400 on invalid amount, 401 on bad webhook signature
- Test-4.1.f: E2E test runs 10 concurrent invoice generation requests, all return unique invoices
- Test-4.1.g: Coverage test validates `npm run test:coverage` reports >=80% coverage
- Test-4.1.h: Performance test measures p95 response time for each endpoint under load, all <2s

---

### 4.2 Security Hardening & Input Validation
Implement comprehensive security measures, input validation, rate limiting, and attack prevention.

**Implementation Details**
- Dependencies: Requires 4.1 (tested application)
- Systems affected:
  - All controllers and DTOs
  - `/src/common/guards/` - Security guards
  - `/src/common/decorators/` - Validation decorators
  - API Gateway configuration
- Security measures:
  1. **Input validation**: Strict DTO validation with class-validator
  2. **Rate limiting**: Prevent abuse of invoice generation
  3. **Request size limits**: Max payload size 100KB
  4. **SQL injection prevention**: N/A (no database yet, but parameterized queries if added)
  5. **XSS prevention**: Sanitize all string inputs, especially comments
  6. **CSRF protection**: N/A for API-only endpoints
  7. **Secrets protection**: Never log or expose in errors
- Input validation rules:
  - Amount: integer, min 1000, max 100000000 (configurable)
  - Comment: string, max 280 chars, sanitize HTML/script tags
  - All query params: whitelist allowed parameters
  - Payment hash: 64-char hex string pattern
- Rate limiting (API Gateway):
  - Burst limit: 20 requests
  - Steady-state limit: 10 requests/second per IP
  - Apply to invoice generation endpoint
  - Metadata endpoint can have higher limit (read-only)
- Request validation:
  - Content-Type validation for POST requests
  - Max request body size: 100KB
  - Request timeout: 29s (Lambda max)
- Sanitization:
  - Strip HTML tags from comment field
  - Escape special characters in logs
  - Validate URL formats in LNURL responses
- Error message security:
  - Never expose internal implementation details
  - Never expose secret values or keys
  - Generic error messages for external users
  - Detailed errors only in server logs
- Security headers:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Strict-Transport-Security: max-age=31536000
  - X-XSS-Protection: 1; mode=block
- Failure modes: Requests rejected with 400 if validation fails, 429 if rate limited

**Acceptance Criteria**
- AC-4.2.a: When request exceeds rate limit → returns 429 with Retry-After header
- AC-4.2.b: When comment contains HTML tags → tags stripped before processing
- AC-4.2.c: When comment contains script tag → request rejected or tag sanitized
- AC-4.2.d: When invalid payment hash format in webhook → returns 400 with validation error
- AC-4.2.e: When request body > 100KB → returns 413 (payload too large)
- AC-4.2.f: When error occurs → error message never contains secret values or internal paths
- AC-4.2.g: When HTTPS response sent → includes security headers (HSTS, X-Frame-Options, etc.)
- AC-4.2.h: When amount parameter is string instead of integer → validation fails with 400

**Acceptance Tests**
- Test-4.2.a: Load test sends 30 requests in 1 second, validates 11th+ return 429
- Test-4.2.b: Integration test sends comment="<b>test</b>" and validates HTML stripped
- Test-4.2.c: Integration test sends comment="<script>alert('xss')</script>" and validates rejection or sanitization
- Test-4.2.d: Integration test sends webhook with payment_hash="invalid" and validates 400 response
- Test-4.2.e: Integration test sends 101KB payload and validates 413 response
- Test-4.2.f: Integration test triggers Secrets Manager error and validates error response doesn't contain secret key values
- Test-4.2.g: Integration test validates all responses include Strict-Transport-Security header
- Test-4.2.h: Integration test sends amount="abc" and validates 400 with validation error detail

---

### 4.3 Error Handling & Resilience
Implement comprehensive error handling, retry logic, circuit breakers, and graceful degradation.

**Implementation Details**
- Dependencies: Requires 4.2 (security hardened application)
- Systems affected:
  - All service classes
  - `/src/common/filters/` - Exception filters
  - `/src/common/interceptors/` - Error interceptors
- Error categorization:
  - **Client errors (4xx)**: Invalid input, validation failures, unauthorized
  - **Server errors (5xx)**: Voltage API failures, NWC failures, internal errors
  - **Transient errors**: Network timeouts, temporary unavailability
  - **Permanent errors**: Invalid credentials, insufficient liquidity
- Error handling strategy:
  1. **Graceful degradation**: Return user-friendly errors
  2. **Automatic retry**: For transient failures
  3. **Circuit breaker**: Prevent cascading failures
  4. **Fallback mechanisms**: Alternative approaches when possible
  5. **Alerting**: Log critical errors for monitoring
- Retry logic:
  - Transient errors: Retry 3 times with exponential backoff (100ms, 200ms, 400ms)
  - Network timeouts: Retry 2 times
  - Permanent errors: No retry, fail immediately
  - Use `axios-retry` or custom retry decorator
- Circuit breaker (optional, for production):
  - Monitor Voltage API failure rate
  - Open circuit if failure rate > 50% over 1 minute
  - Half-open after 30s to test recovery
  - Use `opossum` library or custom implementation
- Timeout configuration:
  - Voltage API calls: 10s timeout
  - NWC requests: 30s timeout
  - Overall Lambda execution: 29s (API Gateway limit)
- Error response format:
  ```json
  {
    "status": "ERROR",
    "reason": "User-friendly error message",
    "code": "VOLTAGE_UNAVAILABLE"
  }
  ```
- Error codes:
  - `INVALID_AMOUNT`: Amount validation failed
  - `VOLTAGE_UNAVAILABLE`: Voltage API unreachable
  - `NWC_CONNECTION_FAILED`: NWC connection issue
  - `INSUFFICIENT_LIQUIDITY`: Cannot create invoice due to liquidity
  - `INTERNAL_ERROR`: Generic server error
- Logging strategy:
  - Error level: All 5xx errors, external API failures
  - Warn level: Retry attempts, rate limit hits
  - Info level: Successful operations
  - Debug level: Detailed flow for troubleshooting
- Failure modes: Errors logged and returned to client, alerts triggered for critical failures

**Acceptance Criteria**
- AC-4.3.a: When Voltage API returns 500 → automatically retries 3 times before returning error to client
- AC-4.3.b: When NWC request times out after 30s → returns 500 with TIMEOUT error code
- AC-4.3.c: When permanent error occurs (e.g., invalid credentials) → does not retry, returns error immediately
- AC-4.3.d: When error response sent to client → includes status:"ERROR", reason, and code fields
- AC-4.3.e: When 5xx error occurs → error logged with level ERROR including stack trace
- AC-4.3.f: When retry logic executes → each attempt logged with attempt number
- AC-4.3.g: When Lambda execution approaches 29s timeout → returns graceful timeout error instead of Lambda timeout
- AC-4.3.h: When multiple consecutive Voltage failures occur → circuit breaker opens and fast-fails subsequent requests

**Acceptance Tests**
- Test-4.3.a: Integration test with failing Voltage mock validates 3 retry attempts with exponential backoff
- Test-4.3.b: Integration test with 30s NWC timeout validates timeout error response with correct code
- Test-4.3.c: Integration test with 401 Voltage error validates no retry and immediate error return
- Test-4.3.d: Integration test validates error response JSON structure matches expected format
- Test-4.3.e: Integration test triggers 500 error and validates CloudWatch log contains ERROR level with stack trace
- Test-4.3.f: Integration test validates retry logs show "Attempt 1/3", "Attempt 2/3", "Attempt 3/3"
- Test-4.3.g: Integration test simulates 28s execution time and validates graceful timeout response
- Test-4.3.h: Integration test sends 10 requests with Voltage failures, validates circuit opens after threshold

---

### 4.4 Performance Optimization
Optimize Lambda bundle size, cold starts, and response times to meet performance SLAs.

**Implementation Details**
- Dependencies: Requires 4.3 (complete error handling)
- Systems affected:
  - Build configuration (esbuild, webpack)
  - Lambda function configuration
  - `/sst.config.ts` - Lambda optimizations
- Optimization strategies:
  1. **Bundle size reduction**: Minimize Lambda deployment package
  2. **Cold start optimization**: Reduce initialization time
  3. **Connection pooling**: Reuse connections across invocations
  4. **Caching**: Cache configuration and secrets
  5. **Lazy loading**: Load modules on-demand
  6. **Memory optimization**: Right-size Lambda memory
- Bundle optimization:
  - Use esbuild for fast, efficient bundling
  - Tree-shake unused dependencies
  - External: mark AWS SDK as external (included in Lambda runtime)
  - Minification: Enable for production builds
  - Source maps: Separate source maps, not inline
  - Target bundle size: <1MB compressed
- Cold start optimization:
  - Minimize top-level imports
  - Use dynamic imports for heavy dependencies
  - Lazy initialize NWC connection on first use
  - Provision warming for critical endpoints (optional)
  - Use Graviton2 (arm64) for faster performance
- Connection management:
  - Reuse NWC WebSocket connection across invocations
  - Keep connection alive between requests
  - Global connection instance outside handler
- Caching strategy:
  - Cache secrets in memory for 30min after first load
  - Cache NWC connection state
  - Cache compiled regex patterns
  - No caching of invoice data (must be fresh)
- Memory optimization:
  - Test with 256MB, 512MB, 1024MB
  - Monitor memory usage via CloudWatch
  - Choose optimal memory for cost/performance
  - Current target: 512MB
- Monitoring:
  - CloudWatch metrics: cold start duration, warm start duration, memory usage
  - Custom metrics: invoice generation time, NWC request time
  - Percentile tracking: p50, p95, p99 response times
- Failure modes: Performance degrades gracefully, may hit cold start SLA but still functional

**Acceptance Criteria**
- AC-4.4.a: When Lambda bundle built → compressed size < 1MB
- AC-4.4.b: When Lambda cold start occurs → initialization completes in <3s (p95)
- AC-4.4.c: When Lambda warm start occurs → request completes in <500ms (p95)
- AC-4.4.d: When secrets loaded second time within 30min → retrieved from cache without AWS API call
- AC-4.4.e: When NWC connection established → reused across subsequent Lambda invocations
- AC-4.4.f: When invoice generation measured → completes in <2s (p95) including Voltage API call
- AC-4.4.g: When Lambda memory usage monitored → peak memory < 80% of allocated memory
- AC-4.4.h: When bundle analyzed → no duplicate dependencies or unnecessary packages included

**Acceptance Tests**
- Test-4.4.a: Build test validates compressed Lambda zip file size <1MB
- Test-4.4.b: Performance test measures cold start time over 10 iterations, p95 <3s
- Test-4.4.c: Performance test measures warm start time over 100 iterations, p95 <500ms
- Test-4.4.d: Unit test validates secrets service uses cache on second call, AWS SDK not invoked
- Test-4.4.e: Integration test validates NWC connection object persists across invocations (global state)
- Test-4.4.f: Performance test measures invoice generation time over 50 requests, p95 <2s
- Test-4.4.g: Load test monitors CloudWatch memory metrics, validates peak < 400MB with 512MB allocated
- Test-4.4.h: Bundle analysis test validates no duplicate packages using webpack-bundle-analyzer

---

## Phase 5: Deployment & Monitoring
**Purpose:** Deploy to production, establish monitoring and alerting, and validate system operates correctly in live environment. This phase ensures operational readiness and provides visibility into system health.

### 5.1 Production Deployment
Deploy application to production AWS environment with proper configuration and validation.

**Implementation Details**
- Dependencies: Requires Phase 4 (tested, optimized application)
- Systems affected:
  - AWS Lambda production environment
  - API Gateway production stage
  - AWS Secrets Manager production secrets
  - CloudWatch production log groups
  - DNS production configuration
- Deployment strategy:
  1. Create production stage in SST config
  2. Deploy secrets to production Secrets Manager
  3. Execute `sst deploy --stage production`
  4. Verify health checks pass
  5. Configure DNS for production domain
  6. Validate end-to-end with test payment
- Pre-deployment checklist:
  - [ ] All Phase 4 acceptance tests passing
  - [ ] Production secrets created in Secrets Manager
  - [ ] Voltage node operational with sufficient liquidity
  - [ ] NWC connection tested with production credentials
  - [ ] DNS records prepared (not yet applied)
  - [ ] SSL certificate valid and configured
  - [ ] API Gateway rate limits configured
  - [ ] CloudWatch alarms configured (see 5.2)
- Deployment steps:
  1. Backup existing configuration (if applicable)
  2. Deploy Lambda function via SST
  3. Verify Lambda deployed successfully
  4. Test health endpoints
  5. Update DNS to point to production API Gateway
  6. Verify Lightning Address resolution
  7. Send test payment to validate full flow
  8. Monitor logs and metrics for 24 hours
- Rollback plan:
  - Revert DNS changes if issues detected
  - Redeploy previous Lambda version if critical bug found
  - SST maintains versioned deployments for easy rollback
- Blue-green deployment (future enhancement):
  - Deploy new version alongside old
  - Gradually shift traffic
  - Monitor error rates
  - Full cutover or rollback
- Failure modes: Deployment fails if tests not passing, secrets missing, or AWS permissions insufficient

**Acceptance Criteria**
- AC-5.1.a: When `sst deploy --stage production` executed → deployment completes successfully in <10 minutes
- AC-5.1.b: When deployment completes → GET /health returns 200 in production environment
- AC-5.1.c: When deployment completes → GET /health/ready returns 200 with all components healthy
- AC-5.1.d: When DNS configured → https://brianstoker.com/.well-known/lnurlp/pay returns valid metadata
- AC-5.1.e: When test invoice requested → real Voltage invoice generated successfully
- AC-5.1.f: When test payment sent → payment received and webhook processed successfully
- AC-5.1.g: When production logs examined → no ERROR level logs during deployment
- AC-5.1.h: When rollback executed (if needed) → previous version restored in <5 minutes

**Acceptance Tests**
- Test-5.1.a: Deployment test validates `sst deploy --stage production` completes without errors
- Test-5.1.b: Integration test validates curl https://api.brianstoker.com/health returns 200
- Test-5.1.c: Integration test validates /health/ready returns healthy status for all components
- Test-5.1.d: Integration test validates Lightning Address metadata endpoint accessible via production domain
- Test-5.1.e: Manual test generates test invoice via LNURL callback, validates bolt11 from Voltage
- Test-5.1.f: Manual test sends 1000 sat payment via Lightning wallet, validates webhook received
- Test-5.1.g: Log analysis validates no ERROR level logs in first hour post-deployment
- Test-5.1.h: Rollback drill validates previous version deployment completes in <5 minutes

---

### 5.2 Monitoring & Alerting
Establish comprehensive monitoring, logging, and alerting for production system health and performance.

**Implementation Details**
- Dependencies: Requires 5.1 (production deployment)
- Systems affected:
  - CloudWatch Logs - structured logging
  - CloudWatch Metrics - performance metrics
  - CloudWatch Alarms - alerting
  - Optional: External monitoring (Datadog, New Relic, etc.)
- Monitoring dimensions:
  1. **Application metrics**: Request rates, error rates, latency
  2. **Business metrics**: Invoice generation count, payment count, payment volume
  3. **Infrastructure metrics**: Lambda duration, memory usage, cold starts
  4. **External dependencies**: Voltage API availability, NWC connection status
- CloudWatch custom metrics:
  - `InvoiceGenerationCount`: Counter for invoices generated
  - `InvoiceGenerationDuration`: Histogram of invoice generation time
  - `PaymentReceivedCount`: Counter for payments received
  - `PaymentAmount`: Distribution of payment amounts
  - `VoltageAPIErrors`: Counter for Voltage API failures
  - `NWCConnectionStatus`: Gauge for connection health (1=up, 0=down)
- CloudWatch alarms:
  1. **High error rate**: >5% error rate over 5 minutes → alert
  2. **Voltage API failures**: >10 failures in 5 minutes → alert
  3. **NWC connection down**: Connection down for >2 minutes → alert
  4. **High latency**: p95 latency >3s for 5 minutes → alert
  5. **No payments**: No payments received in 7 days → info alert
  6. **Lambda errors**: Any Lambda function error → alert
- Alert destinations:
  - Email: Send to personal email for critical alerts
  - SNS topic: Create SNS topic for alarm notifications
  - Optional: Slack webhook for real-time notifications
- Log insights queries:
  - Error rate by endpoint
  - Invoice generation success rate
  - Payment volume by hour/day
  - Average invoice generation time
  - Top error messages
- Dashboard creation:
  - CloudWatch dashboard with key metrics
  - Panels: Request rate, error rate, latency, payment volume
  - Auto-refresh every 1 minute
- Log retention:
  - Production logs: 30 days retention
  - Archive to S3 for long-term storage (optional)
- Failure modes: Monitoring failures should not impact application, alerts may be delayed if CloudWatch issues

**Acceptance Criteria**
- AC-5.2.a: When invoice generated → custom metric InvoiceGenerationCount incremented in CloudWatch
- AC-5.2.b: When payment received → custom metric PaymentReceivedCount incremented with amount tag
- AC-5.2.c: When error rate exceeds 5% → CloudWatch alarm triggers and notification sent in <5 minutes
- AC-5.2.d: When Voltage API fails 10 times in 5min → alarm triggers with notification
- AC-5.2.e: When NWC connection drops → alarm triggers within 2 minutes
- AC-5.2.f: When CloudWatch dashboard accessed → displays all key metrics updated in real-time
- AC-5.2.g: When Log Insights query executed → returns accurate error rate and latency percentiles
- AC-5.2.h: When alarm triggers → SNS notification delivered to configured email address

**Acceptance Tests**
- Test-5.2.a: Integration test generates invoice and validates CloudWatch metric data point appears within 1min
- Test-5.2.b: Integration test processes webhook and validates PaymentReceivedCount metric incremented
- Test-5.2.c: Load test triggers 20 errors in 5min, validates alarm state changes to ALARM
- Test-5.2.d: Integration test simulates 10 Voltage failures, validates alarm triggered
- Test-5.2.e: Integration test disconnects NWC, validates alarm triggered within 2min
- Test-5.2.f: Manual test validates dashboard loads and shows recent data points
- Test-5.2.g: Log Insights query test validates accurate results for error rate calculation
- Test-5.2.h: Alarm test validates SNS message delivered to email (check inbox)

---

### 5.3 Documentation & Runbook
Create operational documentation, runbooks, and troubleshooting guides for maintaining the system.

**Implementation Details**
- Dependencies: Requires 5.2 (monitoring in place)
- Systems affected:
  - Documentation files in repository
  - README updates
  - Runbook creation
- Documentation deliverables:
  1. **README.md**: Project overview, setup instructions, deployment guide
  2. **RUNBOOK.md**: Operational procedures and troubleshooting
  3. **ARCHITECTURE.md**: System architecture and design decisions
  4. **API.md**: API endpoint documentation
  5. **SECRETS.md**: Secrets management and rotation procedures
- README contents:
  - Project description and goals
  - Prerequisites (Node.js, AWS CLI, SST)
  - Local development setup
  - Environment variables required
  - Deployment instructions
  - Testing procedures
  - License and contact info
- Runbook contents:
  - Common operational tasks
  - Troubleshooting guides for common issues
  - Alert response procedures
  - Rollback procedures
  - Secrets rotation procedures
  - NWC connection recovery steps
  - Voltage node health checks
  - Performance tuning guide
- Architecture documentation:
  - System architecture diagram
  - Request flow diagrams (Lightning Address → invoice → payment)
  - Component interaction diagrams
  - Technology stack and rationale
  - Security architecture
  - Scalability considerations
- API documentation:
  - Endpoint specifications (path, method, parameters, responses)
  - Example requests and responses
  - Error codes and meanings
  - Rate limits and quotas
  - Webhook specifications
- Troubleshooting scenarios:
  - "Invoice generation failing" → check Voltage node health, NWC connection
  - "High latency" → check cold starts, Voltage API response time
  - "Webhook not received" → check Voltage webhook configuration, endpoint accessibility
  - "NWC connection dropped" → reconnection procedure, check relay health
  - "Secrets not loading" → check Secrets Manager permissions, secret names
- Failure modes: Missing documentation slows troubleshooting but doesn't affect application runtime

**Acceptance Criteria**
- AC-5.3.a: When README.md opened → contains complete setup and deployment instructions
- AC-5.3.b: When RUNBOOK.md opened → contains procedures for all common operational tasks
- AC-5.3.c: When troubleshooting scenario encountered → runbook provides clear resolution steps
- AC-5.3.d: When new team member follows README → can successfully deploy to dev environment
- AC-5.3.e: When API.md consulted → provides complete specification for all endpoints
- AC-5.3.f: When architecture diagram viewed → clearly shows all system components and interactions
- AC-5.3.g: When alert received → runbook provides response procedure for that alert type
- AC-5.3.h: When secrets rotation needed → SECRETS.md provides step-by-step procedure

**Acceptance Tests**
- Test-5.3.a: Documentation review validates README includes all required sections
- Test-5.3.b: Documentation review validates RUNBOOK includes all common scenarios
- Test-5.3.c: Manual test follows runbook troubleshooting steps for test scenario, validates resolution
- Test-5.3.d: Onboarding test (separate AWS account) follows README, validates successful deployment
- Test-5.3.e: API documentation review validates all endpoints documented with examples
- Test-5.3.f: Architecture review validates diagrams present and accurate
- Test-5.3.g: Alert response test validates each alarm type has runbook procedure
- Test-5.3.h: Secrets rotation test follows SECRETS.md procedure, validates successful rotation

---

### 5.4 Production Validation & Load Testing
Perform final production validation and load testing to ensure system meets performance SLAs under realistic traffic.

**Implementation Details**
- Dependencies: Requires 5.1, 5.2, 5.3 (deployed, monitored, documented system)
- Systems affected:
  - Production Lambda environment
  - Voltage node (real payments)
  - CloudWatch metrics and logs
- Validation scenarios:
  1. **Functional validation**: End-to-end payment flow with real Lightning wallet
  2. **Performance validation**: Response time SLAs under load
  3. **Reliability validation**: System stability over extended period
  4. **Error handling validation**: Graceful degradation under failure conditions
- Load testing approach:
  - Use k6, Artillery, or Locust for load generation
  - Gradual ramp-up: 1 → 10 → 50 → 100 requests/min
  - Test duration: 30 minutes per scenario
  - Monitor CloudWatch metrics during test
- Load test scenarios:
  1. **Normal load**: 10 invoice requests/min for 30min
  2. **Peak load**: 50 invoice requests/min for 10min
  3. **Spike load**: Burst to 100 requests in 1min, then return to normal
  4. **Sustained load**: 20 requests/min for 2 hours
- Validation checklist:
  - [ ] Lightning Address resolves successfully
  - [ ] Invoice generation completes in <2s (p95)
  - [ ] Real payment received and webhook processed
  - [ ] Error rate <1% under normal load
  - [ ] Error rate <5% under peak load
  - [ ] No Lambda timeouts or crashes
  - [ ] NWC connection remains stable
  - [ ] Voltage API integration reliable
  - [ ] Logs and metrics flowing correctly
  - [ ] Alarms functioning as expected
- Real payment test:
  - Send small test payment (1000 sats) from personal wallet
  - Verify invoice generated correctly
  - Verify payment received on Voltage node
  - Verify webhook delivered and processed
  - Verify payment logged correctly
- Soak testing (optional):
  - Run at moderate load (10 req/min) for 24 hours
  - Monitor for memory leaks, connection leaks
  - Validate no degradation over time
- Failure condition testing:
  - Temporarily disable Voltage API → validate error handling
  - Disconnect NWC → validate reconnection logic
  - Send invalid webhooks → validate rejection
  - Exceed rate limits → validate 429 responses
- Success criteria:
  - All SLAs met under expected load
  - Real payments processed successfully
  - No critical errors or crashes
  - Monitoring and alerting working correctly
- Failure modes: Load test may reveal performance bottlenecks or reliability issues requiring tuning

**Acceptance Criteria**
- AC-5.4.a: When real payment sent via Lightning wallet → invoice generated and payment received successfully
- AC-5.4.b: When load test at 10 req/min executed → p95 latency <2s for 30min duration
- AC-5.4.c: When load test at 50 req/min executed → error rate <5% and no Lambda timeouts
- AC-5.4.d: When spike test (100 req in 1min) executed → all requests handled, may have increased latency but no failures
- AC-5.4.e: When sustained load test (2hr) executed → no memory leaks, connection leaks, or performance degradation
- AC-5.4.f: When Voltage API disabled during test → error rate increases but system remains stable, returns errors gracefully
- AC-5.4.g: When NWC disconnected during test → automatic reconnection succeeds within 30s
- AC-5.4.h: When load test completes → all CloudWatch metrics and alarms functioned correctly

**Acceptance Tests**
- Test-5.4.a: Manual test sends 1000 sat payment from Lightning wallet, validates end-to-end success
- Test-5.4.b: Load test with k6 runs 10 req/min scenario, validates p95 latency metric <2s
- Test-5.4.c: Load test runs 50 req/min scenario, validates error rate <5% in CloudWatch metrics
- Test-5.4.d: Spike test generates 100 requests in 60s, validates all complete (200 or 429 status)
- Test-5.4.e: Soak test runs 2hr at 10 req/min, validates Lambda memory usage stable (no upward trend)
- Test-5.4.f: Failure test disables Voltage mock, validates 500 errors returned and alarms triggered
- Test-5.4.g: Failure test drops NWC connection, validates reconnection within 30s and logs show recovery
- Test-5.4.h: Post-test validation checks CloudWatch dashboard shows accurate metrics and alarms triggered appropriately

---

## 3. Completion Criteria

The project is considered complete when all of the following conditions are met:

**Phase Completion:**
- All acceptance criteria from Phases 1-5 have been validated and pass
- All acceptance tests from Phases 1-5 are green (100% pass rate)
- No open P0 (critical) or P1 (high priority) issues remain

**Production Validation:**
- Real Lightning payment successfully received via pay@brianstoker.com in production
- Invoice generation consistently completes in <2s (p95 latency)
- System maintains 99.9% uptime over 7-day observation period
- Error rate <1% under normal load conditions
- All CloudWatch alarms configured and tested

**Documentation:**
- README.md, RUNBOOK.md, ARCHITECTURE.md, API.md, and SECRETS.md complete and reviewed
- All endpoints documented with examples
- Troubleshooting procedures tested and validated

**Testing:**
- Unit test coverage ≥80% across all modules
- All integration tests passing
- End-to-end tests covering happy path and error scenarios passing
- Load testing validates performance SLAs met under expected traffic
- Real payment test successful in production

**Security:**
- All secrets stored in AWS Secrets Manager (none in code or environment variables)
- Input validation implemented for all endpoints
- Rate limiting configured and tested
- Security headers present in all responses
- No secrets exposed in logs or error messages

**Operational Readiness:**
- Production deployment successful via SST
- Health check endpoints operational
- Monitoring metrics flowing to CloudWatch
- Alerting configured and tested
- Runbook procedures validated

---

## 4. Rollout & Validation

### Rollout Strategy

**Phase 1: Internal Testing (Week 1-2)**
- Deploy to development/staging environment
- Conduct internal testing with testnet/development Lightning wallets
- Validate all endpoints and workflows
- Performance testing with synthetic load
- No external users

**Phase 2: Controlled Production Rollout (Week 3)**
- Deploy to production AWS environment
- DNS not yet updated (API accessible only via direct API Gateway URL)
- Send test payments from personal Lightning wallets
- Validate real Voltage integration
- Monitor metrics and logs for 48 hours
- Max exposure: Personal testing only

**Phase 3: DNS Cutover (Week 3-4)**
- Update DNS to point brianstoker.com to production API Gateway
- Lightning Address pay@brianstoker.com now publicly discoverable
- Monitor metrics closely for first 24 hours
- Publicize Lightning Address to small audience (social media post)
- Gradual exposure: Limited initial announcement

**Phase 4: Full Public Availability (Week 4+)**
- Lightning Address fully operational and advertised
- Add to website, social media profiles, etc.
- Monitor performance and reliability continuously
- Gather feedback from users sending payments
- Iterate on improvements based on real-world usage

**Rollback Triggers:**
- Error rate exceeds 10% for >5 minutes → immediate DNS rollback
- Critical security vulnerability discovered → immediate rollback, fix, redeploy
- Voltage node becomes unresponsive → rollback or fix node
- Payment loss or fund safety issue → immediate rollback and investigation

### Post-Launch Validation

**Metrics to Monitor (First 30 Days):**

**Application Health:**
- Uptime: Target 99.9% (max 43min downtime/month)
- Error rate: Target <1% for all requests
- API response time: p95 <2s, p99 <3s
- Lambda cold start rate: <10% of invocations
- Lambda error rate: 0 errors expected

**Business Metrics:**
- Invoice generation count: Track daily volume
- Payment success rate: Target 100% of invoices paid successfully
- Average payment amount: Track for analytics
- Failed invoice generation attempts: Investigate all failures

**External Dependencies:**
- Voltage API availability: Monitor for downtime or degradation
- Voltage API latency: Track p95, p99 response times
- NWC connection uptime: Target 100% connection stability
- NWC request success rate: Target 100% of requests succeed

**Infrastructure:**
- Lambda execution duration: Ensure within 29s limit
- Lambda memory utilization: Track for right-sizing
- CloudWatch log volume: Monitor costs
- API Gateway request count: Track usage patterns

**Monitoring Cadence:**
- **First 24 hours**: Check metrics every 2 hours
- **First week**: Daily review of all metrics and logs
- **First month**: Weekly review and monthly report
- **Ongoing**: Weekly metric review, immediate alert response

**Success Indicators:**
- At least 1 real payment received and processed successfully
- Zero payment failures or fund loss
- Zero critical security incidents
- Uptime SLA met (99.9%)
- Performance SLA met (p95 <2s)
- No customer complaints or issues reported

**Rollback Decision Points:**
- If error rate >10% sustained for >30 minutes → roll back
- If uptime falls below 99% in first week → investigate and potentially rollback
- If any fund loss or security incident → immediate rollback
- If Voltage integration unstable (>50% failure rate) → rollback or fix Voltage config

---

## 5. Open Questions

**Technical Questions:**
1. **Voltage API Rate Limits**: What is the exact Voltage API rate limit, and how should we handle throttling? (Assume 100 req/min until confirmed)
   - Impact: May need to implement request queuing or additional rate limiting
   - Decision needed by: Before Phase 3 completion

2. **Invoice Expiration**: What should the invoice expiration timeout be? (Suggested: 10 minutes)
   - Impact: Affects user experience and expired invoice cleanup
   - Decision needed by: Before Phase 2.2 implementation

3. **Payment Tracking Database**: Do we need a database for tracking invoices and payments, or can we rely on Voltage node state and logs?
   - Impact: Affects architecture, costs, and complexity
   - Decision needed by: Before Phase 3 completion
   - Current approach: Rely on Voltage state + logs, add database if needed later

4. **Nostr Relay Selection**: Which Nostr relay should we use for NWC? Public relay (wss://relay.damus.io) or private relay?
   - Impact: Affects reliability, latency, and privacy
   - Decision needed by: Before Phase 3.1 implementation
   - Suggestion: Start with public relay, migrate to private if issues

**Business/Operational Questions:**
5. **Payment Amount Limits**: What should the minimum and maximum payment amounts be? (Suggested: 1 sat min, 1M sats max)
   - Impact: Affects risk exposure and user experience
   - Decision needed by: Before Phase 2.1 implementation
   - Current values: minSendable=1000 (1 sat), maxSendable=100000000 (1M sats)

6. **Payment Notifications**: Should we implement payment notifications (email/push) when payments are received?
   - Impact: Adds complexity but improves user awareness
   - Decision needed by: Post-MVP (Phase 5+)
   - Current approach: Out of scope for MVP, rely on Voltage node notifications

7. **CORS Configuration**: Do we need CORS configuration for future web integration? Which origins should be allowed?
   - Impact: Required for browser-based wallet integrations
   - Decision needed by: Before Phase 1.2 (SST configuration)
   - Current approach: Enable CORS with wildcard (*) for MVP, restrict later

8. **Logging Detail Level**: What level of logging detail is appropriate for payment events? Should we log payment amounts, comments, sender info?
   - Impact: Affects privacy, storage costs, and debugging capability
   - Decision needed by: Before Phase 1.4 implementation
   - Suggestion: Log payment hash, amount, timestamp; avoid PII

**Security Questions:**
9. **Secrets Rotation**: How often should Nostr keys and API credentials be rotated? What's the rotation procedure?
   - Impact: Affects security posture and operational overhead
   - Decision needed by: Before production deployment (Phase 5.1)
   - Suggestion: Annual rotation, document procedure in SECRETS.md

10. **Webhook Authentication**: Should we implement additional webhook authentication beyond signature verification (e.g., IP allowlist)?
    - Impact: Improves security but adds configuration complexity
    - Decision needed by: Before Phase 3.3 implementation
    - Suggestion: Start with signature verification, add IP allowlist if needed

**Infrastructure Questions:**
11. **Lambda Memory Allocation**: What is the optimal Lambda memory allocation for cost vs. performance? (Current: 512MB)
    - Impact: Affects costs and cold start times
    - Decision needed by: During Phase 4.4 optimization
    - Approach: Test with 256MB, 512MB, 1024MB and choose optimal

12. **Provisioned Concurrency**: Should we use Lambda provisioned concurrency to eliminate cold starts for critical endpoints?
    - Impact: Eliminates cold starts but increases costs significantly
    - Decision needed by: After initial production deployment and traffic analysis
    - Current approach: No provisioned concurrency for MVP, evaluate based on traffic

**Future Enhancements (Post-MVP):**
13. **Multiple Lightning Addresses**: Should we support additional Lightning Addresses (e.g., tips@brianstoker.com)?
    - Impact: Requires multi-tenant architecture changes
    - Decision needed by: Post-MVP
    - Current approach: Out of scope, single address only

14. **Payment Analytics Dashboard**: Should we build an admin dashboard for viewing payment history and analytics?
    - Impact: Useful for insights but adds significant development effort
    - Decision needed by: Post-MVP
    - Current approach: Out of scope, use CloudWatch Logs Insights for now

15. **Accounting Integration**: Should we integrate with accounting tools (e.g., QuickBooks, Xero) for automatic payment recording?
    - Impact: Useful for tax reporting but complex integration
    - Decision needed by: Post-MVP
    - Current approach: Out of scope, manual export from logs if needed

---

**Document Version:** 1.0
**Status:** Final
**Next Review Date:** Upon Phase 1 completion
