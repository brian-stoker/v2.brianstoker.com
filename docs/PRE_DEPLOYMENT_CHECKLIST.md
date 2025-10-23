# Pre-Deployment Checklist

This checklist ensures everything is properly configured before pushing to `main` and triggering the automated GitHub Actions deployment.

## 🔐 GitHub Secrets Configuration

Before deploying, verify all required secrets are configured in your GitHub repository.

**Location:** Settings → Secrets and variables → Actions

### AWS Credentials
- [ ] `AWS_ACCESS_KEY_ID` - Set and valid
- [ ] `AWS_SECRET_ACCESS_KEY` - Set and valid
- [ ] `AWS_REGION` - Set (or will default to us-east-1)

**Verification:**
```bash
# Test AWS credentials locally
aws sts get-caller-identity
```

### Application Configuration
- [ ] `ROOT_DOMAIN` - Your domain (e.g., brianstoker.com)
- [ ] `MONGODB_URI` - MongoDB connection string with auth
- [ ] `MONGODB_USER` - MongoDB username
- [ ] `MONGODB_PASS` - MongoDB password

**Verification:**
```bash
# Test MongoDB connection (if you have mongosh installed)
mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')"
```

### GitHub Integration
- [ ] `GH_TOKEN` - GitHub personal access token
- [ ] `GITHUB_USERNAME` - Your GitHub username

**Verification:**
```bash
# Test GitHub token
curl -H "Authorization: token $GH_TOKEN" https://api.github.com/user
```

### Optional Secrets
- [ ] `NEXT_PUBLIC_WEB_URL` - Public site URL (optional, can be computed)
- [ ] `SYNC_ENDPOINT` - GitHub sync endpoint URL (optional)
- [ ] `SYNC_SECRET` - Sync authentication secret (optional)

## 📋 Local Environment Verification

Ensure your local environment can successfully build and deploy.

### 1. Environment Variables Check
```bash
# Check your local .env.production file
cat .env.production | grep -v "^#" | grep -v "^$"
```

Expected variables:
- [ ] NODE_ENV=production
- [ ] ROOT_DOMAIN
- [ ] MONGODB_URI
- [ ] MONGODB_USER
- [ ] MONGODB_PASS
- [ ] GITHUB_TOKEN
- [ ] GITHUB_USERNAME

### 2. Dependencies Check
```bash
# Ensure all dependencies are installed
pnpm install

# Check for any dependency vulnerabilities
pnpm audit
```

- [ ] All dependencies installed successfully
- [ ] No critical vulnerabilities (or acknowledged)

### 3. Build Check
```bash
# Test the production build
pnpm build
```

- [ ] Build completes without errors
- [ ] No TypeScript errors (or NEXT_SKIP_TYPECHECKING is set)
- [ ] Bundle size is reasonable

### 4. AWS Configuration Check
```bash
# Verify AWS credentials
aws configure list

# Check AWS region
aws configure get region

# Verify SST is installed
pnpm exec sst version
```

- [ ] AWS credentials configured
- [ ] AWS region matches deployment region
- [ ] SST CLI is available

## 🧪 Deployment Test (Optional but Recommended)

If you want to test before the automated deployment:

### Option 1: Manual Deploy to Staging
```bash
# Deploy to a staging environment first
pnpm deploy:build:stage
```

- [ ] Staging deployment successful
- [ ] Staging site is accessible
- [ ] All features work in staging

### Option 2: Dry Run (if supported)
```bash
# Some SST versions support --dry-run
pnpm exec sst deploy --stage production --dry-run
```

## 🔍 Code Review

Before pushing to main:

### Git Status
```bash
git status
git diff main
```

- [ ] All intended changes are staged
- [ ] No unintended files included
- [ ] No sensitive data in commits (.env files, credentials, etc.)

### Code Quality
- [ ] TypeScript compilation passes (or skipping is intentional)
- [ ] No console.log debugging statements left in code
- [ ] Comments are clear and helpful
- [ ] Code follows project conventions

### Testing
```bash
# Run tests (if applicable)
pnpm test
```

- [ ] All tests pass
- [ ] New features have tests
- [ ] No broken tests ignored

## 📁 File Verification

Ensure critical files are present and correct:

```bash
# Check workflow file
cat .github/workflows/deploy-production.yml

# Validate YAML syntax
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-production.yml'))"

# Check SST config
cat sst.config.ts
```

- [ ] `.github/workflows/deploy-production.yml` exists
- [ ] Workflow YAML syntax is valid
- [ ] `sst.config.ts` is properly configured
- [ ] `package.json` has correct deployment scripts

## 🌐 Domain & DNS Configuration

