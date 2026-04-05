# SC_OVERVIEW.md
<!-- meta-version: 0.2.0 -->
<!-- generated: 2026-03-21 -->

## Repository Purpose

Personal portfolio and product showcase site for Brian Stoker (`brianstoker.com`). The site serves as a living resume and engineering showcase, displaying GitHub activity, blog posts, product demos, photography, and a PDF resume. It is a Next.js 15 application deployed serverlessly to AWS via SST v3 with OpenNext.

---

## Architecture

### Runtime Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.3 (Pages Router, **not** App Router) |
| UI | MUI v5 (Material Design) + Tailwind CSS + Emotion CSS-in-JS |
| Database | MongoDB Atlas (native driver, no ORM) |
| Auth | NextAuth.js v4, Google OAuth |
| Deployment | SST 3.x → @opennextjs/aws → AWS Lambda + S3/CDN |
| Package Manager | pnpm 10.28.2 |
| Dev Server Port | **5040** |
| Node Memory | 8 GB (`--max_old_space_size=8192`) |

### Router Style

Pages Router (`pages/` directory). **No App Router.** All route files live under `pages/`.

---

## Package Dependency Graph

This is a single-package repository — no workspaces. All dependencies are declared in the root `package.json`.

### Key Production Dependencies

```
next@15.3.0
react@18.3.1 + react-dom@18.3.1
@mui/material@^5.18.0           — UI component library
@emotion/react + styled          — CSS-in-JS runtime for MUI
tailwindcss@^3.4.18              — utility CSS (Tailwind preflight disabled; MUI CssBaseline used)
mongodb@^6.20.0                  — database driver
next-auth@^4.24.13               — auth (Google OAuth)
next-mdx-remote@^5.0.0           — MDX blog post rendering
gray-matter@^4.0.3               — MDX front-matter parsing
sst@3.9.7                        — infra-as-code (Pulumi-based)
@opennextjs/aws@^3.1.3           — Lambda adapter for Next.js
react-activity-calendar@2.7.10   — GitHub contribution calendar
react-github-calendar@^4.5.11    — GitHub calendar wrapper
date-fns@^4.1.0                  — date utilities
culori@^4.0.2                    — color math (used in GithubEvents styling)
@stoked-ui/docs@0.1.7            — internal docs/branding package
```

### Key Dev Dependencies

```
@playwright/test@^1.56.1  — e2e / visual regression tests
turbo@^2.3.3              — monorepo task runner (used for parallel dev tasks)
tsx@^4.20.6               — TypeScript script runner
knip@^5.65.0              — dead code / unused dep detector
typescript@6.0.0-dev      — type checking (skipped during builds via NEXT_SKIP_TYPECHECKING=1)
@svgr/webpack             — SVG-as-React-component loader
dotenvx                   — env var management (wraps dotenv)
```

---

## Key Technologies and Patterns

### Styling System

- **Primary**: MUI v5 with Emotion CSS-in-JS (`sx` prop, `styled()`)
- **Secondary**: Tailwind CSS for utility classes
- **Tailwind preflight disabled** — MUI `CssBaseline` handles resets
- SVGs imported as React components via `@svgr/webpack`
- MUI icon aliases resolve to ESM path (`@mui/icons-material/esm`) for bundle size

### Data Fetching

- **Static**: `getStaticProps` for blog posts and home page
- **Dynamic**: API routes under `pages/api/` for GitHub events, auth, and logs
- **No SWR/React Query** — custom fetch + in-memory cache in `GithubEvents` component via `src/utils/eventCacheManager`

### MDX Blog

- Blog posts live in `data/.plan/*.mdx`
- Parsed by `lib/sourcing.ts` using `gray-matter` + `next-mdx-remote`
- Rendered via `pages/.plan/[slug].tsx`

### Auth

- NextAuth.js v4 with Google OAuth
- Config: `pages/api/auth/[...nextauth].js`
- Session provided app-wide via `SessionProvider` in `pages/_app.js`

### MongoDB Connection

- Singleton pattern in `pages/api/lib/mongodb.ts`
- Dev: global variable prevents hot-reload connection leaks
- Prod: fresh connection per Lambda cold start
- Helper: `getDatabase()` returns the correct DB by stage (`brianstoker-production` / `brianstoker-local`)
- **Collections**: `github_events`, `sync_metadata`

---

## Directory Structure

