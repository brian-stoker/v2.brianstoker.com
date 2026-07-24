#!/bin/bash
# aws-deploy.sh — Deploy or remove SST app
# AWS account verification is handled automatically by senvn via .deploy.json
# Usage: ./scripts/aws-deploy.sh [deploy|remove]

set -euo pipefail

ACTION="${1:-deploy}"

if [[ "$ACTION" != "deploy" && "$ACTION" != "remove" ]]; then
  echo "Usage: $0 [deploy|remove]"
  exit 1
fi

if [[ "$ACTION" == "deploy" ]]; then
  echo "Deploying to production..."
  # Capture stdout (SST prints stack outputs there) while still streaming it live.
  DEPLOY_OUT=$(senvn -f production npx sst deploy --stage production | tee /dev/stderr)
  # Pull the distributionId output SST exposes from sst.config.ts; empty is fine —
  # the reconvergence script then discovers the distribution by ROOT_DOMAIN alias.
  DIST_ID=$(printf '%s\n' "$DEPLOY_OUT" | grep -oiE 'distributionId:[[:space:]]*[A-Za-z0-9]+' | tail -1 | sed -E 's/.*[[:space:]]//')
  echo "Repointing CloudFront origins at API Gateway (Function URLs are broken in this account)..."
  echo "  Distribution id: ${DIST_ID:-<discover by ROOT_DOMAIN>}"
  # Run under senvn so ROOT_DOMAIN (from .env.production) is available for the
  # discovery fallback; AWS_PROFILE stays explicit for the aws CLI calls.
  AWS_PROFILE=stokd-cloud DISTRIBUTION_ID="$DIST_ID" senvn -f production node scripts/update-cloudfront-origins.cjs
  echo "Setting up log shipping..."
  AWS_PROFILE=stokd-cloud node scripts/setupLogShipping.cjs || echo "Warning: Log shipping failed (non-fatal)"
elif [[ "$ACTION" == "remove" ]]; then
  echo "Removing production stack..."
  senvn -f production npx sst remove --stage production
fi
