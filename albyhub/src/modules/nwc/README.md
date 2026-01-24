# NWC (Nostr Wallet Connect) Module

## Overview

The NWC module implements Nostr Wallet Connect (NIP-47) protocol for establishing and maintaining persistent connections to Lightning wallets via Nostr relays. This enables secure, encrypted communication for Lightning Network operations.

## Architecture

### Services

#### NostrClientService
WebSocket client for Nostr relay connections.

**Features:**
- Persistent WebSocket connection to Nostr relays
- Automatic reconnection with exponential backoff (1s, 2s, 4s, 8s, 16s, 30s max)
- Heartbeat/ping mechanism (30s interval)
- Subscription management (REQ/CLOSE messages)
- Event publishing with signature verification
- Graceful shutdown handling

**Connection Lifecycle:**
1. Connect to relay via WebSocket
2. Subscribe to events matching filters
3. Maintain connection with heartbeat
4. Auto-reconnect on disconnect
5. Graceful shutdown on module destroy

#### NwcConnectionService
NIP-47 protocol handler for NWC communication.

**Features:**
- NIP-04 encryption/decryption for secure messaging
- NIP-47 request/response handling
- Request timeout management (30s default)
- Connection status monitoring
- Pending request tracking

**Supported NWC Methods:**
- `make_invoice` - Create Lightning invoice
- `get_balance` - Query wallet balance
- `get_info` - Get wallet information

## Protocol Details

### NIP-47 Event Structure

**Request Event (Kind 23194):**
```json
{
  "kind": 23194,
  "content": "<encrypted NIP-04>",
  "tags": [["p", "<wallet_pubkey>"]],
  "created_at": 1234567890,
  "pubkey": "<client_pubkey>",
  "sig": "<signature>"
}
```

**Response Event (Kind 23195):**
```json
{
  "kind": 23195,
  "content": "<encrypted NIP-04>",
  "tags": [
    ["p", "<client_pubkey>"],
    ["e", "<request_event_id>"]
  ],
  "created_at": 1234567890,
  "pubkey": "<wallet_pubkey>",
  "sig": "<signature>"
}
```

### Encryption

NIP-04 encryption is used for all request/response content:
- Shared secret derived from ECDH (client private key + wallet public key)
- AES-256-CBC encryption
- Base64 encoding

## Configuration

Required secrets (stored in AWS Secrets Manager):

```json
{
  "NOSTR_PRIVATE_KEY": "hex-encoded private key (64 chars)",
  "NOSTR_PUBLIC_KEY": "wallet's public key (hex)",
  "NWC_RELAY_URL": "wss://relay.example.com"
}
```

## Usage

### Basic Usage

```typescript
import { NwcConnectionService } from './modules/nwc/services/nwc-connection.service';

// Service auto-initializes on module startup
// and connects to configured relay

// Make invoice
const response = await nwcService.makeInvoice(1000, 'Payment description');

// Get balance
const balance = await nwcService.getBalance();

// Get wallet info
const info = await nwcService.getInfo();
```

### Connection Status

```typescript
// Check connection status
const status = nwcService.getConnectionStatus();

// Check if ready to send requests
const isReady = nwcService.isReady();
```

## Error Handling

### Connection Errors
- **Timeout**: Connection attempt exceeds 5s timeout
- **Relay Error**: WebSocket connection fails
- **Network Error**: Network connectivity issues

**Recovery**: Automatic reconnection with exponential backoff

### Request Errors
- **Timeout**: Request exceeds 30s timeout
- **Not Connected**: Relay connection is down
- **Invalid Response**: Decryption or parsing fails
- **NWC Error**: Wallet returns error response

**Response**: Reject promise with descriptive error

## Testing

### Unit Tests
- Connection lifecycle (connect, disconnect, reconnect)
- Exponential backoff calculation
- Event handling (EVENT, EOSE, OK, NOTICE)
- NIP-04 encryption/decryption
- Request timeout handling
- Graceful shutdown

### Integration Tests
- Relay connection with mock WebSocket
- Subscription flow
- Request/response cycle
- Error scenarios

Run tests:
```bash
pnpm test nostr-client.service.spec.ts
pnpm test nwc-connection.service.spec.ts
```

## Performance Considerations

- **Connection Time**: <5s to establish WebSocket connection
- **Heartbeat**: 30s interval to keep connection alive
- **Request Timeout**: 30s default (configurable)
- **Reconnect Backoff**: Max 30s delay between attempts
- **Memory**: Minimal overhead for pending requests tracking

## Security

- Private keys loaded from AWS Secrets Manager (encrypted at rest)
- All NWC communication encrypted with NIP-04
- Event signatures verified before processing
- No secrets logged or exposed in errors

## References

- [NIP-04: Encrypted Direct Messages](https://github.com/nostr-protocol/nips/blob/master/04.md)
- [NIP-47: Nostr Wallet Connect](https://github.com/nostr-protocol/nips/blob/master/47.md)
- [Nostr Tools Library](https://github.com/nbd-wtf/nostr-tools)