```
/
├── pages/                    # Next.js pages (Pages Router)
│   ├── _app.js               # App shell: SessionProvider + DocsProvider
│   ├── _document.js          # Custom HTML document
│   ├── index.tsx             # Home page (getStaticProps → blog posts)
│   ├── resume.tsx            # Resume page
│   ├── resume-new.tsx        # Resume (redesign WIP)
│   ├── work.tsx              # Work history
│   ├── art.tsx               # Art/creative showcase
│   ├── photography.tsx       # Photography gallery
│   ├── drums.tsx             # Drums page
│   ├── hal.js                # HAL dashboard
│   ├── 404.tsx               # Custom 404
│   ├── .plan/[slug].tsx      # Blog post page (dynamic route)
│   └── api/
│       ├── auth/[...nextauth].js         # NextAuth handler
│       ├── github/
│       │   ├── events.ts                 # GET paginated GitHub events from MongoDB
│       │   ├── sync-events.ts            # POST trigger GitHub sync (Bearer-authenticated)
│       │   ├── filters.ts                # GET filter options
│       │   ├── event/[id].ts             # GET single event details
│       │   ├── pull-request.ts           # GET PR details
│       │   ├── pull-request/[number].ts  # GET PR by number
│       │   ├── pull-request-files.ts     # GET PR file changes
│       │   └── commit-files.ts           # GET commit file list
│       ├── hal/logs.js                   # HAL log shipping endpoint
│       └── lib/mongodb.ts                # MongoDB client singleton + getDatabase()
│
├── src/
│   ├── products.tsx          # Product catalog (TProduct[]) — 11 products with showcases
│   ├── route.ts              # ROUTES constant (navigation links)
│   ├── layouts/
│   │   ├── AppHeader.tsx     # Top navigation bar
│   │   ├── AppFooter.tsx     # Footer with social links + email subscribe
│   │   ├── Section.tsx       # Page section wrapper
│   │   └── HeroContainer.tsx # Hero section layout
│   ├── components/
│   │   ├── GithubEvents/     # GitHub activity feed components
│   │   │   ├── GithubEvents.tsx          # Main feed (fetch, cache, paginate, filter)
│   │   │   ├── PushEvent.tsx             # Commit push event card
│   │   │   ├── PullRequestEvent.tsx      # PR event card
│   │   │   ├── CreateEvent.tsx           # Branch/tag create event
│   │   │   ├── DeleteEvent.tsx           # Branch/tag delete event
│   │   │   ├── IssuesEvent.tsx           # Issue event card
│   │   │   ├── IssueCommentEvent.tsx     # Issue comment event card
│   │   │   └── EventHeader.tsx           # Shared event card header
│   │   ├── GithubCalendar/
│   │   │   └── GithubCalendar.tsx        # Contribution calendar heatmap
│   │   ├── home/             # Home page section components
│   │   │   ├── HeroMain.tsx              # Hero / above-fold section
│   │   │   ├── GithubEventsShowcase.tsx  # GitHub events in product switcher
│   │   │   ├── BlogShowcase.tsx          # Recent blog posts
│   │   │   ├── VideoShowcase.tsx         # Video demos
│   │   │   ├── PdfShowcase.tsx           # PDF viewer
│   │   │   ├── ImageShowcase.tsx         # Photography/image grid
│   │   │   ├── MediaShowcase.tsx         # Media player
│   │   │   ├── MaterialShowcase.tsx      # MUI component demos
│   │   │   └── ...
│   │   ├── ProductSwitcher.tsx           # Carousel switching between products
│   │   ├── PullRequest/                  # PR detail view components
│   │   └── ...
│   ├── types/
│   │   └── github.ts         # GitHubEvent, EventDetails, CachedData interfaces
│   ├── modules/
│   │   ├── components/       # Shared utility components (Head, DemoEditor, etc.)
│   │   ├── sandbox/          # CodeSandbox/StackBlitz integration helpers
│   │   └── utils/            # Clipboard, page-finding, code-copy utilities
│   └── utils/
│       ├── eventCacheManager.ts  # Client-side IndexedDB/memory cache for GitHub events
│       └── githubEmoji.ts        # GitHub emoji shortcode → unicode replacer
│
├── lib/
│   ├── github-sync.ts        # Core sync logic: GitHub API → MongoDB upsert
│   ├── sourcing.ts           # Blog post MDX file reader/parser
│   └── mongodb.ts            # (Duplicate of pages/api/lib/mongodb.ts — legacy location)
│
├── cron/
│   └── github-sync.ts        # AWS Lambda handler for scheduled GitHub sync
│
├── stacks/                   # SST infrastructure definitions
│   ├── index.ts              # Re-exports all stack modules
│   ├── site.ts               # sst.aws.Nextjs site (OpenNext, domain, env vars)
│   ├── cron.ts               # sst.aws.Cron (EventBridge, hourly, calls cron/github-sync.ts)
│   ├── domains.ts            # Domain/DB name derivation logic
│   ├── bucket.ts             # S3 bucket for HAL logs ("HalBucket")
│   ├── api.ts                # API stack (if applicable)
│   ├── secrets.ts            # SST secrets helpers
│   └── envVars.ts            # Environment variable helpers
│
├── data/
│   ├── .plan/*.mdx           # Blog posts (MDX with front-matter)
│   ├── pages.ts              # Site page manifest
│   └── ...
│
├── e2e/                      # Playwright tests
│   ├── smoke-tests.spec.ts   # Cross-viewport smoke tests (5 viewports)
│   ├── visual-regression.spec.ts  # Visual snapshot tests
│   └── utils/viewport-helpers.ts  # Viewport constants + scroll helpers
│
├── scripts/
│   ├── local-sync-cron.cjs   # Dev cron: polls /api/github/sync-events every hour
│   ├── copy-db-schema.ts     # Copies MongoDB schema info
│   ├── list-db-info.ts       # Inspects MongoDB collections
│   └── aws-deploy.sh         # Production deploy shell script
│
├── public/
│   ├── static/               # Static assets (icons, resume PDF, social previews)
│   └── feed/.plan/rss.xml    # Blog RSS feed
│
├── sst.config.ts             # SST app entrypoint (wires site + cron + bucket)
├── next.config.mjs           # Next.js config (MDX, SVG, standalone output, Turbopack)
└── package.json              # Single-package manifest, all scripts
```

