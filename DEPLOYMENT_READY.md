# 🚀 GitHub Actions Deployment - Ready to Configure

Your GitHub Actions deployment workflow is ready! Follow these steps to configure and test before your first automated deployment.

## 📦 What's Been Created

1. **`.github/workflows/deploy-production.yml`** - GitHub Actions workflow for automated deployment
2. **`docs/GITHUB_DEPLOYMENT_SETUP.md`** - Comprehensive setup guide
3. **`docs/PRE_DEPLOYMENT_CHECKLIST.md`** - Pre-deployment verification checklist
4. **`README.md`** - Updated with deployment documentation

## ⚙️ Required Configuration Steps

### Step 1: Configure GitHub Secrets

You **MUST** configure these secrets in your GitHub repository before pushing:

**Navigate to:** `https://github.com/[your-username]/brianstoker.com/settings/secrets/actions`

Click **"New repository secret"** for each of the following:

#### AWS Credentials (Required)
```
Name: AWS_ACCESS_KEY_ID
Value: [Your AWS Access Key ID]
```

```
Name: AWS_SECRET_ACCESS_KEY
Value: [Your AWS Secret Access Key]
```

```
Name: AWS_REGION
Value: us-east-1
```

#### Application Configuration (Required)
```
Name: ROOT_DOMAIN
Value: brianstoker.com
```

```
Name: MONGODB_URI
Value: [Your MongoDB connection string from .env.production]
```

```
Name: MONGODB_USER
Value: [Your MongoDB username from .env.production]
```

```
Name: MONGODB_PASS
Value: [Your MongoDB password from .env.production]
```

#### GitHub Integration (Required)
```
Name: GH_TOKEN
Value: [Your GitHub Personal Access Token]
```

```
Name: GITHUB_USERNAME
Value: [Your GitHub username]
```

#### Optional Configuration
```
Name: NEXT_PUBLIC_WEB_URL
Value: https://brianstoker.com
(optional - can be computed from ROOT_DOMAIN)
```

```
Name: SYNC_ENDPOINT
Value: [Your sync endpoint from .env.production]
(optional - only if using GitHub sync)
```

```
Name: SYNC_SECRET
Value: [Your sync secret from .env.production]
(optional - only if using GitHub sync)
```

### Step 2: Get Your Secret Values

#### AWS Credentials

Your AWS credentials are already configured locally. Get them with:

```bash
aws configure get aws_access_key_id
aws configure get aws_secret_access_key
aws configure get region
```

Copy these values to the corresponding GitHub secrets.

#### MongoDB & Application Secrets

These are in your `.env.production` file:

```bash
cat .env.production
```

Copy each value to its corresponding GitHub secret.

⚠️ **Important:**
- For `GH_TOKEN`, you need a GitHub Personal Access Token, NOT the `GITHUB_TOKEN` from .env.production
- Make sure to use `GH_TOKEN` (not `GITHUB_TOKEN`) in GitHub secrets to avoid conflicts

#### GitHub Personal Access Token

Create a new token at: https://github.com/settings/tokens

1. Click "Generate new token (classic)"
2. Name it: `brianstoker.com deployment`
3. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:user` (Read user profile data)
   - ✅ `user:email` (Access user email addresses)
4. Click "Generate token"
5. Copy the token immediately (you won't see it again!)
6. Add to GitHub secrets as `GH_TOKEN`

### Step 3: Verify All Secrets Are Set

Go to: `Settings → Secrets and variables → Actions`

You should see these secrets listed:
- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] AWS_REGION
- [ ] ROOT_DOMAIN
- [ ] MONGODB_URI
- [ ] MONGODB_USER
- [ ] MONGODB_PASS
- [ ] GH_TOKEN
- [ ] GITHUB_USERNAME
- [ ] NEXT_PUBLIC_WEB_URL (optional)
- [ ] SYNC_ENDPOINT (optional)
- [ ] SYNC_SECRET (optional)

## ✅ Pre-Push Verification

Before pushing to main, run through this quick checklist:

### 1. Verify Workflow File
```bash
# Check workflow exists
ls -la .github/workflows/deploy-production.yml

# Validate YAML syntax
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-production.yml'))"
```

### 2. Check Git Status
```bash
git status
```

Expected files to be committed:
- `.github/workflows/deploy-production.yml`
- `docs/GITHUB_DEPLOYMENT_SETUP.md`
- `docs/PRE_DEPLOYMENT_CHECKLIST.md`
- `README.md`

### 3. Review Changes
```bash
# Review all changes
git diff HEAD

