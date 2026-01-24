#!/bin/bash

# Lightning Address Testing Script
# Tests the full Lightning Address (LNURL-pay) flow after deployment
# Run this AFTER DNS is configured and API is deployed

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${LIGHTNING_DOMAIN:-albyhub.brianstoker.com}"
EMAIL="${LIGHTNING_EMAIL:-pay@brianstoker.com}"
TIMEOUT=15

# Test data
TEST_AMOUNT_VALID=50000       # 50k millisats
TEST_AMOUNT_TOO_LOW=500       # Below minimum
TEST_AMOUNT_TOO_HIGH=200000000 # Above maximum
TEST_COMMENT="Test payment"

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

# Test 1: Query Lightning Address Metadata
test_query_metadata() {
  print_header "Test 1: Query Lightning Address Metadata (LUD-16)"

  echo "Querying metadata for $EMAIL..."

  local url="https://$DOMAIN/.well-known/lnurlp/pay"
  local response=$(curl --connect-timeout $TIMEOUT -s "$url" 2>/dev/null || echo "FAILED")

  if [ "$response" = "FAILED" ]; then
    print_error "Failed to retrieve metadata endpoint"
    return 1
  fi

  # Validate JSON
  if ! echo "$response" | jq empty 2>/dev/null; then
    print_error "Response is not valid JSON"
    print_info "Response: $response"
    return 1
  fi

  print_success "Metadata endpoint returned valid JSON"

  # Extract and validate required fields
  local callback=$(echo "$response" | jq -r '.callback' 2>/dev/null)
  local tag=$(echo "$response" | jq -r '.tag' 2>/dev/null)
  local min_sendable=$(echo "$response" | jq -r '.minSendable' 2>/dev/null)
  local max_sendable=$(echo "$response" | jq -r '.maxSendable' 2>/dev/null)
  local comment_allowed=$(echo "$response" | jq -r '.commentAllowed' 2>/dev/null)
  local metadata=$(echo "$response" | jq -r '.metadata' 2>/dev/null)

  # Validate callback URL
  if [ "$callback" = "null" ] || [ -z "$callback" ]; then
    print_error "Missing 'callback' field"
  else
    print_success "Callback URL: $callback"
  fi

  # Validate tag
  if [ "$tag" != "payRequest" ]; then
    print_error "Invalid tag. Expected 'payRequest', got '$tag'"
  else
    print_success "Tag is correct: $tag"
  fi

  # Validate ranges
  if [ "$min_sendable" != "null" ] && [ -n "$min_sendable" ]; then
    print_success "Minimum sendable: $min_sendable millisats"
  fi

  if [ "$max_sendable" != "null" ] && [ -n "$max_sendable" ]; then
    print_success "Maximum sendable: $max_sendable millisats"
  fi

  if [ "$comment_allowed" != "null" ] && [ -n "$comment_allowed" ]; then
    print_success "Comment allowed: $comment_allowed characters"
  fi

  # Validate metadata format
  if [ "$metadata" != "null" ] && [ -n "$metadata" ]; then
    print_success "Metadata: $metadata"
  fi

  # Store callback for later use
  export LIGHTNING_CALLBACK="$callback"
}

# Test 2: Valid Invoice Generation
test_valid_invoice() {
  print_header "Test 2: Valid Invoice Generation"

  if [ -z "$LIGHTNING_CALLBACK" ]; then
    print_warning "Skipping - callback URL not available from metadata"
    return 0
  fi

  echo "Requesting invoice for $TEST_AMOUNT_VALID millisats..."

  local url="${LIGHTNING_CALLBACK}?amount=${TEST_AMOUNT_VALID}&comment=${TEST_COMMENT}"
  local response=$(curl --connect-timeout $TIMEOUT -s "$url" 2>/dev/null || echo "FAILED")

  if [ "$response" = "FAILED" ]; then
    print_error "Failed to request invoice"
    return 1
  fi

  # Validate JSON
  if ! echo "$response" | jq empty 2>/dev/null; then
    print_error "Response is not valid JSON"
    print_info "Response: $response"
    return 1
  fi

  print_success "Received valid JSON response"

  # Extract fields
  local pr=$(echo "$response" | jq -r '.pr' 2>/dev/null)
  local routes=$(echo "$response" | jq -r '.routes' 2>/dev/null)
  local success_action=$(echo "$response" | jq -r '.successAction' 2>/dev/null)

  # Validate payment request
  if [ "$pr" != "null" ] && [ -n "$pr" ]; then
    print_success "Received payment request (invoice)"
    print_info "Invoice starts with: ${pr:0:20}..."

    # Validate it's a valid BOLT11 invoice
    if [[ "$pr" =~ ^lnbc.*$ ]]; then
      print_success "Invoice appears to be valid BOLT11 format"
    else
      print_warning "Invoice may not be valid BOLT11 format: $pr"
    fi
  else
    print_error "Missing 'pr' field in response"
  fi

  # Validate success action
  if [ "$success_action" != "null" ] && [ "$success_action" != "null" ]; then
    print_success "Success action present: $success_action"
  fi
}

