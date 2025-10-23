# GitHub Actions Deployment Setup Guide

This guide will walk you through configuring GitHub Actions to automatically deploy brianstoker.com to AWS when changes are pushed to the `main` branch.

## Overview

The deployment workflow uses:
- **SST (Serverless Stack)** - Infrastructure as Code framework for AWS
- **GitHub Actions** - CI/CD automation
- **AWS** - Cloud hosting platform
- **dotenvx/senvn** - Environment variable management

## Prerequisites

Before setting up GitHub Actions deployment, ensure you have:

1. AWS account with appropriate permissions
2. AWS access credentials (Access Key ID and Secret Access Key)
3. SST CLI installed locally for testing
4. All required environment variables values
5. Repository admin access to configure secrets

## Required GitHub Secrets

Navigate to your GitHub repository and configure the following secrets:

**Settings → Secrets and variables → Actions → New repository secret**

### AWS Credentials (Required)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID for SST deployment | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS region for deployment | `us-east-1` |

### Application Secrets (Required)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `ROOT_DOMAIN` | Your root domain name | `brianstoker.com` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `MONGODB_USER` | MongoDB username | `admin` |
| `MONGODB_PASS` | MongoDB password | `your-secure-password` |

### GitHub Integration (Required)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `GH_TOKEN` | GitHub Personal Access Token for syncing | `ghp_xxxxxxxxxxxx` |
| `GITHUB_USERNAME` | Your GitHub username | `yourusername` |

### Optional Configuration

| Secret Name | Description | Example | Default |
|-------------|-------------|---------|---------|
| `NEXT_PUBLIC_WEB_URL` | Public URL of your site | `https://brianstoker.com` | Computed from ROOT_DOMAIN |
| `SYNC_ENDPOINT` | GitHub sync cron endpoint | `https://api.brianstoker.com/sync` | - |
| `SYNC_SECRET` | Secret for sync endpoint authentication | `random-secret-string` | - |

## How to Get AWS Credentials

### Option 1: Create IAM User (Recommended for CI/CD)

1. Log into AWS Console
2. Navigate to IAM → Users → Add users
3. Choose user name (e.g., `github-actions-deploy`)
4. Select "Access key - Programmatic access"
5. Attach policies:
   - `AdministratorAccess` (for full SST deployment)
   - OR create custom policy with minimum required permissions:
     - CloudFormation full access
     - S3 full access
     - Lambda full access
     - API Gateway full access
     - CloudFront full access
     - Route53 (if using custom domain)
     - IAM role creation
6. Save the Access Key ID and Secret Access Key
7. Add these to GitHub secrets

### Option 2: Use Existing AWS Credentials

If you already have AWS credentials configured locally:

```bash
# View your current credentials
cat ~/.aws/credentials

# Look for your access key
aws configure get aws_access_key_id

# Your secret key (keep this secure!)
aws configure get aws_secret_access_key
```

⚠️ **Security Warning**: Never commit AWS credentials to your repository. Always use GitHub Secrets.

## How to Get GitHub Token

The GitHub token is used for syncing GitHub activity data (commits, repos, etc.).

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name: `brianstoker.com deployment`
4. Select scopes:
   - `repo` (Full control of private repositories)
   - `read:user` (Read user profile data)
   - `user:email` (Access user email addresses)
