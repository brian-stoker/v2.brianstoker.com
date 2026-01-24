# Voltage API Invoice Generation via NWC

## Overview

This document describes the implementation of real Lightning invoice generation using Voltage API via the Nostr Wallet Connect (NWC) protocol, replacing the mock implementation from Phase 2.2.

## Implementation Date

January 24, 2026

## Components

### 1. NwcWalletService (`/albyhub/src/modules/nwc/services/nwc-wallet.service.ts`)

**Purpose**: Manages Voltage wallet operations via NWC protocol

**Key Features**:
- Real Lightning invoice generation via `make_invoice` NWC method
- Exponential backoff retry logic for transient errors
- Error mapping from NWC error codes to user-friendly messages
- Balance and wallet info retrieval

**Methods**:
- `makeInvoice(params)`: Generate Lightning invoice
  - Parameters:
    - `amount`: Amount in millisatoshis
    - `description`: Invoice description/memo
    - `expiry`: Invoice expiry in seconds (default: 600)
  - Returns:
    - `invoice`: bolt11 invoice string
    - `payment_hash`: Payment hash (64-char hex)
    - `expires_at`: Expiry timestamp (unix seconds)

- `getBalance()`: Retrieve wallet balance
- `getInfo()`: Retrieve wallet information

**Retry Logic**:
- Maximum 3 retry attempts
- Exponential backoff: 100ms → 200ms → 400ms (up to 5s max)
- Retries transient errors: network issues, timeouts, rate limits
- No retry for permanent errors: invalid amount, insufficient liquidity, unauthorized

**Error Handling**:
- Maps NWC error codes to clear messages:
  - `INSUFFICIENT_LIQUIDITY` → "Insufficient liquidity: ..."
  - `INVALID_AMOUNT` → "Invalid amount: ..."
  - `RATE_LIMITED` → "Rate limited: ..."
  - `UNAUTHORIZED` → "Unauthorized: ..."
- Validates payment hash format (64-char hex string)
- Validates response structure

### 2. InvoiceService (`/albyhub/src/modules/lightning/services/invoice.service.ts`)

**Purpose**: High-level invoice generation service for Lightning Address/LNURL

**Updates**:
- Added `generateInvoice()` method for real invoice generation
- Creates invoice description from LNURL metadata + optional comment
- Hashes metadata per LNURL spec (LUD-06)
- Maintains existing `generateMockInvoice()` for backwards compatibility

**Methods**:
- `generateInvoice(amountMillisats, metadata, comment?)`:
  - Async method using NwcWalletService
  - Includes metadata hash in description
  - Sets 10-minute (600s) expiry
  - Returns: `{ bolt11, payment_hash, expires_at }`

**Description Format**:
- With comment: `"<comment> [<metadata_hash_prefix>...]"`
- Without comment: `"Payment [<metadata_hash_prefix>...]"`

### 3. LnurlController (`/albyhub/src/modules/lightning/controllers/lnurl.controller.ts`)

**Updates**:
- Modified `/lnurl/callback` endpoint to use async `generateInvoice()`
- Returns real bolt11 invoice from Voltage API
- Maintains LUD-06 compliant response format

## Invoice Generation Flow

1. **Request arrives** at `/lnurl/callback?amount=<msats>&comment=<text>`
2. **Validation**:
   - Amount within min/max sendable range
   - Comment within max length (280 chars)
3. **Metadata creation**:
   - JSON array: `[["text/plain", "..."], ["text/identifier", "..."]]`
   - SHA256 hash of metadata for verification
4. **Invoice generation**:
   - Call `InvoiceService.generateInvoice()`
   - Create description with metadata hash + comment
   - Call `NwcWalletService.makeInvoice()`
   - Send NWC request via `NwcConnectionService`
   - Wait for response with 30s timeout
   - Retry on transient errors (up to 3 times)
5. **Response**:
   - Returns LUD-06 compliant response with bolt11 invoice
   - Includes success action message

## Error Scenarios

### Voltage API Errors
- **Insufficient Liquidity**: Clear error message to user
- **Invalid Amount**: Validation error (should be caught earlier)
- **Rate Limited**: Automatic retry (transient error)

### Network Errors
- **Timeout**: 30-second timeout, then error
- **Connection Refused**: Automatic retry up to 3 times
- **Connection Lost**: Reject all pending requests

### Protocol Errors
- **Invalid Response**: Missing fields or malformed data
- **Invalid Payment Hash**: Not 64-char hex string
- **Missing Result**: Response without result or error

## Testing

### Unit Tests
- **NwcWalletService**: 21 tests covering all acceptance criteria
- **InvoiceService**: 15 tests for `generateInvoice()` method
- **RetryLogic**: Tests for exponential backoff and retry behavior

### Integration Tests
All tests verify:
- ✅ AC-3.2.a: Invoice generation in <3s
- ✅ AC-3.2.b: Valid 64-char hex payment hash
- ✅ AC-3.2.c: 600-second expiry from creation
- ✅ AC-3.2.d: Comment included in description
- ✅ AC-3.2.e: Clear error propagation
- ✅ AC-3.2.f: 30-second timeout handling
- ✅ AC-3.2.g: 3-attempt retry with backoff
- ✅ AC-3.2.h: Liquidity error when amount exceeds available

## Performance

- **Typical invoice generation**: <3s (usually <1s)
- **Timeout threshold**: 30s
- **Retry delays**: 100ms, 200ms, 400ms (exponential)
- **Max total time with retries**: ~31s (with 3 retries)

## Dependencies

- **NwcConnectionService**: NIP-47 protocol implementation
- **NostrClientService**: Nostr relay connection
- **SecretsService**: Voltage API credentials

## Configuration

Environment variables (from `.env`):
- `NOSTR_PRIVATE_KEY`: Client private key (hex)
- `NOSTR_PUBLIC_KEY`: Wallet public key (hex)
- `NOSTR_RELAY_URL`: Nostr relay WebSocket URL
- `MIN_SENDABLE`: Minimum payment amount (millisats)
- `MAX_SENDABLE`: Maximum payment amount (millisats)

## Security Considerations

1. **Metadata Hashing**: Per LNURL spec to prevent tampering
2. **Payment Hash Validation**: Ensures 32-byte hex string
3. **Error Sanitization**: Maps internal errors to safe messages
4. **Timeout Protection**: Prevents indefinite waits
5. **Retry Limits**: Prevents infinite retry loops

## Future Improvements

1. **Dynamic Expiry**: Allow custom expiry times
2. **Invoice Caching**: Cache recent invoices
3. **Rate Limiting**: Implement client-side rate limiting
4. **Metrics**: Add Prometheus metrics for monitoring
5. **Circuit Breaker**: Implement circuit breaker pattern for Voltage API

## References

- [NIP-47: Nostr Wallet Connect](https://github.com/nostr-protocol/nips/blob/master/47.md)
- [LUD-06: LNURL-pay](https://github.com/lnurl/luds/blob/luds/06.md)
- [LUD-16: Lightning Address](https://github.com/lnurl/luds/blob/luds/16.md)
- [BOLT #11: Invoice Protocol](https://github.com/lightning/bolts/blob/master/11-payment-encoding.md)