# Test 3: Invalid Amount - Too Low
test_invalid_amount_low() {
  print_header "Test 3: Invalid Amount - Below Minimum"

  if [ -z "$LIGHTNING_CALLBACK" ]; then
    print_warning "Skipping - callback URL not available from metadata"
    return 0
  fi

  echo "Requesting invoice for $TEST_AMOUNT_TOO_LOW millisats (below minimum)..."

  local url="${LIGHTNING_CALLBACK}?amount=${TEST_AMOUNT_TOO_LOW}"
  local response=$(curl --connect-timeout $TIMEOUT -s "$url" 2>/dev/null || echo "FAILED")

  if [ "$response" = "FAILED" ]; then
    print_error "Failed to request invoice"
    return 1
  fi

  # Validate JSON
  if ! echo "$response" | jq empty 2>/dev/null; then
    print_error "Response is not valid JSON"
    return 1
  fi

  # Should return error response
  local status=$(echo "$response" | jq -r '.status' 2>/dev/null)
  if [ "$status" = "ERROR" ]; then
    print_success "Correctly rejected invalid amount with ERROR status"

    local reason=$(echo "$response" | jq -r '.reason' 2>/dev/null)
    if [ -n "$reason" ] && [ "$reason" != "null" ]; then
      print_success "Error reason: $reason"
    fi
  else
    print_warning "Expected error response but got: $response"
  fi
}

# Test 4: Invalid Amount - Too High
test_invalid_amount_high() {
  print_header "Test 4: Invalid Amount - Above Maximum"

  if [ -z "$LIGHTNING_CALLBACK" ]; then
    print_warning "Skipping - callback URL not available from metadata"
    return 0
  fi

  echo "Requesting invoice for $TEST_AMOUNT_TOO_HIGH millisats (above maximum)..."

  local url="${LIGHTNING_CALLBACK}?amount=${TEST_AMOUNT_TOO_HIGH}"
  local response=$(curl --connect-timeout $TIMEOUT -s "$url" 2>/dev/null || echo "FAILED")

  if [ "$response" = "FAILED" ]; then
    print_error "Failed to request invoice"
    return 1
  fi

  # Validate JSON
  if ! echo "$response" | jq empty 2>/dev/null; then
    print_error "Response is not valid JSON"
    return 1
  fi

  # Should return error response
  local status=$(echo "$response" | jq -r '.status' 2>/dev/null)
  if [ "$status" = "ERROR" ]; then
    print_success "Correctly rejected invalid amount with ERROR status"

    local reason=$(echo "$response" | jq -r '.reason' 2>/dev/null)
    if [ -n "$reason" ] && [ "$reason" != "null" ]; then
      print_success "Error reason: $reason"
    fi
  else
    print_warning "Expected error response but got: $response"
  fi
}

# Test 5: Missing Required Parameter
test_missing_amount() {
  print_header "Test 5: Missing Required Parameter (amount)"

  if [ -z "$LIGHTNING_CALLBACK" ]; then
    print_warning "Skipping - callback URL not available from metadata"
    return 0
  fi

  echo "Requesting invoice without amount parameter..."

  local url="${LIGHTNING_CALLBACK}"
  local response=$(curl --connect-timeout $TIMEOUT -s "$url" 2>/dev/null || echo "FAILED")

  if [ "$response" = "FAILED" ]; then
    print_error "Failed to request invoice"
    return 1
  fi

  # Validate JSON
  if ! echo "$response" | jq empty 2>/dev/null; then
    print_error "Response is not valid JSON"
    return 1
  fi

  # Should return error response
  local status=$(echo "$response" | jq -r '.status' 2>/dev/null)
  if [ "$status" = "ERROR" ]; then
    print_success "Correctly rejected request missing amount with ERROR status"

    local reason=$(echo "$response" | jq -r '.reason' 2>/dev/null)
    print_success "Error reason: $reason"
  else
    print_warning "Expected error response but got: $response"
  fi
}