If this is first deployment:

```bash
# Check domain DNS records
nslookup brianstoker.com
dig brianstoker.com
```

- [ ] Domain is registered
- [ ] DNS nameservers point to AWS Route53 (if using)
- [ ] SSL certificate is ready (or will be auto-provisioned)

## 🚀 GitHub Actions Workflow Review

Check the workflow configuration:

```bash
cat .github/workflows/deploy-production.yml
```

Verify:
- [ ] Triggers on push to `main` branch
- [ ] All required secrets are referenced
- [ ] Node version matches local (18)
- [ ] pnpm version is correct (10)
- [ ] Deployment command is `pnpm deploy:build:prod`
- [ ] Concurrency control is configured
- [ ] Timeout is reasonable (30 minutes)

## 📊 Pre-Push Validation

Run these final checks:

```bash
# 1. Verify git branch
git branch --show-current
# Should be on a feature branch, not main

# 2. Check git remote
git remote -v
# Verify you're pushing to the correct repository

# 3. Review commits
git log --oneline -5
# Ensure commit messages are clear

# 4. Check for secrets
git diff main | grep -i "password\|secret\|key\|token"
# Should return nothing (or only references to secrets)
```

- [ ] On correct branch for PR (or ready to push to main)
- [ ] Pushing to correct repository
- [ ] Commit messages are descriptive
- [ ] No secrets in code changes

## 🎯 Deployment Readiness

### Before Creating PR or Pushing to Main:

- [ ] All checklist items above completed
- [ ] GitHub secrets are configured
- [ ] Local deployment test passed (optional)
- [ ] Team/stakeholders notified (if applicable)
- [ ] Monitoring/alerts configured (optional)

### After Push to Main:

1. **Monitor GitHub Actions**
   - Go to: https://github.com/[username]/brianstoker.com/actions
   - Watch the "Deploy to Production" workflow
   - Check for any errors in real-time

2. **Verify Deployment**
   ```bash
   # Once workflow completes, test the site
   curl -I https://brianstoker.com
   ```
   - [ ] HTTP status is 200 OK
   - [ ] SSL certificate is valid
   - [ ] Site loads correctly in browser

3. **Smoke Test**
   - [ ] Homepage loads
   - [ ] Art section works
   - [ ] Drums section works
   - [ ] Photography section works
   - [ ] Resume section works
   - [ ] .plan blog works
   - [ ] Navigation functions correctly

4. **Check AWS Resources**
   ```bash
   # List CloudFormation stacks
   aws cloudformation list-stacks --region us-east-1 | grep brianstoker

   # Check S3 buckets
   aws s3 ls | grep brianstoker
   ```
   - [ ] CloudFormation stack deployed successfully
   - [ ] S3 bucket contains site files
   - [ ] CloudFront distribution is healthy

## ❌ If Deployment Fails

1. **Check GitHub Actions Logs**
   - Identify which step failed
   - Read error messages carefully

2. **Common Issues & Fixes**

   **AWS Credentials Error:**
   - Verify secrets are set correctly
   - Check IAM permissions

   **MongoDB Connection Error:**
   - Check MONGODB_URI format
   - Verify network access in MongoDB Atlas
   - Ensure authentication credentials are correct

   **SST Deployment Error:**
   - Check ROOT_DOMAIN is set
   - Verify domain configuration
   - Check AWS service limits

3. **Rollback Plan**
   ```bash
   # If needed, rollback to previous version
   git revert HEAD
   git push origin main
   ```

4. **Get Help**
   - Review logs in GitHub Actions
   - Check AWS CloudFormation events
   - Review SST documentation
   - Check this repository's issues

## 📝 Post-Deployment Tasks

After successful deployment:

- [ ] Update deployment log/changelog
- [ ] Notify team/users of new deployment
- [ ] Monitor error rates in CloudWatch (first 24h)
- [ ] Update documentation if needed
- [ ] Close related issues/PRs

## 🔄 Continuous Improvement

After each deployment:

- Document any issues encountered
- Update this checklist if new steps are needed
- Review deployment time and optimize if needed
- Update secrets rotation schedule

---

## Quick Reference Commands

```bash
# Check all secrets are set (manual check in GitHub UI)
# Settings → Secrets and variables → Actions

# Validate workflow syntax
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-production.yml'))"

# Test AWS access
aws sts get-caller-identity

# Test MongoDB connection
mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')"

# Build locally
pnpm build

# Deploy manually (for testing)
pnpm deploy:build:prod

# Monitor deployment
# Go to: https://github.com/[username]/brianstoker.com/actions
```

---

**Remember:** It's better to be thorough now than to debug a failed production deployment later!
