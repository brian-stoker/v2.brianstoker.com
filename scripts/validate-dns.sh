#!/bin/bash

# DNS Validation Script for Lightning Address
# Validates DNS configuration, SSL certificates, and connectivity
# Run this AFTER manually configuring DNS records

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="albyhub.brianstoker.com"
LIGHTNING_ENDPOINT="/.well-known/lnurlp/pay"
HEALTH_ENDPOINT="/health"
CALLBACK_ENDPOINT="/lnurl/callback"
TIMEOUT=10

# Initialize counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
print_header() {
  echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
  ((PASSED++))
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
  ((FAILED++))
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
  ((WARNINGS++))
}

print_info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

# Test 1: DNS Resolution
test_dns_resolution() {
  print_header "Test 1: DNS Resolution"

  echo "Testing DNS resolution for $DOMAIN..."

  # Try with nslookup
  if command -v nslookup &> /dev/null; then
    if nslookup "$DOMAIN" &> /dev/null; then
      local ip=$(nslookup "$DOMAIN" | grep "Address:" | tail -1 | awk '{print $2}')
      print_success "DNS resolves to: $ip"
    else
      print_error "DNS does not resolve"
      return 1
    fi
  else
    print_warning "nslookup not available, trying dig"

    if command -v dig &> /dev/null; then
      if dig "$DOMAIN" +short | grep -q .; then
        local ip=$(dig "$DOMAIN" +short | head -1)
        print_success "DNS resolves to: $ip"
      else
        print_error "DNS does not resolve (dig failed)"
        return 1
      fi
    else
      print_warning "Neither nslookup nor dig available, skipping DNS resolution test"
      return 0
    fi
  fi
}

# Test 2: CNAME Record Validation
test_cname_record() {
  print_header "Test 2: CNAME Record Validation"

  echo "Checking CNAME configuration..."

  if command -v dig &> /dev/null; then
    local cname=$(dig "$DOMAIN" CNAME +short)
    if [ -z "$cname" ] || [ "$cname" = "." ]; then
      print_error "CNAME record not found or is empty"
      print_info "Expected: CNAME pointing to API Gateway domain"
      return 1
    else
      print_success "CNAME record found: $cname"
    fi
  else
    print_warning "dig not available, skipping CNAME validation"
  fi
}

# Test 3: SSL/TLS Certificate Validation
test_ssl_certificate() {
  print_header "Test 3: SSL/TLS Certificate Validation"

  echo "Checking SSL certificate for $DOMAIN..."

  # Get certificate details
  local cert_info=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -text 2>/dev/null || true)

  if [ -z "$cert_info" ]; then
    print_error "Could not retrieve certificate information"
    return 1
  fi

  # Check subject
  local subject=$(echo "$cert_info" | grep "Subject:" | grep -o "CN=[^,]*")
  if echo "$subject" | grep -q "$DOMAIN"; then
    print_success "Certificate subject matches domain: $subject"
  else
    print_warning "Certificate subject may not match domain: $subject"
  fi

  # Check validity dates
  local not_before=$(echo "$cert_info" | grep "Not Before:" | cut -d: -f2-)
  local not_after=$(echo "$cert_info" | grep "Not After :" | cut -d: -f2-)

  if [ -n "$not_before" ] && [ -n "$not_after" ]; then
    print_success "Certificate valid from: $not_before"
    print_success "Certificate valid until: $not_after"
  fi

  # Check issuer
  local issuer=$(echo "$cert_info" | grep "Issuer:" | grep -o "O=[^,]*")
  if echo "$issuer" | grep -qE "Amazon|AWS"; then
    print_success "Certificate issued by trusted CA: $issuer"
  else
    print_warning "Certificate issuer may not be AWS: $issuer"
  fi
}