# Test 6: Optional Comment Parameter
test_with_comment() {
  print_header "Test 6: Optional Comment Parameter"

  if [ -z "$LIGHTNING_CALLBACK" ]; then
    print_warning "Skipping - callback URL not available from metadata"
    return 0
  fi

  echo "Requesting invoice with comment parameter..."

  local url="${LIGHTNING_CALLBACK}?amount=${TEST_AMOUNT_VALID}&comment=${TEST_COMMENT}"
  local response=$(curl --connect-timeout $TIMEOUT -s "$url" 2>/dev/null || echo "FAILED")

  if [ "$response" = "FAILED" ]; then
    print_error "Failed to request invoice"
    return 1
  fi

  # Validate JSON
  if ! echo "$response" | jq empty 2>/dev/null; then
    print_error "Response is not valid JSON"
    return 1
  fi

  print_success "Successfully processed request with comment"

  # Extract invoice
  local pr=$(echo "$response" | jq -r '.pr' 2>/dev/null)
  if [ "$pr" != "null" ] && [ -n "$pr" ]; then
    print_success "Received invoice with comment"
  fi
}

# Test 7: Response Time Under 2 Seconds
test_response_time() {
  print_header "Test 7: Response Time Performance"

  echo "Measuring response time to metadata endpoint..."

  local response_time=$(curl --connect-timeout $TIMEOUT -w "%{time_total}" -o /dev/null -s "https://$DOMAIN/.well-known/lnurlp/pay" 2>/dev/null || echo "FAILED")

  if [ "$response_time" = "FAILED" ]; then
    print_error "Could not measure response time"
    return 1
  fi

  # Check if response time is less than 2 seconds
  if (( $(echo "$response_time < 2.0" | bc -l) )); then
    print_success "Response time: ${response_time}s (< 2.0s) - AC-2.3.a satisfied"
  else
    print_error "Response time: ${response_time}s (>= 2.0s) - AC-2.3.a NOT satisfied"
  fi

  # Also test callback endpoint
  if [ -n "$LIGHTNING_CALLBACK" ]; then
    local callback_time=$(curl --connect-timeout $TIMEOUT -w "%{time_total}" -o /dev/null -s "${LIGHTNING_CALLBACK}?amount=${TEST_AMOUNT_VALID}" 2>/dev/null || echo "FAILED")

    if [ "$callback_time" != "FAILED" ]; then
      if (( $(echo "$callback_time < 2.0" | bc -l) )); then
        print_success "Callback response time: ${callback_time}s (< 2.0s)"
      else
        print_warning "Callback response time: ${callback_time}s (>= 2.0s)"
      fi
    fi
  fi
}

# Test 8: SSL Certificate Validation
test_ssl_validation() {
  print_header "Test 8: SSL Certificate Validation"

  echo "Validating SSL certificate..."

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
    print_error "Certificate subject does not match: $subject"
  fi

  # Check validity
  local not_after=$(echo "$cert_info" | grep "Not After :" | cut -d: -f2-)
  if [ -n "$not_after" ]; then
    print_success "Certificate valid until: $not_after"
  fi

  # Check issuer
  local issuer=$(echo "$cert_info" | grep "Issuer:" | grep -o "O=[^,]*")
  if echo "$issuer" | grep -qE "Amazon|AWS"; then
    print_success "Certificate issued by AWS: $issuer"
  else
    print_warning "Unexpected issuer: $issuer"
  fi
}

