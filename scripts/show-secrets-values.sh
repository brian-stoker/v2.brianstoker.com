#!/bin/bash

# This script shows you the values to manually paste into GitHub Settings
# if the automated script doesn't work.

echo "📋 GitHub Secrets Values for Manual Configuration"
echo "=================================================="
echo ""
echo "Repository: brian-stoker/v2.brianstoker.com"
echo "Location: Settings → Secrets and variables → Actions"
echo ""
echo "⚠️  WARNING: These are sensitive values! Don't share them."
echo ""

# Get AWS credentials
echo "---[ AWS CREDENTIALS ]---"
AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id)
AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)
AWS_REGION=$(aws configure get region)

echo "AWS_ACCESS_KEY_ID:"
echo "  $AWS_ACCESS_KEY_ID"
echo ""
echo "AWS_SECRET_ACCESS_KEY:"
echo "  $AWS_SECRET_ACCESS_KEY"
echo ""
echo "AWS_REGION:"
echo "  ${AWS_REGION:-us-east-1}"
echo ""

# Read .env.production
if [ ! -f .env.production ]; then
    echo "❌ .env.production not found"
    exit 1
fi

set -a
source .env.production
set +a

echo "---[ APPLICATION CONFIGURATION ]---"
echo "ROOT_DOMAIN:"
echo "  $ROOT_DOMAIN"
echo ""
echo "MONGODB_URI:"
echo "  $MONGODB_URI"
echo ""
echo "MONGODB_USER:"
echo "  $MONGODB_USER"
echo ""
echo "MONGODB_PASS:"
echo "  $MONGODB_PASS"
echo ""

echo "---[ GITHUB INTEGRATION ]---"
echo "GH_TOKEN (from your GITHUB_TOKEN in .env.production):"
echo "  $GITHUB_TOKEN"
echo ""
echo "GITHUB_USERNAME:"
echo "  $GITHUB_USERNAME"
echo ""

# Optional
if [ ! -z "$NEXT_PUBLIC_WEB_URL" ]; then
    echo "---[ OPTIONAL ]---"
    echo "NEXT_PUBLIC_WEB_URL:"
    echo "  $NEXT_PUBLIC_WEB_URL"
    echo ""
fi

if [ ! -z "$SYNC_ENDPOINT" ]; then
    echo "SYNC_ENDPOINT:"
    echo "  $SYNC_ENDPOINT"
    echo ""
fi

if [ ! -z "$SYNC_SECRET" ]; then
    echo "SYNC_SECRET:"
    echo "  $SYNC_SECRET"
    echo ""
fi

echo "=================================================="
echo ""
echo "To set these manually:"
echo "1. Go to: https://github.com/brian-stoker/v2.brianstoker.com/settings/secrets/actions"
echo "2. Click 'New repository secret' for each value above"
echo "3. Copy the secret name and value exactly"
echo "4. Save each secret"
echo ""
echo "After setting all secrets, you can verify with:"
echo "  unset GITHUB_TOKEN && gh secret list -R brian-stoker/v2.brianstoker.com"
