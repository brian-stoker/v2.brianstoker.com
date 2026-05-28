<!-- stokd-meta-version: 0.4.0 -->
# SC_OVERVIEW — brianstoker-com

A comprehensive overview of the `v2.brianstoker.com` codebase. This document is the canonical entry point for understanding repository purpose, architecture, dependencies, technology choices, the development workflow, and the critical execution paths.

---

## 1. Repository Purpose

`brianstoker-com` is the personal portfolio and product showcase site for **Brian Stoker** (https://brianstoker.com). It serves three primary functions:

1. **Marketing surface** for a catalog of ~11 products defined in `src/products.tsx` (showcased via `ProductSwitcher` on the home page).
2. **Living activity feed** that displays GitHub events (commits, PRs, issues, projects) pulled hourly from the GitHub Events API and persisted to MongoDB Atlas.
3. **Static content surface** — resume (`pages/resume*.tsx`), photography, art, drums, blog (MDX in `pages/home/`), and ancillary single-purpose pages.

It is **not** a monorepo. It is a single Next.js application with sidecar SST infrastructure code (`stacks/`), a Lambda cron handler (`cron/`), and content/script directories.

Repo root: `/opt/worktrees/v2.brianstoker.com/v2.brianstoker.com-main` (current branch: `main`).

---

## 2. Architecture

### 2.1 High-Level

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  ├── Pages (SSR/SSG via Next.js Pages Router)           │
│  └── Client React (MUI 5 + Emotion + Tailwind)          │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  AWS Lambda (OpenNext)         AWS Lambda (SST Cron)    │
│  ├── pages/* SSR               └── cron/github-sync.ts  │
│  ├── pages/api/* routes              hourly schedule    │
│  └── NextAuth (Google OAuth)                            │
└───────────────────┬─────────────┬───────────────────────┘
                    │             │
        ┌───────────▼──┐     ┌────▼────────┐
        │  MongoDB     │     │  GitHub     │
        │  Atlas       │     │  Events API │
        │  (db named   │     └─────────────┘
        │   by stage)  │
        └──────────────┘
```

### 2.2 Runtime Topology

| Layer | Mechanism | Source |
|-------|-----------|--------|
| Web app | `sst.aws.Nextjs` deployed via `@opennextjs/aws` | `stacks/site.ts` |
| Hourly cron | `sst.aws.Cron` → Lambda handler | `stacks/cron.ts`, `cron/github-sync.ts` |
| Object storage | `sst.aws.Bucket` named `HalBucket` | `stacks/bucket.ts` |
| Domain routing | Stage-based domain resolver | `stacks/domains.ts` |
| Persistence | MongoDB Atlas (per-stage database) | `pages/api/lib/mongodb.ts`, `lib/mongodb.ts` |
| Auth | NextAuth.js v4 + Google OAuth | `pages/api/auth/[...nextauth].js` |

### 2.3 Pages Router (not App Router)

This project uses the **Next.js Pages Router** (`pages/`). API routes live under `pages/api/`. There is no `app/` directory. New pages must follow the Pages Router conventions and `_app.js` / `_document.js` (in `pages/`) are the global wrappers.

### 2.4 SST Infrastructure (`stacks/`)

`sst.config.ts` orchestrates the deployment. Its `run()` function dynamically imports `./stacks` and wires:

- `getDomainInfo(ROOT_DOMAIN, stage)` → per-stage domain set, resource name, DB name (see `stacks/domains.ts`).
- `createHalBucket()` → S3 bucket exposed to the Next.js Lambda via `S3_BUCKET_NAME` env.
- `createSite(domainInfo, { S3_BUCKET_NAME })` → the Next.js site. Build command is `pnpx @opennextjs/aws@latest build`. Requires a strict env var set (see §6); throws on missing values. Grants `*:*` IAM permissions to the site Lambda.
- `createGithubSyncCron(siteUrl, dbName)` → `rate(1 hour)` cron whose handler is `cron/github-sync.handler`, with 5-minute timeout. Calls `${siteUrl}/api/github/sync-events` via shared `SYNC_SECRET`.

Per `stacks/domains.ts`:
- Production stage → `[ROOT_DOMAIN, www.ROOT_DOMAIN]`.
- Other stages → `[${stage}.ROOT_DOMAIN, *.${stage}.ROOT_DOMAIN]`.
- DB name derived from the first domain’s subdomain segments + stage (e.g. `brianstoker-production`, `brianstoker-local`).

---

## 3. Package Dependency Graph

This is a **single-package** repository (not a monorepo). `package.json` defines all dependencies. There are no workspace packages; `turbo` is used only to run `dev:nextjs` and `dev:cron` concurrently (`turbo.json`).

### 3.1 Primary Production Dependencies (grouped)

- **Framework / runtime:** `next@15.3.0`, `react@18.3.1`, `react-dom@18.3.1`, `sst@3.9.7`, `open-next@^3.1.3`.
- **UI system:** `@mui/material@^5.18.0`, `@mui/icons-material@5.15.21`, `@mui/system`, `@mui/base@5.0.0-beta.70`, `@mui/styles`, `@mui/x-tree-view@^6.17.0`, `@stoked-ui/docs@0.1.7`.
- **CSS/styling:** `@emotion/{cache,react,styled}`, `styled-components`, `jss`, `tailwindcss` (devDep) via `tailwind.config.js`, `autoprefixer`, `postcss`.
- **Auth:** `next-auth@^4.24.13`.
- **Data:** `mongodb@^6.20.0` (native driver, no ORM), `@aws-sdk/client-s3`.
- **Content:** `@mdx-js/react`, `@next/mdx`, `next-mdx-remote`, `mui-markdown`, `marked`, `gray-matter`, `feed`, `@stoked-ui/docs-markdown`.
- **Media:** `pdfjs-dist@4.8.69`, `react-pdf`, `plyr-react`, `react-activity-calendar`, `react-github-calendar`.
- **Misc UX:** `react-swipeable-views`, `react-multi-carousel`, `react-intersection-observer`, `nprogress`, `clipboard-copy`, `clsx`, `date-fns`, `lodash`.

### 3.2 Dev / Tooling

- **Build:** `@opennextjs/aws@^3.8.4`, `@babel/*`, `babel-loader`, `@svgr/webpack`, `cross-env`, `dotenv`/`dotenvx`.
- **Testing:** `@playwright/test@^1.56.1` (e2e only — no unit test framework).
- **Static analysis:** `typescript@6.0.0-dev.20251014` (early 6.x preview), `knip@^5.65.0`.
- **Orchestration:** `turbo@^2.3.3`, `kill-port`, `tsx`.

### 3.3 Internal Module Dependencies

The application code is organized into these top-level source roots, with these relationships:

```
sst.config.ts ──► stacks/* ──► (AWS resources)
                                  │
cron/github-sync.ts ──► lib/github-sync.ts ──► lib/mongodb.ts ──► MongoDB Atlas
                                                                       ▲
pages/api/github/sync-events.ts ──► lib/github-sync.ts ────────────────┤
pages/api/github/events.ts ──► pages/api/lib/mongodb.ts ───────────────┘
pages/api/github/{filters,pull-request*,commit-files}.ts ──► (GitHub API + Mongo)

pages/* (UI) ──► src/components/* ──► src/layouts/*, src/modules/*, src/products.tsx
                          │
                          ├── src/components/GithubEvents/* ──► /api/github/events
                          ├── src/components/PullRequest/* ──► /api/github/pull-request{,-files}
                          └── src/components/home/* (showcases) ──► src/products.tsx
```

Note two separate MongoDB client modules exist: `pages/api/lib/mongodb.ts` (used by Pages API handlers, `appName: brianstoker-pages-api`) and `lib/mongodb.ts` (used by the cron Lambda and shared sync logic). Both target the same Atlas cluster but tag clients differently for Atlas attribution (per recent commit `af5fa04`).

---

## 4. Key Technologies & Patterns

### 4.1 Stack Summary

| Concern | Choice |
|--------|--------|
| Framework | Next.js 15.3 (Pages Router) with Turbopack dev server |
| Language | TypeScript (mixed `.ts`/`.tsx`/`.js` — type checking skipped during `build:sst`) |
| UI kit | MUI 5 (Material) + `@stoked-ui/docs` for branded primitives |
| Styling | Emotion CSS-in-JS, MUI `sx`, Tailwind utility classes (preflight disabled), some `styled-components`/JSS legacy |
| State | Local React state; no global store (no Redux/Zustand) |
| Data store | MongoDB Atlas, native driver, no ORM |
| Auth | NextAuth.js v4 (Google OAuth) |
| Cloud | AWS via SST 3.x; OpenNext to produce the Lambda bundle |
| Tests | Playwright e2e (mobile, tablet, desktop viewports) |
| Package manager | pnpm 10.28.2 |

### 4.2 Recurring Patterns

- **Showcase pattern.** Each product in `src/products.tsx` provides a showcase component from `src/components/home/*Showcase.tsx` rendered through `src/components/ProductSwitcher.tsx`.
- **Per-stage configuration via domain inference.** `stacks/domains.ts` derives resource names, DB names, and domain lists from `ROOT_DOMAIN` + stage, so adding a stage is mostly a name resolution exercise.
- **Secret-protected sync.** The `/api/github/sync-events` endpoint is callable only with `SYNC_SECRET`, shared with the cron Lambda via env vars.
- **Mongo client singleton.** Both Mongo modules cache the connect promise (`global._mongoClientPromise` in dev) to survive HMR.
- **Strict env validation at deploy time.** `createSite` aborts deployment when any required env var is missing, rather than failing at runtime.
- **Asset content-type/cache overrides.** `stacks/site.ts` explicitly sets `Cache-Control` and `Content-Type` for media (mp4/webm/mov/mp3/m4a) and immutable static assets; HTML is `no-store`.
- **`fix-nextjs15.js` shim.** A pair of `apply` / `restore` scripts are wrapped around `open-next build` in `build:open-next` to patch Next 15 compatibility issues with OpenNext 2.x.

### 4.3 Notable Build Quirks

- `NEXT_SKIP_TYPECHECKING=1` is used in `build:next15` for speed.
- `--max_old_space_size=8192` for all Next builds (memory-heavy MUI/MDX).
- ESLint ignored during Next.js builds (per CLAUDE.md).
- Images are unoptimized (Next image optimization disabled).
- Standalone output mode for Lambda packaging.
- Tailwind preflight disabled (MUI’s `CssBaseline` is the reset).

---

## 5. Development Workflow & Build System

### 5.1 Local Development

```bash
pnpm dev          # turbo watch: starts dev:nextjs + dev:cron concurrently
pnpm dev:nextjs   # Next dev server (Turbopack) on port 5040 — kills 5040 first
pnpm dev:cron     # local cron driver: scripts/local-sync-cron.cjs (sleep 10s then run)
```

`pnpm dev` runs `clean:cache` first (`rimraf .next .open-next`) and uses Turbo’s `tui` UI to multiplex the two persistent tasks defined in `turbo.json`. Env loaded via `dotenvx run`.

### 5.2 Build Variants

| Script | Purpose |
|--------|--------|
| `pnpm build` | Standard Next build with `--profile` and 8GB heap. |
| `pnpm build:sst` | `next build --no-lint` — used by SST deploy. |
| `pnpm build:next15` | Skips typechecking and prop serialization for speed. |
| `pnpm build:open-next` | OpenNext 2.2.3 build wrapped in `fix-nextjs15` apply/restore. |
| `pnpm build:open-next-standalone` | Wrapper script `open-next-build.js`. |
| `pnpm build:sst-export` / `build:sst-standalone` | SST-specific export/standalone variants. |
| `pnpm build:production` | `dotenvx run -- node scripts/build-prod.js`. |

### 5.3 Deploy

Always set the AWS profile per project conventions (this project uses `AWS_PROFILE=stoked`; CLAUDE.md). Production deploy:

```bash
AWS_PROFILE=stoked senvn -f production npx sst deploy --stage production
pnpm deploy:prod   # ./scripts/aws-deploy.sh deploy (wraps the above)
pnpm refresh:prod  # senvn -f production sst refresh --stage production
pnpm unlock:prod   # release stuck SST lock
pnpm remove:prod   # ./scripts/aws-deploy.sh remove
```

### 5.4 Testing

```bash
pnpm test            # full Playwright e2e suite
pnpm test:smoke      # e2e/smoke-tests.spec.ts
pnpm test:mobile     # e2e/mobile/
pnpm test:visual     # e2e/visual-regression.spec.ts
pnpm test:visual:update   # refresh snapshots
pnpm test:ui|:headed|:debug|:report
```

There is **no unit test runner** (no Jest/Vitest). Correctness is validated end-to-end through Playwright and through `pnpm typescript` (runs `tsc -p tsconfig.json && tsc -p scripts/tsconfig.json`).

### 5.5 Utility Scripts (`scripts/`)

- `local-sync-cron.cjs` — local-only cron loop calling the sync endpoint.
- `list-db-info.ts`, `copy-db-schema.ts` — MongoDB introspection (`pnpm list-db-info`, `pnpm copy-db-schema`).
- `populate-github-activity{,-history}.js` — backfill scripts.
- `reportBrokenLinks.js` — `pnpm link-check`.
- `buildIcons.js`, `buildServiceWorker.js` — asset pipeline.
- `setupLogShipping.cjs` — `pnpm log:setup` (referenced by commit `afde04e`).
- `aws-deploy.sh` — single deploy entry point.

---

## 6. Environment Variables

Required by `createSite` (deploy aborts if any are missing):

```
NEXT_PUBLIC_WEB_URL
GITHUB_TOKEN
MONGODB_URI
MONGODB_USER
MONGODB_PASS
SST_STAGE
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
SYNC_SECRET
```

Additional resolved at deploy time: `GITHUB_USERNAME` (defaults `brian-stoker`), `MONGODB_NAME` (from `domainInfo.dbName`), `NEXTAUTH_URL` (`https://${domainInfo.domains[0]}`), `S3_BUCKET_NAME` (from `HalBucket`).

Cron-specific (in `stacks/cron.ts`): inherits `GITHUB_TOKEN`, `GITHUB_USERNAME`, `MONGODB_NAME`, `MONGODB_URI`, `SYNC_SECRET`, `SYNC_ENDPOINT`.

Local development reads `.env` / `.env.local` (declared as Turbo `globalDependencies`).

---

## 7. Entry Points & Critical Paths

### 7.1 Entry Points

| Type | Path |
|------|------|
| Infra root | `sst.config.ts` |
| Stack registry | `stacks/index.ts` (re-exports `site`, `domains`, `api`, `cron`, `bucket`) |
| Web app root | `pages/index.tsx` (renders `HomeView` with `BrandingCssVarsProvider`, `AppHeader`, `Section`, `AppFooter`) |
| App shell | `pages/_app.js`, `pages/_document.js` |
| Cron handler | `cron/github-sync.ts` → `handler` export |
| MongoDB clients | `pages/api/lib/mongodb.ts` (API), `lib/mongodb.ts` (cron/lib) |
| Auth | `pages/api/auth/[...nextauth].js` |
| Product catalog | `src/products.tsx` |
| Routes table | `src/route.ts` |

### 7.2 Critical Path A — GitHub Events Sync

1. **Trigger:** AWS EventBridge fires `GithubSyncCron` hourly (`stacks/cron.ts`).
2. **Handler:** `cron/github-sync.ts` invokes `syncGitHubEvents()` from `lib/github-sync.ts`.
3. **Fetch:** the sync function paginates GitHub Events API using `GITHUB_TOKEN` and `GITHUB_USERNAME`.
4. **Persist:** events upserted into MongoDB collection `github_events`; `sync_metadata` updated with cursor/timestamps.
5. **Local alternative:** `scripts/local-sync-cron.cjs` (started by `pnpm dev:cron`) calls `/api/github/sync-events` over HTTP, gated by `SYNC_SECRET`.

### 7.3 Critical Path B — Home Page Render

1. **Request** → Next.js Lambda (OpenNext) → `pages/index.tsx`.
2. `getAllBlogPosts()` from `lib/sourcing.ts` resolves MDX blog posts (`pages/home/*.mdx`).
3. `HomeView` mounts `BrandingCssVarsProvider`, `AppHeader`, `Hero` (`src/components/home/HeroMain.tsx`), product showcases via `src/products.tsx` + `ProductSwitcher`, and `GithubEventsShowcase` (which calls `/api/github/events`).
4. `AppFooter` rendered last; `NewsletterToast` mounted client-only.

### 7.4 Critical Path C — Pull Request Detail

1. UI: `src/components/PullRequest/PullRequestView.tsx` (+ `CommitsList`, `FileChanges`).
2. API: `pages/api/github/pull-request.ts`, `pull-request-files.ts`, `commit-files.ts` proxy GitHub.
3. Storage: events that reference PRs are sourced from `github_events` (synced in Path A).

### 7.5 Critical Path D — Auth

1. `pages/api/auth/[...nextauth].js` configures Google provider using `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` and signs sessions with `NEXTAUTH_SECRET`.
2. `NEXTAUTH_URL` is computed from the primary stage domain at deploy time (`stacks/site.ts`).

---

## 8. Directory Map (Top Level)

| Path | Purpose |
|------|---------|
| `pages/` | Next.js Pages Router routes (UI + API). |
| `pages/api/` | API routes: `github/` (sync, events, PRs, filters), `auth/[...nextauth].js`, `hal/logs.js`, `lib/mongodb.ts`. |
| `src/components/` | React components (`GithubEvents/`, `PullRequest/`, `home/*Showcase.tsx`, `header/`, `footer/`, etc.). |
| `src/layouts/` | `AppHeader`, `AppFooter`, `HeroContainer`, `Section`. |
| `src/modules/` | Shared modules (components, sandbox, utils, constants). |
| `src/products.tsx` | Product catalog driving home page showcases. |
| `src/route.ts` | Centralized route constants. |
| `stacks/` | SST infra: `site.ts`, `cron.ts`, `bucket.ts`, `domains.ts`, `api.ts`, `secrets.ts`, `envVars.ts`. |
| `cron/` | Lambda cron handler (`github-sync.ts`). |
| `lib/` | Shared server logic: `github-sync.ts`, `mongodb.ts`, `sourcing.ts` (MDX). |
| `hooks/` | Tiny shared hooks (`useEventListener`, `useWindowSize`). |
| `scripts/` | Build, deploy, and maintenance scripts. |
| `data/` | MDX/JSON content (`about/`, `styles/`, `pages.ts`, `file-explorer-component-api-pages.ts`). |
| `e2e/` | Playwright specs and snapshots. |
| `public/` | Static assets (images, fonts, resume PDF at `brian.stokd.cloud/brian-stoker-resume.pdf`). |
| `styles/` | Global stylesheets. |
| `translations/` | i18n strings. |
| `types/` | Ambient TypeScript declarations. |
| `utils/` | Generic utilities (`pickProperties` used in stacks). |
| `.stokd/meta/` | Stokd metadata (this overview, flows, views, recommendations, tests, config). |

---

## 9. Operational Notes & Conventions (from `CLAUDE.md`)

- Dev server port is **5040** (not 3000).
- All AWS CLI usage must include `--profile stoked`; deploys go through `senvn -f production`.
- Type checking is intentionally skipped during the SST build path (`build:sst`).
- Production DB: `brianstoker-production`; local DB: `brianstoker-local` (when `MONGODB_NAME` is not provided).
- No App Router — Pages Router only.
- pnpm 10.x is required (`packageManager` field). `onlyBuiltDependencies` whitelist gates native builds (`@parcel/watcher`, `aws-sdk`, `canvas`, `core-js`, `esbuild`, `sharp`).
- Recent commits show ongoing work on Atlas attribution (`af5fa04`), log shipping for a private monitoring backend (`afde04e`), and main-page GitHub events sizing fixes (`240184e`).