---

## Data Flow: GitHub Events (Critical Path)

```
Production (hourly):
  AWS EventBridge (rate 1 hour)
    → cron/github-sync.ts (Lambda handler)
    → lib/github-sync.ts::syncGitHubEvents()
    → GitHub Events API (paginated, incremental or full refresh)
    → MongoDB github_events collection (upsert by event id)
    → MongoDB sync_metadata collection (last sync timestamp)

Development (manual/polled):
  scripts/local-sync-cron.cjs (Node process, every 1 hour)
    → POST /api/github/sync-events (Bearer: SYNC_SECRET)
    → pages/api/github/sync-events.ts
    → lib/github-sync.ts::syncGitHubEvents()
    → MongoDB

On-demand (admin):
  POST /api/github/sync-events?fullRefresh=true
    → Full wipe + re-fetch all pages from GitHub

Frontend display:
  GithubEvents.tsx component
    → GET /api/github/events?page=N&per_page=40&repo=...&action=...&date=...
    → pages/api/github/events.ts
    → MongoDB find() with filter, sort, skip/limit
    → Client-side cache (eventCacheManager, IndexedDB/memory)
    → Rendered as typed event cards (PushEvent, PullRequestEvent, etc.)
```

### MongoDB Indexes (github_events collection)

| Field | Index Type |
|-------|-----------|
| `created_at` | Descending (sort) |
| `id` | Unique (dedup) |
| `repo.name` | Ascending (filter) |
| `type` | Ascending (filter) |

---

## Development Workflow

### Starting Development

```bash
pnpm dev           # Turbopack dev server (port 5040) + local sync cron (parallel via turbo)
pnpm dev:nextjs    # Next.js only (no cron)
```

The `pnpm dev` command uses `turbo watch` to run both `dev:nextjs` and `dev:cron` tasks concurrently. The cron process waits 10 seconds for Next.js to start before its first sync.

### Build System

| Command | What it does |
|---------|-------------|
| `pnpm build` | Standard Next.js build (no lint, 8 GB RAM) |
| `pnpm build:sst` | `next build --no-lint` for SST deployments |
| `pnpm typescript` | Run `tsc` on both `tsconfig.json` and `scripts/tsconfig.json` |
| `pnpm knip` | Detect unused code and dependencies |

**Type checking is skipped during builds** via `NEXT_SKIP_TYPECHECKING=1`. Run `pnpm typescript` separately for type safety.

