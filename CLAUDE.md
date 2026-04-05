# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio/product showcase site for Brian Stoker. Next.js 15 app deployed to AWS via SST (Serverless Stack) with OpenNext. Uses MongoDB Atlas for persistence, GitHub API for activity tracking, and a cron job that syncs GitHub events hourly.

## Commands

### Development
```bash
pnpm dev                    # Start dev server (Turbopack) on port 5040 + local cron
pnpm dev:nextjs             # Next.js dev server only (no cron)
```

### Build
```bash
pnpm build                  # Standard Next.js build
pnpm build:sst              # Build for SST deployment (no lint)
```

### Deploy
```bash
# Always prefix with AWS_PROFILE=stoked
AWS_PROFILE=stoked senvn -f production npx sst deploy --stage production
pnpm deploy:prod            # Shorthand (uses senvn internally)
```

### Testing (Playwright)
```bash
pnpm test                   # Run all e2e tests
pnpm test:smoke             # Smoke tests only
pnpm test:mobile            # Mobile viewport tests (e2e/mobile/)
pnpm test:headed            # Run with visible browser
pnpm test:ui                # Interactive Playwright UI
pnpm test:debug             # Debug mode
pnpm test:visual            # Visual regression tests
pnpm test:visual:update     # Update visual snapshots
pnpm test:report            # View HTML test report
```

### Type Checking & Code Quality
```bash
pnpm typescript             # Run tsc on both app and scripts tsconfigs
pnpm knip                   # Detect unused code/dependencies
```

### Utility Scripts
```bash
pnpm list-db-info           # Inspect MongoDB collections/schema
pnpm copy-db-schema         # Copy database schema
pnpm sync-cron              # Manually trigger GitHub event sync
pnpm link-check             # Report broken links
```

## AWS

Always use `--profile stoked` when running AWS CLI commands (e.g. `aws --profile stoked ...`).

## Architecture

### Stack
- **Framework**: Next.js 15.3 with Turbopack (dev), React 18
- **Styling**: MUI 5 (Material Design) + Tailwind CSS + Emotion CSS-in-JS
- **Database**: MongoDB Atlas (native driver, no ORM)
- **Auth**: NextAuth.js v4 with Google OAuth
- **Deployment**: SST 3.x → OpenNext → AWS Lambda + S3/CDN
- **Testing**: Playwright (mobile/tablet/desktop viewports)
- **Package Manager**: pnpm 10.x

### Key Directories
- `pages/` — Next.js pages and API routes (Pages Router, not App Router)
- `pages/api/github/` — GitHub event sync, filters, PR details
- `pages/api/lib/mongodb.ts` — MongoDB client singleton and `getDatabase()` helper
- `src/components/` — React components (GithubEvents, home showcases, etc.)
- `src/layouts/` — AppHeader, AppFooter, Section, HeroContainer
- `src/products.tsx` — Product catalog definition (11 products with features/showcases)
- `stacks/` — SST infrastructure (site, cron, domains, secrets, S3 bucket)
- `data/` — Content files (MDX blog posts, JSON data)
- `e2e/` — Playwright test suites
- `scripts/` — Build, sync, and utility scripts

### Data Flow: GitHub Events
1. SST cron job (hourly) or `scripts/local-sync-cron.cjs` calls `/api/github/sync-events`
2. Sync endpoint fetches from GitHub Events API using `GITHUB_TOKEN`
3. Events stored in MongoDB `github_events` collection
4. Frontend components (`GithubEvents`, `GithubCalendar`) query `/api/github/events` with filters

### MongoDB
- Production DB: `brianstoker-production`, Dev DB: `brianstoker-local`
- Connection pooling via global variable in dev mode
- Collections: `github_events`, `sync_metadata`

### Products System
`src/products.tsx` defines the product catalog. Each product has a name, description, icon, URL, features array, and a showcase component rendered on the home page via `ProductSwitcher`.

### Environment Variables
Key env vars (managed via `.env` + `dotenvx`):
- `ROOT_DOMAIN` — Site domain for SST
- `GITHUB_TOKEN`, `GITHUB_USERNAME` — GitHub API access
- `MONGODB_URI` — MongoDB Atlas connection string
- `SYNC_SECRET` — Secret for sync endpoint auth
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — NextAuth Google OAuth
- `NEXTAUTH_SECRET` — NextAuth session signing

### Build Notes
- Type checking is skipped during builds (`NEXT_SKIP_TYPECHECKING=1`) for speed
- ESLint is ignored during Next.js builds
- Images are unoptimized (no Next.js image optimization)
- Node memory increased to 8GB (`--max_old_space_size=8192`)
- Standalone output mode for Lambda deployment
- Tailwind preflight is disabled (MUI CssBaseline used instead)

### Dev Server
Runs on port **5040**. The `pnpm dev` command starts both the Next.js Turbopack dev server and a local cron process that periodically syncs GitHub events.
