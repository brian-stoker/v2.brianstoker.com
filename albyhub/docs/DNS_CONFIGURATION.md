# DNS Configuration & Domain Routing for Lightning Address

## Overview

This document provides step-by-step instructions to configure DNS and domain routing for the AlbyHub API to serve Lightning Address (LNURL-pay) via `pay@brianstoker.com`.

The Lightning Address protocol (LUD-16) requires the endpoint to be discoverable at:
```
https://albyhub.brianstoker.com/.well-known/lnurlp/pay
```

## DNS Architecture

### Subdomain Approach

We use a subdomain approach (`albyhub.brianstoker.com`) rather than the main domain for several reasons:

1. **Separation of Concerns** - Lightning API is isolated from main site
2. **Security** - Easier to manage permissions and access controls per subdomain
3. **Scalability** - Multiple subdomains can be added for different services
4. **Certificate Management** - Separate SSL/TLS certificates if needed

### Domain Structure

```
brianstoker.com                    - Main website
├── www.brianstoker.com           - WWW subdomain (if configured)
├── api.brianstoker.com           - Main API (production)
├── albyhub.brianstoker.com       - Lightning Address API (LNURL-pay) ← NEW
└── chat.brianstoker.com          - Chat service (if configured)
```

## Required DNS Records

### Primary CNAME Record

Configure the following DNS record with your domain provider (Cloudflare, Route53, etc.):

```
Type:  CNAME
Name:  albyhub
TTL:   Auto (recommended) or 3600 seconds
Value: <API-Gateway-Domain>
```

**Example values for different configurations:**

| Stage | Target Domain |
|-------|--------------|
| Production | `d-xxxxxxxxxx.execute-api.us-east-1.amazonaws.com` |
| Staging | `d-yyyyyyyyy.execute-api.us-east-1.amazonaws.com` |
| Development | N/A (local testing) |

