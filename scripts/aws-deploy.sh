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
  senvn -f production npx sst deploy --stage production
  echo "Setting up log shipping..."
  AWS_PROFILE=stoked node scripts/setupLogShipping.cjs || echo "Warning: Log shipping failed (non-fatal)"
elif [[ "$ACTION" == "remove" ]]; then
  echo "Removing production stack..."
  senvn -f production npx sst remove --stage production
fi