# Test 4: HTTPS Connectivity
test_https_connectivity() {
  print_header "Test 4: HTTPS Connectivity"

  echo "Testing HTTPS connection to https://$DOMAIN..."

  if curl --connect-timeout $TIMEOUT -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/" -k; then
    local status=$(curl --connect-timeout $TIMEOUT -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/" -k)
    if [ "$status" -eq 200 ] || [ "$status" -eq 404 ] || [ "$status" -eq 405 ]; then
      print_success "HTTPS connection successful (HTTP $status)"
    else
      print_warning "HTTPS connection returned HTTP $status"
    fi
  else
    print_error "HTTPS connection failed"
    return 1
  fi
}

# Test 5: Lightning Address Endpoint
test_lightning_endpoint() {
  print_header "Test 5: Lightning Address Endpoint"

  echo "Testing Lightning Address metadata endpoint..."

  local url="https://$DOMAIN$LIGHTNING_ENDPOINT"
  local response=$(curl --connect-timeout $TIMEOUT -s "$url" 2>/dev/null || echo "FAILED")

  if [ "$response" = "FAILED" ]; then
    print_error "Failed to reach Lightning Address endpoint"
    return 1
  fi

  # Check if response is valid JSON
  if echo "$response" | jq empty 2>/dev/null; then
    print_success "Received valid JSON response from $LIGHTNING_ENDPOINT"

    # Check for required fields
    local has_callback=$(echo "$response" | jq 'has("callback")' 2>/dev/null)
    local has_metadata=$(echo "$response" | jq 'has("metadata")' 2>/dev/null)
    local has_tag=$(echo "$response" | jq 'has("tag")' 2>/dev/null)

    if [ "$has_callback" = "true" ]; then
      print_success "Response contains 'callback' field"
    else
      print_error "Response missing 'callback' field"
    fi

    if [ "$has_metadata" = "true" ]; then
      print_success "Response contains 'metadata' field"
    else
      print_error "Response missing 'metadata' field"
    fi

    if [ "$has_tag" = "true" ]; then
      print_success "Response contains 'tag' field"
    else
      print_error "Response missing 'tag' field"
    fi

    # Display full response
    print_info "Full response:"
    echo "$response" | jq '.' | sed 's/^/  /'
  else
    print_error "Response is not valid JSON: $response"
    return 1
  fi
}

# Test 6: Response Time
test_response_time() {
  print_header "Test 6: Response Time"

  echo "Testing response time to Lightning Address endpoint..."

  local url="https://$DOMAIN$LIGHTNING_ENDPOINT"
  local response_time=$(curl --connect-timeout $TIMEOUT -w "%{time_total}" -o /dev/null -s "$url" 2>/dev/null || echo "FAILED")

  if [ "$response_time" = "FAILED" ]; then
    print_error "Could not measure response time"
    return 1
  fi

  # Check if response time is less than 2 seconds
  if (( $(echo "$response_time < 2.0" | bc -l) )); then
    print_success "Response time ${response_time}s < 2.0s (AC-2.3.a satisfied)"
  else
    print_error "Response time ${response_time}s >= 2.0s (AC-2.3.a NOT satisfied)"
  fi
}

# Test 7: Health Endpoint
test_health_endpoint() {
  print_header "Test 7: Health Endpoint"

  echo "Testing health check endpoint..."

  local url="https://$DOMAIN$HEALTH_ENDPOINT"
  local response=$(curl --connect-timeout $TIMEOUT -s "$url" 2>/dev/null || echo "FAILED")

  if [ "$response" = "FAILED" ]; then
    print_warning "Health endpoint not accessible (Lambda may be starting up)"
    return 0
  fi

  if echo "$response" | jq empty 2>/dev/null; then
    print_success "Health endpoint returns valid JSON: $response"
  else
    print_info "Health endpoint response: $response"
  fi
}

# Test 8: HTTP to HTTPS Redirect
test_http_redirect() {
  print_header "Test 8: HTTP to HTTPS Redirect"

  echo "Testing HTTP redirect to HTTPS..."

  local status=$(curl --connect-timeout $TIMEOUT -w "%{http_code}" -o /dev/null -s -L "http://$DOMAIN/" 2>/dev/null || echo "000")

  if [ "$status" -eq 301 ] || [ "$status" -eq 302 ] || [ "$status" -eq 200 ]; then
    print_success "HTTP request handled (status: $status)"
  else
    print_warning "HTTP request returned unexpected status: $status"
  fi
}

# Test 9: CORS Headers
test_cors_headers() {
  print_header "Test 9: CORS Headers"

  echo "Checking CORS headers..."

  local headers=$(curl --connect-timeout $TIMEOUT -s -I "https://$DOMAIN$LIGHTNING_ENDPOINT" 2>/dev/null || echo "FAILED")

  if [ "$headers" = "FAILED" ]; then
    print_warning "Could not retrieve response headers"
    return 0
  fi

  if echo "$headers" | grep -qi "access-control-allow"; then
    print_success "CORS headers present"
    echo "$headers" | grep -i "access-control" | sed 's/^/  /'
  else
    print_warning "No CORS headers detected"
  fi
}

# Test 10: WAF/Security Headers
test_security_headers() {
  print_header "Test 10: Security Headers"

  echo "Checking security headers..."

  local headers=$(curl --connect-timeout $TIMEOUT -s -I "https://$DOMAIN$LIGHTNING_ENDPOINT" 2>/dev/null || echo "FAILED")

  if [ "$headers" = "FAILED" ]; then
    print_warning "Could not retrieve response headers"
    return 0
  fi

  # Check for security headers
  if echo "$headers" | grep -qi "X-Content-Type-Options"; then
    print_success "X-Content-Type-Options header present"
  fi

  if echo "$headers" | grep -qi "X-Frame-Options"; then
    print_success "X-Frame-Options header present"
  fi

  if echo "$headers" | grep -qi "Strict-Transport-Security"; then
    print_success "Strict-Transport-Security header present"
  else
    print_info "HSTS header not detected (may be configured at CloudFront level)"
  fi
}

# Summary
print_summary() {
  print_header "Test Summary"

  local total=$((PASSED + FAILED))
  echo "Total Tests: $total"
  echo -e "${GREEN}Passed: $PASSED${NC}"
  echo -e "${RED}Failed: $FAILED${NC}"
  echo -e "${YELLOW}Warnings: $WARNINGS${NC}"

  if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}All critical tests passed!${NC}"
    return 0
  else
    echo -e "\n${RED}Some tests failed. Please review the errors above.${NC}"
    return 1
  fi
}

# Main execution
main() {
  echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║     DNS Configuration & Routing Validation Script      ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
  echo -e "\nValidating DNS configuration for: ${YELLOW}$DOMAIN${NC}"
  echo "This script validates the DNS setup for Lightning Address (LNURL-pay)"

  # Check prerequisites
  if ! command -v curl &> /dev/null; then
    print_error "curl is required but not installed"
    exit 1
  fi

  # Run all tests
  test_dns_resolution || true
  test_cname_record || true
  test_ssl_certificate || true
  test_https_connectivity || true
  test_lightning_endpoint || true
  test_response_time || true
  test_health_endpoint || true
  test_http_redirect || true
  test_cors_headers || true
  test_security_headers || true

  # Print summary
  print_summary
}

# Run main function
main
exit $?
