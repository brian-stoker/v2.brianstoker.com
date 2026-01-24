# Webhook Integration Guide

## Overview

The NestJS NWC API includes a webhook endpoint for receiving payment notifications from Voltage when Lightning invoices are paid.

## Endpoint Details

**URL:** `POST /webhooks/voltage`

**Authentication:** HMAC-SHA256 signature verification

**SLA:** Response time < 500ms

## Voltage Configuration

Configure Voltage to send webhook notifications to:
```
https://your-domain.com/webhooks/voltage
```

### Required Secrets

Add the following secret to AWS Secrets Manager (`albyhub/secrets`):

```json
{
  "VOLTAGE_WEBHOOK_SECRET": "your-webhook-secret-here"
}
```

This secret is used to verify the HMAC-SHA256 signature in the `X-Voltage-Signature` header.

## Request Format

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `X-Voltage-Signature` | Yes | HMAC-SHA256 signature of the request body |
| `Content-Type` | Yes | Must be `application/json` |

### Body

```json
{
  "payment_hash": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "amount_sats": 1000,
  "settled_at": 1706121600,
  "comment": "Optional payment comment",
  "description": "Optional payment description"
}
```

**Field Descriptions:**

- `payment_hash` (required): 64-character hex-encoded payment hash
- `amount_sats` (required): Payment amount in satoshis (must be positive)
- `settled_at` (required): Unix timestamp when payment was settled (seconds)
- `comment` (optional): Payment comment/memo
- `description` (optional): Invoice description

## Response Format

### Success (200 OK)

```json
{
  "status": "ok",
  "message": "Payment received"
}
```

### Duplicate Payment (200 OK - Idempotent)

```json
{
  "status": "ok",
  "message": "Payment already processed"
}
```

### Errors

#### 401 Unauthorized

Missing or invalid signature:

```json
{
  "statusCode": 401,
  "message": "Invalid signature"
}
```

#### 400 Bad Request

Invalid request format or validation failure:

```json
{
  "statusCode": 400,
  "message": "payment_hash must be a 64-character hex string"
}
```

```json
{
  "statusCode": 400,
  "message": "Invalid amount: -100 sats"
}
```

#### 500 Internal Server Error

Unexpected server error:

```json
{
  "statusCode": 500,
  "message": "Error processing webhook"
}
```

## Signature Verification

The webhook endpoint verifies the `X-Voltage-Signature` header using HMAC-SHA256:

```javascript
const crypto = require('crypto');

function generateSignature(body, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  return hmac.digest('hex');
}

// Example
const body = JSON.stringify(payload);
const signature = generateSignature(body, webhookSecret);
```

## Idempotency

The webhook endpoint implements idempotency tracking to prevent duplicate processing:

- **TTL:** 30 minutes
- **Mechanism:** In-memory cache of payment hashes
- **Behavior:** Duplicate webhooks within 30 minutes return 200 OK but are not reprocessed

## Payment Validation

The endpoint validates:

1. **Signature:** HMAC-SHA256 verification using shared secret
2. **Payment Hash:** Must be 64-character hex string
3. **Amount:** Must be positive (> 0 sats)
4. **Timestamp:** Must be within acceptable range:
   - Not more than 1 minute in the future (clock skew tolerance)
   - Not older than 24 hours

## Logging

Successful payments are logged to CloudWatch with structured data:

```json
{
  "level": "info",
  "message": "Payment received and verified",
  "context": "PaymentVerificationService",
  "payment_hash": "1234...cdef",
  "amount_sats": 1000,
  "settled_at": "2026-01-24T21:44:54.000Z",
  "comment": "Optional comment",
  "description": "Optional description",
  "duplicate": false
}
```

Duplicate payments are logged at WARN level with `duplicate: true`.

## Testing

### Unit Tests

Run payment verification service tests:
```bash
npm test -- payment-verification.service.spec.ts
```

Run webhook controller tests:
```bash
npm test -- webhook.controller.spec.ts
```

### Integration Tests

Run integration tests:
```bash
npm test -- webhook.controller.integration.spec.ts
```

All tests validate:
- Signature verification
- Idempotency tracking
- Payment validation
- Error handling
- Response times (<500ms SLA)
- Structured logging

## Performance

- **Target SLA:** < 500ms response time
- **Monitoring:** Requests exceeding 500ms are logged at WARN level
- **Optimization:** In-memory idempotency cache for fast lookups

## Security Considerations

1. **Signature Verification:** All requests must include valid HMAC-SHA256 signature
2. **Timing Attack Protection:** Uses constant-time comparison for signatures
3. **Secret Management:** Webhook secret stored in AWS Secrets Manager
4. **Input Validation:** All fields validated using NestJS validation pipes
5. **Rate Limiting:** Consider adding rate limiting for production

## Error Recovery

The webhook endpoint is designed to be fault-tolerant:

- Returns 500 on unexpected errors but logs payment details before failing
- Voltage should retry failed webhooks automatically
- Idempotency prevents duplicate processing on retries

## Monitoring

Monitor the following metrics:

1. **Response Time:** Should be < 500ms (99th percentile)
2. **Error Rate:** 4xx and 5xx responses
3. **Duplicate Rate:** Percentage of requests marked as duplicates
4. **Signature Failures:** 401 responses indicate potential security issues

## Example cURL Request

```bash
# Generate signature
BODY='{"payment_hash":"1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef","amount_sats":1000,"settled_at":1706121600}'
SIGNATURE=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "your-webhook-secret" | cut -d' ' -f2)

# Send webhook
curl -X POST https://your-domain.com/webhooks/voltage \
  -H "Content-Type: application/json" \
  -H "X-Voltage-Signature: $SIGNATURE" \
  -d "$BODY"
```

## Troubleshooting

### 401 Unauthorized

- Verify webhook secret matches in both Voltage and AWS Secrets Manager
- Ensure signature is calculated from raw request body (not formatted JSON)
- Check that signature is hex-encoded

### 400 Bad Request

- Validate payment_hash is exactly 64 hex characters
- Ensure amount_sats is positive
- Check settled_at timestamp is within valid range

### 500 Internal Server Error

- Check CloudWatch logs for detailed error messages
- Verify AWS Secrets Manager is accessible
- Ensure all required environment variables are set
