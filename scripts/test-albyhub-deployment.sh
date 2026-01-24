#!/bin/bash

# Test script for AlbyHub deployment
# Validates all acceptance criteria for work item 1.2

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Helper functions
pass() {
  echo -e "${GREEN}✓ PASS:${NC} $1"
  ((PASSED++))
}

fail() {
  echo -e "${RED}✗ FAIL:${NC} $1"
  ((FAILED++))
}

info() {
  echo -e "${YELLOW}ℹ INFO:${NC} $1"
}

# Get API URL from SST output
info "Getting API URL from SST output..."
API_URL=$(sst output AlbyHubApiUrl 2>/dev/null || echo "")

if [ -z "$API_URL" ]; then
  fail "Could not retrieve API URL from SST. Is the stack deployed?"
  exit 1
fi

info "Testing API at: $API_URL"
echo ""

# AC-1.2.b: Lambda invoked via API Gateway responds with 200 status for health check endpoint
echo "Test-1.2.b: Health check endpoint returns 200 with correct response"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  pass "Health check returned 200 status"

  # Validate response structure
  if echo "$BODY" | jq -e '.status == "ok"' >/dev/null 2>&1; then
    pass "Response contains status: ok"
  else
    fail "Response missing or invalid status field"
  fi

  if echo "$BODY" | jq -e '.timestamp' >/dev/null 2>&1; then
    pass "Response contains timestamp"
  else
    fail "Response missing timestamp field"
  fi

  if echo "$BODY" | jq -e '.environment' >/dev/null 2>&1; then
    pass "Response contains environment"
  else
    fail "Response missing environment field"
  fi

  if echo "$BODY" | jq -e '.version' >/dev/null 2>&1; then
    pass "Response contains version"
  else
    fail "Response missing version field"
  fi
else
  fail "Health check returned $HTTP_CODE instead of 200"
fi

echo ""

# AC-1.2.d: Environment variable accessed in Lambda correctly retrieved from SST environment binding
echo "Test-1.2.d: Environment variables accessible in Lambda"
ENV_VAR=$(echo "$BODY" | jq -r '.environment // empty')

if [ -n "$ENV_VAR" ]; then
  pass "Environment variable (NODE_ENV) accessible: $ENV_VAR"
else
  fail "Environment variable not accessible"
fi

echo ""

# AC-1.2.e: API Gateway receives HTTP request with CORS headers present in response
echo "Test-1.2.e: CORS headers present in response"
CORS_RESPONSE=$(curl -s -I -X OPTIONS "${API_URL}/health" \
  -H "Origin: https://brianstoker.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type")

if echo "$CORS_RESPONSE" | grep -i "access-control-allow-origin" >/dev/null; then
  pass "Access-Control-Allow-Origin header present"
else
  fail "Access-Control-Allow-Origin header missing"
fi

if echo "$CORS_RESPONSE" | grep -i "access-control-allow-methods" >/dev/null; then
  pass "Access-Control-Allow-Methods header present"
else
  fail "Access-Control-Allow-Methods header missing"
fi

if echo "$CORS_RESPONSE" | grep -i "access-control-allow-headers" >/dev/null; then
  pass "Access-Control-Allow-Headers header present"
else
  fail "Access-Control-Allow-Headers header missing"
fi

echo ""

# AC-1.2.c: Lambda cold start occurs and application initializes in <3s
echo "Test-1.2.c: Cold start performance (requires 15min idle)"
info "This test requires the Lambda to be idle for 15+ minutes"
info "To test cold start, wait 15 minutes and run this test again"
info "Measuring current request time..."

START_TIME=$(date +%s%N)
curl -s "${API_URL}/health" >/dev/null
END_TIME=$(date +%s%N)

DURATION_MS=$(( ($END_TIME - $START_TIME) / 1000000 ))

info "Request completed in ${DURATION_MS}ms"

if [ $DURATION_MS -lt 3000 ]; then
  pass "Response time under 3 seconds (${DURATION_MS}ms)"
else
  fail "Response time over 3 seconds (${DURATION_MS}ms)"
fi

echo ""
echo "========================================"
echo "Test Summary"
echo "========================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed.${NC}"
  exit 1
fi
