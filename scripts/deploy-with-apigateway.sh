#!/bin/bash

##
# Complete deployment script that:
# 1. Sets the CloudFront secret if not already set
# 2. Deploys the SST stack (including API Gateway)
# 3. Updates CloudFront origins to use API Gateway
#
# Usage:
#   AWS_PROFILE=stokd-cloud ./scripts/deploy-with-apigateway.sh
##

set -e  # Exit on error

PROFILE="${AWS_PROFILE:-stokd-cloud}"
REGION="us-east-1"
SECRET_NAME="CloudFrontSecret"
STAGE="production"

echo "🚀 Starting deployment with API Gateway..."
echo "   AWS Profile: $PROFILE"
echo "   Region: $REGION"
echo ""

# Function to generate a random secret
generate_secret() {
  openssl rand -base64 32
}

# Check if secret exists, create if not
echo "🔐 Checking CloudFront secret..."
if aws --profile "$PROFILE" --region "$REGION" secretsmanager describe-secret --secret-id "$SECRET_NAME" &>/dev/null; then
  echo "✅ Secret already exists"
  SECRET_VALUE=$(aws --profile "$PROFILE" --region "$REGION" secretsmanager get-secret-value --secret-id "$SECRET_NAME" --query SecretString --output text)
else
  echo "📝 Creating new secret..."
  SECRET_VALUE=$(generate_secret)
  aws --profile "$PROFILE" --region "$REGION" secretsmanager create-secret \
    --name "$SECRET_NAME" \
    --description "Shared secret for CloudFront to API Gateway authentication" \
    --secret-string "$SECRET_VALUE"
  echo "✅ Secret created: $SECRET_NAME"
fi

echo ""

# Deploy SST stack
echo "📦 Deploying SST stack..."
echo "   This will create the API Gateway and Next.js site"
echo ""

export AWS_PROFILE="$PROFILE"
export CLOUDFRONT_SECRET="$SECRET_VALUE"

# Set the secret in SST
echo "🔑 Setting SST secret..."
pnpm sst secret set CloudFrontSecret "$SECRET_VALUE" --stage "$STAGE"

# Deploy
echo ""
echo "🚢 Deploying stack..."
pnpm deploy:prod

echo ""
echo "✅ SST stack deployed successfully!"
echo ""

# Update CloudFront origins
echo "🔄 Updating CloudFront distribution origins..."
echo "   This will switch from Lambda Function URLs to API Gateway"
echo ""

node scripts/update-cloudfront-origins.cjs

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Summary:"
echo "   - SST stack deployed with API Gateway"
echo "   - CloudFront origins updated to use API Gateway"
echo "   - Shared secret configured for security"
echo ""
echo "🔍 Next steps:"
echo "   1. Wait a few minutes for CloudFront changes to propagate"
echo "   2. Test the site: https://brian.stokd.cloud"
echo "   3. Monitor CloudWatch logs for any issues"
echo ""