The exact target domain is provided by AWS API Gateway after deployment. See [Finding Your API Gateway Domain](#finding-your-api-gateway-domain) below.

### Additional Records (Optional)

For enhanced resilience, you can configure:

```
# Health check endpoint (optional)
Type:  CNAME
Name:  albyhub-health
Value: <API-Gateway-Domain>

# Fallback subdomain (optional)
Type:  CNAME
Name:  lnurl
Value: <API-Gateway-Domain>
```

## Step-by-Step Setup

### 1. Deploy the Application

First, ensure the AlbyHub API is deployed to AWS:

```bash
# From project root
sst deploy --stage production
```

This will output:
- API Gateway URL (e.g., `https://d-xxxxxxx.execute-api.us-east-1.amazonaws.com`)
- CloudWatch Log Group
- Lambda Function details

### 2. Find Your API Gateway Domain

After deployment, note the API Gateway domain from the SST output or find it in AWS Console:

```bash
# Option A: Check SST output
sst output --stage production

# Option B: Check AWS Console
# Navigate to: API Gateway → APIs → AlbyHubApi → Stages → prod

# Option C: Use AWS CLI
aws apigateway get-rest-apis --region us-east-1 --query 'items[?name==`AlbyHubApi`].id' --output text
# Then get the domain for that API ID
aws apigateway get-stage --rest-api-id <API-ID> --stage-name prod --region us-east-1 --query 'domainName' --output text
```

### 3. Configure DNS Records

#### Using Cloudflare (Recommended)

1. Log in to Cloudflare Dashboard
2. Select your domain (brianstoker.com)
3. Go to DNS Records
4. Click "Add Record"
5. Fill in:
   - **Type:** CNAME
   - **Name:** albyhub
   - **Target:** `<API-Gateway-Domain>` (from step 2)
   - **TTL:** Auto
   - **Proxy Status:** DNS only (orange cloud) or Proxied (orange cloud)

6. Click Save
7. Allow 5-15 minutes for DNS propagation

#### Using AWS Route53

1. Log in to AWS Console
2. Navigate to Route53
3. Find the hosted zone for `brianstoker.com`
4. Click "Create record"
5. Fill in:
   - **Record name:** albyhub
   - **Record type:** CNAME
   - **Value:** `<API-Gateway-Domain>`
   - **TTL:** 300 (recommended)

6. Click "Create records"
7. Allow 5 minutes for DNS propagation

#### Using GoDaddy, Namecheap, or Other Providers

1. Log in to your domain provider's DNS management panel
2. Find the DNS records section
3. Add a new CNAME record:
   - **Subdomain:** albyhub
   - **Type:** CNAME
   - **Target:** `<API-Gateway-Domain>`
   - **TTL:** 3600 (or provider default)

4. Save changes
5. Allow 5-30 minutes for propagation (varies by provider)

### 4. Verify SSL/TLS Certificate

The SSL/TLS certificate is automatically managed by AWS API Gateway. Verify it's valid:

```bash
# Check certificate details
openssl s_client -connect albyhub.brianstoker.com:443 -servername albyhub.brianstoker.com

# Should show:
# - Subject: CN=albyhub.brianstoker.com
# - Issuer: CN=Amazon (or similar)
# - Not Before: <date>
# - Not After: <date> (should be in future)
```

Or use online tool: https://www.ssl-shopper.com/certificate-checker.html

## Verification Steps

### Step 1: Verify DNS Resolution

```bash
# Test DNS propagation
nslookup albyhub.brianstoker.com

# Expected output:
# Name:   albyhub.brianstoker.com
# Address: <IP-Address>

# Or with more detail:
dig albyhub.brianstoker.com

# Or from any DNS server:
nslookup albyhub.brianstoker.com 8.8.8.8  # Google's DNS
```

### Step 2: Verify HTTPS Connection

```bash
# Test HTTPS endpoint (expect 200 or 405 for GET)
curl -I https://albyhub.brianstoker.com/

# Test Lightning Address endpoint
curl https://albyhub.brianstoker.com/.well-known/lnurlp/pay

# Expected response:
# {
#   "callback": "https://albyhub.brianstoker.com/lnurl/callback",
#   "minSendable": 1000,
#   "maxSendable": 100000000,
#   "metadata": "...",
#   "tag": "payRequest",
#   "commentAllowed": 280
# }
```

### Step 3: Verify Certificate Chain

```bash
# Get certificate chain
curl -I --verbose https://albyhub.brianstoker.com/ 2>&1 | grep -E "subject|issuer|SSL"

# Expected output should include:
# - subject: CN=albyhub.brianstoker.com
# - issuer: CN=Amazon or similar trusted CA
# - No certificate warnings
```

### Step 4: Validate Lightning Address

```bash
# Test the Lightning Address resolution
# The wallet queries this endpoint to get LNURL metadata
curl https://albyhub.brianstoker.com/.well-known/lnurlp/pay

# Expected 200 response with JSON metadata
```

### Step 5: Test Response Times

```bash
# Verify response times < 2 seconds
time curl -w "\nTime: %{time_total}s\n" https://albyhub.brianstoker.com/.well-known/lnurlp/pay

# Expected: time_total < 2.0 seconds
```

## Troubleshooting

### DNS Not Resolving

**Symptoms:** `nslookup: can't find albyhub.brianstoker.com`

**Solutions:**
1. Verify the CNAME record is correctly configured in your DNS provider
2. Check TTL - may need 5-30 minutes for propagation
3. Clear local DNS cache:
   - **macOS:** `sudo dscacheutil -flushcache`
   - **Linux:** `sudo systemctl restart systemd-resolved`
   - **Windows:** `ipconfig /flushdns`
4. Try alternate DNS servers:
   - Google: `nslookup albyhub.brianstoker.com 8.8.8.8`
   - Cloudflare: `nslookup albyhub.brianstoker.com 1.1.1.1`

### SSL Certificate Errors

**Symptoms:** `curl: (60) SSL certificate problem: self-signed certificate`

**Solutions:**
1. Wait 5 minutes after DNS configuration for certificate provisioning
2. Verify certificate is issued by AWS/Amazon:
   ```bash
   openssl s_client -connect albyhub.brianstoker.com:443 -servername albyhub.brianstoker.com | grep Issuer
   ```
3. Check AWS Certificate Manager for certificate status:
   ```bash
   aws acm list-certificates --region us-east-1
   ```
4. If certificate is missing, redeploy:
   ```bash
   sst deploy --stage production
   ```

### Connection Timeout

**Symptoms:** `Connection timed out` when accessing `https://albyhub.brianstoker.com`

**Solutions:**
1. Verify API Gateway is running:
   ```bash
   aws apigateway get-apis --region us-east-1
   ```
2. Check Lambda function is healthy:
   ```bash
   # Invoke health endpoint directly
   aws lambda invoke --function-name AlbyHubFunction --payload '{"requestContext":{"http":{"path":"/health"}},"rawPath":"/health"}' /tmp/response.json
   ```
3. Check CloudWatch logs:
   ```bash
   aws logs tail /aws/lambda/AlbyHubFunction --follow
   ```
4. Verify security groups allow HTTPS (port 443):
   ```bash
   aws ec2 describe-security-groups --filters "Name=group-name,Values=default" --region us-east-1
   ```

### 405 Method Not Allowed

**Symptoms:** `HTTP 405` when testing with curl

**Solutions:**
1. Ensure you're using the correct HTTP method
2. The Lightning Address endpoint only accepts GET:
   ```bash
   curl -X GET https://albyhub.brianstoker.com/.well-known/lnurlp/pay
   ```
3. Check Lambda function routes are configured correctly in `stacks/albyhub.ts`

### Invalid Response

**Symptoms:** Response is not valid JSON or missing expected fields

**Solutions:**
1. Check Lambda function is deployed correctly:
   ```bash
   aws lambda get-function --function-name AlbyHubFunction --region us-east-1
   ```
2. Verify environment variables are set:
   ```bash
   aws lambda get-function-configuration --function-name AlbyHubFunction --region us-east-1 | jq '.Environment.Variables'
   ```
3. Check CloudWatch logs for errors:
   ```bash
   aws logs tail /aws/lambda/AlbyHubFunction --follow --since 5m
   ```
4. Test with verbose curl to see full response:
   ```bash
   curl -v https://albyhub.brianstoker.com/.well-known/lnurlp/pay
   ```

## Acceptance Criteria Validation

After completing the DNS setup, verify all acceptance criteria:

### AC-2.3.a: HTTPS Response Time < 2 seconds

```bash
#!/bin/bash
response_time=$(curl -w "%{time_total}" -o /dev/null -s https://albyhub.brianstoker.com/.well-known/lnurlp/pay)
if (( $(echo "$response_time < 2.0" | bc -l) )); then
  echo "✓ PASS: Response time ${response_time}s < 2s"
else
  echo "✗ FAIL: Response time ${response_time}s >= 2s"
fi
```

### AC-2.3.b: SSL Certificate Validation

```bash
#!/bin/bash
# Check certificate validity
openssl s_client -connect albyhub.brianstoker.com:443 -servername albyhub.brianstoker.com -servername albyhub.brianstoker.com < /dev/null 2>/dev/null | \
  openssl x509 -noout -dates -subject | grep -E "notBefore|notAfter|CN=albyhub"
```

### AC-2.3.c: Lightning Wallet Query

Lightning wallets use LNURL-pay to query the metadata:

```bash
curl https://albyhub.brianstoker.com/.well-known/lnurlp/pay | jq .
```

### AC-2.3.d: DNS Resolution

```bash
dig albyhub.brianstoker.com +short
```

### AC-2.3.e: HTTP Redirect to HTTPS

```bash
curl -I http://albyhub.brianstoker.com/
# Should redirect to HTTPS (HTTP 301/302)
```

## API Gateway Custom Domain Configuration

### Behind the Scenes

When you configure a custom domain in API Gateway, several things happen:

1. **Certificate Creation:** AWS creates/uses an ACM certificate for the domain
   - Region: Must be us-east-1 (CloudFront requirement)
   - Auto-renewal: Enabled
   - Subject Alternative Names: Added for wildcards if needed

2. **DNS Records:** SST manages CNAME records via your DNS provider (Cloudflare)
   - CNAME record points subdomain to API Gateway distribution

3. **Base Path Mapping:** Routes all requests to your API stage
   - Path: / (root path)
   - Destination: AlbyHubApi - prod stage

### Checking Configuration

```bash
# List API Gateway custom domains
aws apigateway get-domain-names --region us-east-1 | jq '.items[] | {name, domainNameStatus, certificateArn}'

# Get specific domain details
aws apigateway get-domain-name --domain-name albyhub.brianstoker.com --region us-east-1

# List base path mappings
aws apigateway get-base-path-mappings --domain-name albyhub.brianstoker.com --region us-east-1
```

## Environment Variables

The following environment variables are available in the Lambda function:

```env
# DNS/Domain Configuration
CUSTOM_DOMAIN=albyhub.brianstoker.com

# LNURL Configuration
LNURL_CALLBACK_URL=https://albyhub.brianstoker.com/lnurl/callback

# Lightning Address Metadata
MIN_SENDABLE=1000                    # millisatoshis
MAX_SENDABLE=100000000              # 100k sats
COMMENT_ALLOWED=280                 # characters
```

## SSL/TLS Certificate Management

### Certificate Details

- **Type:** AWS Certificate Manager (ACM)
- **Region:** us-east-1 (required for API Gateway)
- **Auto-renewal:** Enabled
- **Domain:** albyhub.brianstoker.com
- **Validity:** 1 year (auto-renewed 30 days before expiry)

### Viewing Certificate

```bash
aws acm list-certificates --region us-east-1 --query 'CertificateSummaryList[].{DomainName: DomainName, Status: Status, Arn: CertificateArn}'

# Get full certificate details
aws acm describe-certificate --certificate-arn <CERTIFICATE-ARN> --region us-east-1
```

### Certificate Renewal

AWS automatically renews certificates if:
1. DNS is properly configured
2. Certificate has a route53 record or DNS provider supports validation

If certificate renewal fails:
1. Check CloudWatch for errors
2. Verify DNS CNAME record exists
3. Run `sst deploy --stage production` to trigger renewal
4. Contact AWS Support if issues persist

## Monitoring and Logging

### CloudWatch Logs

API Gateway and Lambda logs are available in CloudWatch:

```bash
# View logs in real-time
aws logs tail /aws/lambda/AlbyHubFunction --follow

# View recent logs (last 5 minutes)
aws logs tail /aws/lambda/AlbyHubFunction --since 5m

# Search for errors
aws logs filter-log-events --log-group-name /aws/lambda/AlbyHubFunction --filter-pattern "ERROR"
```

### CloudWatch Metrics

Monitor your API with these metrics:

```bash
# Get request count
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --start-time 2026-01-24T00:00:00Z \
  --end-time 2026-01-25T00:00:00Z \
  --period 3600 \
  --statistics Sum

# Get error count (4xx and 5xx)
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name 4XXError \
  --start-time 2026-01-24T00:00:00Z \
  --end-time 2026-01-25T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

## Related Documentation

- [SECRETS_MANAGEMENT.md](./SECRETS_MANAGEMENT.md) - AWS Secrets Manager configuration
- [../README.md](../README.md) - AlbyHub API documentation
- [Lightning Address Spec](https://github.com/fiatjaf/lnurl-rfc) - LNURL-pay protocol
- [AWS API Gateway Custom Domain](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html)
- [LUD-16: Lightning Address](https://github.com/lnurl/luds/blob/master/LUD-16.md)
- [LUD-06: LNURL-pay metadata](https://github.com/lnurl/luds/blob/master/LUD-06.md)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section above
2. Review [CloudWatch Logs](#cloudwatch-logs)
3. Check [API Gateway Custom Domain Configuration](#api-gateway-custom-domain-configuration)
4. Consult AWS documentation or contact support
