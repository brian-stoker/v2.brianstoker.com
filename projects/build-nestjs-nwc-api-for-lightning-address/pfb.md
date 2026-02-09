# NestJS NWC API for Lightning Address

## 1. Feature Overview
**Feature Name:** Lightning Address NWC API
**Owner:** Brian Stoker
**Status:** Draft
**Target Release:** Q1 2026

### Summary
A serverless NestJS API deployed on AWS Lambda via SST that enables Lightning Network payments through a Lightning Address (pay@brianstoker.com) with Nostr Wallet Connect (NWC) integration to a Voltage-hosted Lightning node. This feature enables seamless reception of Bitcoin Lightning payments using a human-readable email-style address while maintaining full custody through a personal Lightning node.

---

## 2. Problem Statement
### What problem are we solving?
Currently, there is no automated way to receive Lightning Network payments via the Lightning Address pay@brianstoker.com connected to a personal Voltage node. Users wanting to send payments have no simple endpoint to resolve the Lightning Address to an invoice, and there's no programmatic way to connect applications to the Lightning wallet using Nostr Wallet Connect protocol.

### Who is affected?
- Primary user: Brian Stoker (owner of the Lightning node and domain)
- Secondary users: Anyone wanting to send Lightning payments to pay@brianstoker.com (content creators, social media followers, business contacts)

### Why now?
- Lightning Address adoption is growing as the standard for Lightning payments
- NWC is becoming the preferred protocol for wallet-to-app connections in the Nostr ecosystem
- Personal Lightning node on Voltage is operational and ready for integration
- Domain brianstoker.com is controlled and available for configuration

---

## 3. Goals & Success Metrics
### Goals
- Enable automated Lightning payment reception via pay@brianstoker.com
- Implement LNURL-pay protocol for invoice generation
- Establish NWC connection to Voltage node for programmatic wallet operations
- Deploy serverless infrastructure with minimal operational overhead
- Maintain full custody of funds through personal Lightning node

### Success Metrics (How we'll know it worked)
- Successfully receive first payment via pay@brianstoker.com (0 → 1 successful payment)
- API endpoint responds to LNURL requests < 2 seconds (p95)
- Zero downtime for critical payment endpoints (99.9% uptime)
- Lambda cold start time < 3 seconds
- Successfully generate invoices via NWC connection (100% success rate)

---

## 4. User Experience & Scope
### In Scope
- LNURL-pay endpoint implementation at /.well-known/lnurlp/pay
- Lightning Address metadata endpoint
- NWC relay connection to Voltage node
- Invoice generation via Voltage API
- Payment webhook handling for payment confirmations
- DNS configuration for Lightning Address resolution
- SSL/TLS certificate management
- Environment variable management for secrets (API keys, NWC credentials)
- Basic error handling and logging
- Deployment via SST to AWS Lambda

### Out of Scope
- Admin dashboard or UI
- Multi-user support (single Lightning Address only)
- Payment analytics or reporting
- Fiat conversion or pricing
- Mobile app or wallet implementation
- Payment splitting or forwarding
- Recurring payment subscriptions
- LNURL-withdraw or LNURL-auth
- Custom payment amounts restrictions

---

## 5. Assumptions & Constraints
### Assumptions
- Voltage node is operational with API access enabled
- Voltage node has sufficient inbound liquidity for receiving payments
- Domain brianstoker.com DNS can be configured for Lightning Address
- AWS account has necessary permissions for Lambda, API Gateway, and related services
- NWC relay service is available and accessible
- Nostr keypair for NWC connection is generated and secured
- Payment amounts will be specified by senders (no fixed pricing)

### Constraints
**Technical:**
- AWS Lambda cold starts (3-5 second latency possible)
- Lambda execution timeout (max 29 seconds for API Gateway)
- Voltage API rate limits (TBD - assume 100 req/min)
- NWC relay latency and availability

**Legal / Compliance:**
- Self-custodial setup (no third-party custody compliance needed)
- Personal use only (no money transmission license required)

**Timeline:**
- Target completion: 4-6 weeks from project start
- MVP deployment: 2 weeks

**Resources:**
- Single developer (Brian Stoker)
- No additional budget required beyond existing AWS/Voltage costs

---