# Make sure no sensitive data is included
git diff HEAD | grep -i "password\|secret\|key" | grep -v "SECRET_NAME"
```

### 4. Local Build Test (Optional but Recommended)
```bash
# Test the build works
pnpm build
```

## 🚦 Ready to Deploy

Once all secrets are configured and verification is complete:

### Option 1: Push Directly to Main (Triggers Auto-Deploy)
```bash
# Stage all changes
git add .github/workflows/deploy-production.yml
git add docs/GITHUB_DEPLOYMENT_SETUP.md
git add docs/PRE_DEPLOYMENT_CHECKLIST.md
git add README.md

# Commit
git commit -m "Add GitHub Actions deployment workflow

- Configure automated deployment on push to main
- Add comprehensive deployment documentation
- Include pre-deployment checklist
- Update README with deployment guide"

# Push to main (THIS WILL TRIGGER DEPLOYMENT!)
git push origin main
```

### Option 2: Create a Pull Request First (Safer)
```bash
# Create a new branch
git checkout -b feature/github-actions-deployment

# Stage all changes
git add .github/workflows/deploy-production.yml
git add docs/GITHUB_DEPLOYMENT_SETUP.md
git add docs/PRE_DEPLOYMENT_CHECKLIST.md
git add README.md

# Commit
git commit -m "Add GitHub Actions deployment workflow

- Configure automated deployment on push to main
- Add comprehensive deployment documentation
- Include pre-deployment checklist
- Update README with deployment guide"

# Push branch
git push origin feature/github-actions-deployment

# Then create a PR on GitHub and review before merging to main
```

## 📊 Monitor the Deployment

Once you push to main:

1. **Go to GitHub Actions**: https://github.com/[username]/brianstoker.com/actions
2. **Watch the workflow**: Click on "Deploy to Production" workflow
3. **Monitor progress**: Watch each step execute in real-time
4. **Check for errors**: If any step fails, review the logs

Expected workflow steps:
1. ✅ Checkout code
2. ✅ Setup pnpm
3. ✅ Setup Node.js
4. ✅ Configure AWS credentials
5. ✅ Install dependencies
6. ✅ Install deployment tools (dotenvx, senvn)
7. ✅ Create .env.production from secrets
8. ✅ Deploy to production
9. ✅ Create deployment summary

## 🎯 Post-Deployment Verification

After deployment completes:

```bash
# Test the site is live
curl -I https://brianstoker.com

# Should return: HTTP/2 200
```

Then manually verify in browser:
- [ ] Homepage loads
- [ ] Art section works
- [ ] Drums section works
- [ ] Photography section works
- [ ] Resume section works
- [ ] .plan blog works

## 🔧 Troubleshooting

### If Deployment Fails

1. **Check GitHub Actions logs** - Look for the specific error
2. **Verify secrets** - Ensure all required secrets are set correctly
3. **Check AWS credentials** - Verify IAM user has sufficient permissions
4. **Review MongoDB connection** - Ensure URI is correct and network access is allowed
5. **Check domain configuration** - Verify ROOT_DOMAIN matches your actual domain

Common issues and solutions are documented in:
- `docs/GITHUB_DEPLOYMENT_SETUP.md` (Troubleshooting section)
- `docs/PRE_DEPLOYMENT_CHECKLIST.md` (If Deployment Fails section)

### Manual Rollback

If needed, you can rollback:
```bash
git revert HEAD
git push origin main
```

## 📚 Documentation

- **Setup Guide**: `docs/GITHUB_DEPLOYMENT_SETUP.md`
- **Checklist**: `docs/PRE_DEPLOYMENT_CHECKLIST.md`
- **Workflow**: `.github/workflows/deploy-production.yml`
- **README**: `README.md` (Deployment section)

## 🎉 You're Ready!

Once you've:
1. ✅ Configured all required GitHub secrets
2. ✅ Verified workflow syntax is valid
3. ✅ Reviewed changes in git
4. ✅ Optionally tested build locally

You can push to main and your site will automatically deploy to AWS!

---

**Need Help?** Review the comprehensive guides:
- Start with: `docs/GITHUB_DEPLOYMENT_SETUP.md`
- Before pushing: `docs/PRE_DEPLOYMENT_CHECKLIST.md`

**Questions?** Open an issue or review the SST documentation at https://docs.sst.dev/
