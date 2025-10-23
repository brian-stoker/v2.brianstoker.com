#!/bin/bash

set -e

# Clear GITHUB_TOKEN env var to use gh CLI's own authentication
unset GITHUB_TOKEN

REPO="brian-stoker/v2.brianstoker.com"

echo "🔐 GitHub Secrets Configuration Script"
echo "======================================="
echo ""
echo "Repository: $REPO"
echo ""

# Check if gh CLI is authenticated with workflow scope
if ! gh auth status 2>&1 | grep -q "workflow"; then
    echo "⚠️  GitHub CLI needs 'workflow' and 'admin:public_key' scopes"
    echo ""
    echo "Please run:"
    echo "  unset GITHUB_TOKEN && gh auth refresh -h github.com -s workflow -s admin:public_key"
    echo ""
    echo "Then re-run this script."
    exit 1
fi

# Get AWS credentials
echo "📥 Reading AWS credentials..."
AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id)
AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key)
AWS_REGION=$(aws configure get region)

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ AWS credentials not found. Please run: aws configure"
    exit 1
fi

echo "✅ AWS credentials found"

# Read .env.production
echo "📥 Reading .env.production..."
if [ ! -f .env.production ]; then
    echo "❌ .env.production not found"
    exit 1
fi

# Source the .env.production file
set -a
source .env.production
set +a

echo "✅ .env.production loaded"
echo ""

# Save the GITHUB_TOKEN from .env.production
GH_TOKEN_VALUE="$GITHUB_TOKEN"

# Count required and optional secrets
REQUIRED_COUNT=9
OPTIONAL_COUNT=0

[ ! -z "$NEXT_PUBLIC_WEB_URL" ] && OPTIONAL_COUNT=$((OPTIONAL_COUNT + 1))
[ ! -z "$SYNC_ENDPOINT" ] && OPTIONAL_COUNT=$((OPTIONAL_COUNT + 1))
[ ! -z "$SYNC_SECRET" ] && OPTIONAL_COUNT=$((OPTIONAL_COUNT + 1))

TOTAL_COUNT=$((REQUIRED_COUNT + OPTIONAL_COUNT))

echo "🔑 Setting $TOTAL_COUNT secrets ($REQUIRED_COUNT required, $OPTIONAL_COUNT optional)"
echo ""

# Set AWS secrets
echo "[1/$TOTAL_COUNT] Setting AWS_ACCESS_KEY_ID..."
echo "$AWS_ACCESS_KEY_ID" | gh secret set AWS_ACCESS_KEY_ID -R "$REPO" && echo "  ✅ Set"

echo "[2/$TOTAL_COUNT] Setting AWS_SECRET_ACCESS_KEY..."
echo "$AWS_SECRET_ACCESS_KEY" | gh secret set AWS_SECRET_ACCESS_KEY -R "$REPO" && echo "  ✅ Set"

echo "[3/$TOTAL_COUNT] Setting AWS_REGION..."
echo "${AWS_REGION:-us-east-1}" | gh secret set AWS_REGION -R "$REPO" && echo "  ✅ Set"

# Set application secrets
echo "[4/$TOTAL_COUNT] Setting ROOT_DOMAIN..."
echo "$ROOT_DOMAIN" | gh secret set ROOT_DOMAIN -R "$REPO" && echo "  ✅ Set"

echo "[5/$TOTAL_COUNT] Setting MONGODB_URI..."
echo "$MONGODB_URI" | gh secret set MONGODB_URI -R "$REPO" && echo "  ✅ Set"

echo "[6/$TOTAL_COUNT] Setting MONGODB_USER..."
echo "$MONGODB_USER" | gh secret set MONGODB_USER -R "$REPO" && echo "  ✅ Set"

echo "[7/$TOTAL_COUNT] Setting MONGODB_PASS..."
echo "$MONGODB_PASS" | gh secret set MONGODB_PASS -R "$REPO" && echo "  ✅ Set"

# Set GitHub integration secrets
echo "[8/$TOTAL_COUNT] Setting GH_TOKEN..."
echo "$GH_TOKEN_VALUE" | gh secret set GH_TOKEN -R "$REPO" && echo "  ✅ Set"

echo "[9/$TOTAL_COUNT] Setting GITHUB_USERNAME..."
echo "$GITHUB_USERNAME" | gh secret set GITHUB_USERNAME -R "$REPO" && echo "  ✅ Set"

# Optional secrets
CURRENT=$REQUIRED_COUNT

if [ ! -z "$NEXT_PUBLIC_WEB_URL" ]; then
    CURRENT=$((CURRENT + 1))
    echo "[$CURRENT/$TOTAL_COUNT] Setting NEXT_PUBLIC_WEB_URL..."
    echo "$NEXT_PUBLIC_WEB_URL" | gh secret set NEXT_PUBLIC_WEB_URL -R "$REPO" && echo "  ✅ Set"
fi

if [ ! -z "$SYNC_ENDPOINT" ]; then
    CURRENT=$((CURRENT + 1))
    echo "[$CURRENT/$TOTAL_COUNT] Setting SYNC_ENDPOINT..."
    echo "$SYNC_ENDPOINT" | gh secret set SYNC_ENDPOINT -R "$REPO" && echo "  ✅ Set"
fi

if [ ! -z "$SYNC_SECRET" ]; then
    CURRENT=$((CURRENT + 1))
    echo "[$CURRENT/$TOTAL_COUNT] Setting SYNC_SECRET..."
    echo "$SYNC_SECRET" | gh secret set SYNC_SECRET -R "$REPO" && echo "  ✅ Set"
fi

echo ""
echo "✅ All secrets configured successfully!"
echo ""
echo "📋 Verification:"
gh secret list -R "$REPO"

echo ""
echo "🚀 You're ready to deploy!"
echo ""
echo "Next steps:"
echo "  1. git add <files>"
echo "  2. git commit -m 'Add GitHub Actions deployment'"
echo "  3. git push origin main"
echo ""
echo "Monitor deployment at:"
echo "  https://github.com/$REPO/actions"