## 6. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Lambda cold starts cause timeout on LNURL requests | High - Failed payment attempts | Implement provisioned concurrency for critical endpoints; optimize bundle size; consider warming strategy |
| Voltage API downtime prevents invoice generation | High - Cannot receive payments | Implement retry logic with exponential backoff; add health check endpoint; set up monitoring alerts |
| NWC connection loss | Medium - Cannot programmatically interact with wallet | Implement automatic reconnection logic; fallback to direct Voltage API; monitor connection health |
| DNS misconfiguration breaks Lightning Address resolution | High - Address not discoverable | Thoroughly test DNS setup; document configuration; implement monitoring for endpoint availability |
| Nostr private key compromise | Critical - Wallet access compromise | Store keys in AWS Secrets Manager; implement key rotation capability; use minimal permissions |
| Invoice generation race conditions | Medium - Duplicate invoices | Implement idempotency keys; use database for invoice tracking if needed |
| Insufficient inbound liquidity | Medium - Cannot receive larger payments | Monitor channel liquidity; document liquidity requirements; implement max payment amount |

---

## 7. Dependencies
### Team Dependencies
- None (solo project)

### External Systems / Vendors
- **Voltage:** Lightning node hosting and API access
  - Requires: API credentials, node macaroon, connection URL
- **Nostr Relay:** For NWC protocol communication
  - Requires: Relay URL, Nostr keypair
- **AWS Services:**
  - Lambda (compute)
  - API Gateway (HTTP endpoints)
  - Secrets Manager (credential storage)
  - CloudWatch (logging and monitoring)
  - Route 53 or external DNS (if applicable)
- **Domain registrar:** For DNS configuration of brianstoker.com

### Data or Infrastructure Dependencies
- SSL certificate for HTTPS (required for Lightning Address)
- Environment variables: Voltage API key, NWC credentials, Nostr keys
- Well-known directory configuration (/.well-known/lnurlp/)

---

## 8. Open Questions
- What is the Voltage API rate limit and does it support our expected traffic?
- Should we implement invoice expiration and what should the timeout be? (Suggested: 10 minutes)
- Do we need a database for tracking invoices or can we rely on Voltage node state?
- What should the minimum and maximum payment amounts be? (Suggested: 1 sat min, 1M sats max)
- Which Nostr relay should we use for NWC? (Public relay vs. private?)
- Should we implement payment notifications (email/push) when payments are received?
- Do we need CORS configuration for future web integration?
- What level of logging detail is appropriate for payment events?

---

## 9. Non-Goals
Success does **not** require:
- Building a full wallet management interface
- Supporting multiple Lightning Addresses or users
- Implementing complex payment routing or splitting logic
- Creating a mobile or web application UI
- Providing payment analytics, dashboards, or reporting
- Supporting LNURL-withdraw, LNURL-auth, or other LNURL variants
- Fiat currency integration or pricing
- Multi-currency support
- Payment refund mechanisms
- Integration with accounting or ERP systems
- High-frequency trading or exchange-level performance
- Advanced fraud detection or KYC/AML compliance

---

## 10. Notes & References
### Technical References
- [LNURL-pay specification](https://github.com/lnurl/luds/blob/luds/06.md) (LUD-06)
- [Lightning Address specification](https://github.com/lnurl/luds/blob/luds/16.md) (LUD-16)
- [Nostr Wallet Connect (NWC) specification](https://github.com/nostr-protocol/nips/blob/master/47.md) (NIP-47)
- [NestJS Documentation](https://docs.nestjs.com/)
- [SST Documentation](https://docs.sst.dev/)
- [Voltage API Documentation](https://docs.voltage.cloud/)

### Design Decisions
- **Why NestJS?** Structured framework with TypeScript support, dependency injection, and excellent module organization for maintainability
- **Why Lambda?** Serverless architecture minimizes operational overhead and costs for low-to-medium traffic
- **Why SST?** Modern infrastructure-as-code with excellent TypeScript support and local development experience
- **Why NWC?** Standard protocol for programmatic wallet interactions in the Nostr/Lightning ecosystem

### Related Work
- Existing SST configuration in repository (sst.config.ts)
- Domain infrastructure already in place (brianstoker.com)
- Voltage node operational and accessible

### Security Considerations
- All secrets stored in AWS Secrets Manager (never in code)
- Nostr private keys with minimal required permissions
- API endpoints behind HTTPS only
- Input validation on all payment requests
- Rate limiting to prevent abuse

### Future Enhancements (Post-MVP)
- Payment notification system (webhook to other services)
- Simple admin dashboard for viewing payment history
- Payment memo/comment support
- Integration with accounting tools
- Support for additional Lightning Addresses
- Custom payment amount presets or QR codes