5. Click "Generate token"
6. Copy the token immediately (you won't see it again!)
7. Add to GitHub secrets as `GH_TOKEN`

## Workflow Configuration

The deployment workflow is located at:
```
.github/workflows/deploy-production.yml
```

### Workflow Triggers

The deployment runs automatically when:
- Code is pushed to the `main` branch
- Manually triggered via GitHub Actions UI ("Run workflow" button)

### Deployment Steps

1. **Checkout code** - Pulls latest code from repository
2. **Setup Node.js & pnpm** - Configures build environment
3. **Configure AWS** - Sets up AWS credentials
4. **Install dependencies** - Runs `pnpm install`
5. **Install deployment tools** - Installs dotenvx and senvn
6. **Create .env.production** - Generates environment file from secrets
7. **Deploy to production** - Runs `pnpm deploy:build:prod`
8. **Create summary** - Reports deployment status

### Concurrency Control

The workflow includes concurrency controls to prevent multiple simultaneous deployments:
```yaml
concurrency:
  group: production-deployment
  cancel-in-progress: false
```

This ensures only one deployment runs at a time, and new deployments wait for current ones to complete.

## Verification Steps

Before your first deployment, verify everything is configured:

### 1. Check GitHub Secrets

Go to: **Settings → Secrets and variables → Actions**

Verify all required secrets are present:
- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] AWS_REGION
- [ ] ROOT_DOMAIN
- [ ] MONGODB_URI
- [ ] MONGODB_USER
- [ ] MONGODB_PASS
- [ ] GH_TOKEN
- [ ] GITHUB_USERNAME

### 2. Test Workflow Syntax

Use GitHub's workflow syntax checker:
```bash
# Install act (GitHub Actions local runner)
brew install act

# Test the workflow locally (dry-run)
act -n
```

### 3. Manual Test Deploy

Trigger a manual deployment to test:
1. Go to GitHub Actions tab
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Select `main` branch
5. Click "Run workflow"
6. Monitor the deployment logs

## Troubleshooting

### Common Issues

#### 1. AWS Credentials Invalid

**Error**: `Unable to locate credentials`

**Solution**:
- Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set correctly
- Check that the IAM user has sufficient permissions
- Ensure credentials haven't expired

#### 2. MongoDB Connection Failed

**Error**: `MongoServerError: Authentication failed`

**Solution**:
- Verify MONGODB_URI is correct and includes authentication
- Check MongoDB Atlas network access allows GitHub Actions IPs
- Verify MONGODB_USER and MONGODB_PASS are correct

#### 3. SST Deployment Failed

**Error**: `Error: Could not resolve ROOT_DOMAIN`

**Solution**:
- Ensure ROOT_DOMAIN secret is set
- Verify domain is properly configured in AWS Route53
- Check SST configuration in `sst.config.ts`

#### 4. Missing Environment Variables

**Error**: `Missing environment variables: [...]`

**Solution**:
- Review the "Create .env.production from secrets" step in workflow
- Ensure all referenced secrets exist in GitHub
- Check for typos in secret names

### Debug Mode

To enable verbose logging in the deployment:

1. Edit `.github/workflows/deploy-production.yml`
2. Add to the deploy step:
```yaml
env:
  CI: true
  SST_DEBUG: true  # Add this line
```

## Security Best Practices

1. **Rotate credentials regularly** - Update AWS keys every 90 days
2. **Use least privilege** - IAM user should only have required permissions
3. **Monitor deployments** - Review GitHub Actions logs regularly
4. **Enable branch protection** - Require PR reviews before merging to main
5. **Audit secret access** - Regularly review who has access to repository secrets

## Cost Considerations

Each deployment to AWS may incur costs:
- Lambda function executions
- S3 storage and data transfer
- CloudFront distribution
- API Gateway requests

Monitor your AWS billing dashboard regularly to avoid unexpected charges.

## Next Steps

After successful deployment:

1. ✅ Verify site is accessible at your domain
2. ✅ Test all functionality (art, drums, photography, resume, blog)
3. ✅ Check CloudWatch logs for errors
4. ✅ Set up monitoring alerts (optional)
5. ✅ Configure custom domain SSL certificate (if needed)
6. ✅ Set up automated backups (optional)

## Support

If you encounter issues:
1. Check GitHub Actions logs for error messages
2. Review AWS CloudFormation stack events
3. Check SST documentation: https://docs.sst.dev/
4. Review this repository's issues for similar problems

## Related Documentation

- [SST Configuration](../stacks/README.md)
- [Testing Strategy](./TESTING_STRATEGY.md)
- [Repository Guidelines](../AGENTS.md)