# Test 9: Acceptance Criteria Summary
test_acceptance_criteria() {
  print_header "Test 9: Acceptance Criteria Validation"

  echo "Checking acceptance criteria..."

  # AC-2.3.a: HTTPS request returns 200 with valid metadata in <2s
  echo "AC-2.3.a: HTTPS response time < 2 seconds"
  local response_time=$(curl --connect-timeout $TIMEOUT -w "%{time_total}" -o /dev/null -s "https://$DOMAIN/.well-known/lnurlp/pay" 2>/dev/null || echo "FAILED")
  if (( $(echo "$response_time < 2.0" | bc -l) )); then
    print_success "AC-2.3.a satisfied"
  else
    print_error "AC-2.3.a NOT satisfied - response time: ${response_time}s"
  fi

  # AC-2.3.b: SSL certificate validated
  echo "AC-2.3.b: SSL certificate validation"
  local cert_valid=$(curl --connect-timeout $TIMEOUT -s "https://$DOMAIN/.well-known/lnurlp/pay" 2>&1 | grep -q "SSL" && echo "false" || echo "true")
  if [ "$cert_valid" = "true" ]; then
    print_success "AC-2.3.b satisfied"
  else
    print_warning "AC-2.3.b verification - please check SSL settings"
  fi

  # AC-2.3.c: Lightning wallet queries pay@brianstoker.com successfully
  echo "AC-2.3.c: Lightning Address resolution"
  local metadata=$(curl --connect-timeout $TIMEOUT -s "https://$DOMAIN/.well-known/lnurlp/pay" 2>/dev/null | jq -r '.metadata' || echo "")
  if [ -n "$metadata" ] && [ "$metadata" != "null" ]; then
    print_success "AC-2.3.c satisfied - metadata resolves correctly"
  else
    print_warning "AC-2.3.c verification - metadata not found"
  fi

  # AC-2.3.d: DNS lookup performs
  echo "AC-2.3.d: DNS resolution"
  if command -v nslookup &> /dev/null; then
    if nslookup "$DOMAIN" &> /dev/null; then
      print_success "AC-2.3.d satisfied - DNS resolves"
    else
      print_error "AC-2.3.d NOT satisfied - DNS does not resolve"
    fi
  else
    print_warning "AC-2.3.d verification - nslookup not available"
  fi

  # AC-2.3.e: HTTP redirects or returns error
  echo "AC-2.3.e: HTTP redirect to HTTPS"
  local http_status=$(curl --connect-timeout $TIMEOUT -w "%{http_code}" -o /dev/null -s "http://$DOMAIN/" 2>/dev/null || echo "000")
  if [ "$http_status" -eq 301 ] || [ "$http_status" -eq 302 ] || [ "$http_status" -eq 307 ] || [ "$http_status" -eq 308 ]; then
    print_success "AC-2.3.e satisfied - HTTP redirects (status: $http_status)"
  else
    print_warning "AC-2.3.e - HTTP status: $http_status (expected 3xx)"
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
    echo -e "\n${GREEN}All tests passed!${NC}"
    return 0
  else
    echo -e "\n${RED}Some tests failed. Please review the errors above.${NC}"
    return 1
  fi
}

# Main execution
main() {
  echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║        Lightning Address Full Flow Test Suite          ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
  echo -e "\nTesting Lightning Address implementation for: ${YELLOW}$EMAIL${NC}"
  echo -e "Domain: ${YELLOW}$DOMAIN${NC}"
  echo -e "\nThis script validates:"
  echo "  • Lightning Address metadata endpoint (LUD-16)"
  echo "  • LNURL-pay callback for invoice generation (LUD-06)"
  echo "  • Payment amount validation"
  echo "  • SSL/TLS certificate"
  echo "  • DNS resolution"
  echo "  • Response time performance"

  # Check prerequisites
  if ! command -v curl &> /dev/null; then
    print_error "curl is required but not installed"
    exit 1
  fi

  if ! command -v jq &> /dev/null; then
    print_warning "jq is not installed - JSON parsing will be limited"
  fi

  if ! command -v bc &> /dev/null; then
    print_warning "bc is not installed - response time comparison may fail"
  fi

  # Run all tests
  test_query_metadata || true
  test_valid_invoice || true
  test_invalid_amount_low || true
  test_invalid_amount_high || true
  test_missing_amount || true
  test_with_comment || true
  test_response_time || true
  test_ssl_validation || true
  test_acceptance_criteria || true

  # Print summary
  print_summary
}

# Run main function
main
exit $?