**Output mode**: `standalone` (required for Lambda deployment).

### Deploy

```bash
# Always use --profile stoked for AWS CLI
AWS_PROFILE=stoked senvn -f production npx sst deploy --stage production
pnpm deploy:prod   # Shorthand (uses scripts/aws-deploy.sh)
```

SST stage determines domain and DB:
- `production` → `brianstoker.com` + `www.brianstoker.com`, DB: `brianstoker-production`
- Other stages → `<stage>.brianstoker.com`, DB: `brianstoker-<stage>`

### Environment Variables (Required)

| Variable | Purpose |
|----------|---------|
| `ROOT_DOMAIN` | Site domain for SST domain derivation |
| `GITHUB_TOKEN` | GitHub API authentication |
| `GITHUB_USERNAME` | GitHub user to sync (default: `brian-stoker`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_NAME` | Database name (derived from stage if unset) |
| `SYNC_SECRET` | Bearer token for `/api/github/sync-events` |
| `NEXTAUTH_SECRET` | NextAuth session signing key |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth credentials |
| `NEXT_PUBLIC_WEB_URL` | Public site URL |

### Testing

```bash
pnpm test               # All Playwright e2e tests
pnpm test:smoke         # smoke-tests.spec.ts (5 viewports: 320px–1280px)
pnpm test:mobile        # e2e/mobile/ tests
pnpm test:visual        # Visual regression snapshots
pnpm test:visual:update # Update snapshots
```

Smoke tests cover: page load, no horizontal scroll, header visibility, mobile menu, navigation, hero typography, product carousel, newsletter toast positioning, footer, keyboard navigation, and performance (<10s load on mobile).

---

## Entry Points

| Entry Point | Purpose |
|------------|---------|
| `pages/_app.js` | App root — wraps all pages with `SessionProvider` + `DocsProvider` |
| `pages/index.tsx` | Home page — `HomeView` + `MainView` (HeroMain with blog posts) |
| `sst.config.ts` | Infrastructure root — wires `createSite`, `createGithubSyncCron`, `createHalBucket` |
| `cron/github-sync.ts` | Lambda cron entry point — calls `syncGitHubEvents()` |
| `lib/github-sync.ts` | Core sync logic — GitHub API fetch + MongoDB upsert |
| `pages/api/lib/mongodb.ts` | DB singleton — `getDatabase()` used by all API routes |

---

## Products System

`src/products.tsx` defines the `PRODUCTS` array (type `TProduct[]`). Each product has:
- `id`, `name`, `fullName`, `description`
- `icon` — React element or image path
- `features` — array of feature descriptors
- `url` — external product URL
- `showcaseType` — React component rendered in `ProductSwitcher` carousel
- `showcaseContent` — props passed to the showcase component

The `ProductSwitcher` (`src/components/ProductSwitcher.tsx`) renders a swipeable carousel of products. On mobile it shows `react-swipeable-views`; on desktop it shows a side-by-side panel with navigation arrows.

Showcase components include: `GithubEventsShowcase`, `MaterialShowcase`, `CoreShowcase`, `BlogShowcase`, `PdfShowcase`, `VideoShowcase`, `ImageShowcase`, `CustomerShowcase`.

---

## Infrastructure (SST Stacks)

```
sst.config.ts
  └── stacks/index.ts
        ├── createSite()          → sst.aws.Nextjs (OpenNext Lambda + CloudFront CDN)
        ├── createGithubSyncCron() → sst.aws.Cron (EventBridge, rate 1 hour)
        │     └── handler: cron/github-sync.ts
        └── createHalBucket()     → sst.aws.Bucket ("HalBucket" — S3 for HAL logs)
```

The `createSite` stack validates all required env vars at deploy time and configures aggressive CDN caching for static assets (1 year immutable) with no-cache for HTML.

---

## Critical Notes

- **Next.js Pages Router only** — no App Router patterns apply
- **`git stash` is forbidden** — commit uncommitted changes instead
- **AWS profile** — always use `--profile stoked` for AWS CLI commands
- **Type checking** — `tsc` is skipped during builds; run `pnpm typescript` separately
- **Tailwind preflight** disabled — MUI `CssBaseline` owns global resets
- **Images unoptimized** — `next/image` optimization is off; assets served from S3/CDN
- **pnpm only** — not npm or yarn; `packageManager` is pinned to `pnpm@10.28.2`
