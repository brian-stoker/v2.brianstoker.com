<!-- stokd-meta-version: 0.4.0 -->
# SC_OVERVIEW — brian-stokd-cloud

A comprehensive overview of the `v2.brianstoker.com` codebase (npm package name
`brian-stokd-cloud`, SST app name `brian-stokd-cloud`). This document is the
canonical entry point for understanding repository purpose, architecture,
dependencies, technology choices, the development workflow, and the critical
execution paths.

---

## 1. Repository Purpose

`brian-stokd-cloud` is the personal portfolio and product showcase site for
**Brian Stoker**, now served at **https://brian.stokd.cloud** (migrated from the
former `brianstoker.com` domain — see commit `f1bd28b`). It serves three primary
functions:

1. **Marketing surface** for a catalog of ~11 products defined in `src/products.tsx` (showcased via `ProductSwitcher` on the home page).
2. **Living activity feed** (`/work`) that displays GitHub events (commits, PRs, issues, projects) pulled hourly from the GitHub Events API and persisted to MongoDB Atlas. Page loads read **only** from MongoDB, never from GitHub directly.
3. **Static content surface** — resume (`pages/resume*.tsx`), photography, art, drums, blog (MDX in `pages/home/`), email subscription, and ancillary single-purpose pages.

It is effectively a **single Next.js application** with sidecar infrastructure
code (`stacks/`), a Lambda cron handler (`cron/`), a **dormant** standalone
Lambda package (`api/`, package name `@brian-stoker/api`), and content/script
directories. It is not a workspace monorepo — `pnpm-workspace.yaml` is absent and
the root `package.json` carries all primary dependencies.

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
│  CloudFront  ──►  API Gateway HTTP API  (workaround)    │
│                         │  (Function URLs broken in       │
│                         ▼   AWS acct 167217327520)        │
│  AWS Lambda (OpenNext)         AWS Lambda (SST Cron)    │
│  ├── pages/* SSR               └── cron/github-sync.ts  │
│  ├── pages/api/* routes              hourly schedule    │
│  └── NextAuth (Google OAuth)                            │
└───────────────────┬─────────────┬───────────────────────┘
                    │             │
        ┌───────────▼──┐     ┌────▼────────┐
        │  MongoDB     │     │  GitHub     │
        │  Atlas       │     │  Events API │
        │ brianstoker- │     └─────────────┘
        │  production  │
        └──────────────┘
```

### 2.2 Runtime Topology

| Layer | Mechanism | Source |
|-------|-----------|--------|
| Web app | `sst.aws.Nextjs` deployed via `@opennextjs/aws` | `stacks/site.ts` |
| Edge / origin routing | CloudFront → **API Gateway HTTP API** (manual workaround; see §2.5) | `stacks/apigateway.ts` (dormant), `scripts/update-cloudfront-origins.cjs` |
| Hourly cron | `sst.aws.Cron` → Lambda handler | `stacks/cron.ts`, `cron/github-sync.ts` |
| Object storage | `sst.aws.Bucket` named `HalBucket` | `stacks/bucket.ts` |
| Domain routing | Stage-based domain resolver | `stacks/domains.ts` |
| Persistence | MongoDB Atlas (DB name pinned via `MONGODB_NAME`) | `pages/api/lib/mongodb.ts`, `lib/mongodb.ts`, `api/lib/mongodb.ts` |
| Auth | NextAuth.js v4 + Google OAuth | `pages/api/auth/[...nextauth].js` |

### 2.3 Pages Router (not App Router)

This project uses the **Next.js Pages Router** (`pages/`) exclusively (repo axiom
`AX-REPO-PAGES-ROUTER-ONLY`). API routes live under `pages/api/`. There is no
`app/` directory. `_app.js` / `_document.js` (in `pages/`) are the global
wrappers.

### 2.4 SST Infrastructure (`stacks/`)

`sst.config.ts` orchestrates the deployment. SST app name is `brian-stokd-cloud`,
`home: "aws"`. Its `run()` function dynamically imports `./stacks` and wires
**only three** resources today:

- `getDomainInfo(ROOT_DOMAIN, stage)` → per-stage domain set, resource name, DB name (see `stacks/domains.ts`).
- `createHalBucket()` → S3 bucket exposed to the Next.js Lambda via `S3_BUCKET_NAME` env.
- `createSite(domainInfo, { S3_BUCKET_NAME })` → the Next.js site. Build command is `pnpx @opennextjs/aws@latest build`. Requires a strict env var set (see §6); throws on missing values. Grants `*:*` IAM permissions to the site Lambda and pins the server Lambda timeout to 30 s (headroom over slow Atlas M0 reads / the 30 s API Gateway ceiling).
- `createGithubSyncCron(siteUrl, dbName)` → `rate(1 hour)` cron whose handler is `cron/github-sync.handler`, with a 5-minute timeout. Calls `${siteUrl}/api/github/sync-events` via the shared `SYNC_SECRET`.

`createApi` (`stacks/api.ts`) and `createNextJsApiGateway` (`stacks/apigateway.ts`,
`stacks/authorizer.ts`) are exported from `stacks/index.ts` and imported in
`sst.config.ts`, but **are not invoked** — `apiGateway` is hard-coded to
`undefined` because `.apply()`-based resource creation triggers a Pulumi
`RangeError` during deploy. They are dormant until rewritten.

Per `stacks/domains.ts`:
- Production stage → `[ROOT_DOMAIN, www.ROOT_DOMAIN]`.
- Other stages → `[${stage}.ROOT_DOMAIN, *.${stage}.ROOT_DOMAIN]`.
- `dbName` is derived from the first domain’s segments minus the TLD, plus the stage (e.g. for `brian.stokd.cloud` + `production` → `brian-stokd-production`). **However, the runtime DB name is pinned by the `MONGODB_NAME` env override** (`MONGODB_NAME: env.MONGODB_NAME || domainInfo.dbName` in `stacks/site.ts`), which preserves the original Atlas database `brianstoker-production` across the domain migration. `$dev` swaps the domain list for `LOCAL_DOMAIN`.

### 2.5 API Gateway / Function URL Workaround

AWS account **167217327520** (the `stokd-cloud` account) has a broken Lambda
**Function URL** service, which OpenNext relies on by default. Production therefore
serves traffic through **manually managed API Gateway HTTP APIs** that are **not
part of the SST/Pulumi state** — `sst deploy` would otherwise revert them. After
each deploy, `scripts/aws-deploy.sh` runs
`scripts/update-cloudfront-origins.cjs` (under `AWS_PROFILE=stokd-cloud`) to
re-point the CloudFront origins at the API Gateway. The in-repo
`stacks/apigateway.ts` + `stacks/authorizer.ts` (CloudFront-secret-gated HTTP API)
encode the intended SST-native version of this workaround but remain disabled
(see §2.4). Background: `docs/API_GATEWAY_SETUP.md`.

---

## 3. Package Dependency Graph

This is effectively a **single-package** repository. Root `package.json` defines
all primary dependencies. The only secondary manifest is `api/package.json`
(`@brian-stoker/api`, dormant ApiGatewayV2 Lambda handlers). `turbo` runs only to
multiplex `dev:nextjs` and `dev:cron` concurrently (`turbo.json`).

### 3.1 Primary Production Dependencies (grouped)

- **Framework / runtime:** `next@15.3.0`, `react@18.3.1`, `react-dom@18.3.1`, `sst@3.9.7`, `open-next@^3.1.3`.
- **UI system:** `@mui/material@^5.18.0`, `@mui/icons-material@5.15.21`, `@mui/system`, `@mui/base@5.0.0-beta.70`, `@mui/styles`, `@mui/x-tree-view@^6.17.0`, `@stoked-ui/docs@0.1.7`.
- **CSS/styling:** `@emotion/{cache,react,styled}`, `styled-components`, `jss`, `tailwindcss` (devDep) via `tailwind.config.js`, `autoprefixer`, `postcss`.
- **Auth:** `next-auth@^4.24.13`.
- **Data:** `mongodb@^6.20.0` (native driver, no ORM), `@aws-sdk/client-s3@^3.910.0`.
- **Content:** `@mdx-js/react`, `@next/mdx`, `next-mdx-remote`, `mui-markdown`, `marked` (devDep), `gray-matter`, `feed`, `@stoked-ui/docs-markdown`.
- **Media:** `pdfjs-dist@4.8.69`, `react-pdf`, `plyr-react`, `react-activity-calendar`, `react-github-calendar`.
- **Misc UX:** `react-swipeable-views`, `react-multi-carousel`, `react-intersection-observer`, `nprogress`, `clipboard-copy`, `clsx`, `date-fns`, `lodash`, `lz-string`.

### 3.2 Dev / Tooling

- **Build:** `@opennextjs/aws@^3.8.4`, `@babel/*`, `babel-loader`, `@svgr/webpack`, `cross-env`, `dotenv`/`dotenvx`.
- **Testing:** `@playwright/test@^1.56.1` (e2e only — no unit test framework).
- **Static analysis:** `typescript@6.0.0-dev.20251014` (early 6.x preview), `knip@^5.65.0`.
- **Orchestration:** `turbo@^2.3.3`, `kill-port`, `tsx`.

### 3.3 Internal Module Dependencies

The application code is organized into these top-level source roots, with these relationships:

```
sst.config.ts ──► stacks/* ──► (AWS resources: site, bucket, cron)
                                  │
cron/github-sync.ts ──► lib/github-sync.ts ──► lib/mongodb.ts ──► MongoDB Atlas
                                                                       ▲
pages/api/github/sync-events.ts ──► lib/github-sync.ts ────────────────┤
pages/api/github/events.ts ──► pages/api/lib/mongodb.ts ───────────────┘
pages/api/github/{filters,pull-request*,commit-files,event/[id]}.ts ──► (Mongo + GitHub proxy)

pages/* (UI) ──► src/components/* ──► src/layouts/*, src/modules/*, src/products.tsx
                          │
                          ├── src/components/GithubEvents/* ──► /api/github/events
                          ├── src/components/PullRequest/* ──► /api/github/pull-request{,-files}
                          └── src/components/home/* (showcases) ──► src/products.tsx

api/{subscribe,sms}.ts ──► api/lib/mongodb.ts  (DORMANT — not deployed)
```

There are **three** near-duplicate MongoDB client modules, each tagged with a
distinct Atlas `appName` (repo axiom `AX-REPO-MONGO-ATLAS-APPNAME`):

| Module | `appName` | Consumers |
|--------|-----------|-----------|
| `pages/api/lib/mongodb.ts` | `brianstoker-pages-api` | Pages Router API handlers |
| `lib/mongodb.ts` | `brianstoker-site` | site SSR + cron sync logic |
| `api/lib/mongodb.ts` | `brianstoker-api` | dormant `api/` Lambda package |

All target the same Atlas cluster; a fix in one generally requires the same fix in
the others (local axiom `AX-MOD-V2BS-003`). Mongo-client tagging landed in commit
`af5fa04`.

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
| Cloud | AWS via SST 3.x; OpenNext for the Lambda bundle; CloudFront → API Gateway origin |
| AWS account | `stokd-cloud` profile, account `167217327520` |
| Tests | Playwright e2e (mobile, tablet, desktop viewports) |
| Package manager | pnpm 10.28.2 |

### 4.2 Recurring Patterns

- **Showcase pattern.** Each product in `src/products.tsx` provides a showcase component from `src/components/home/*Showcase.tsx` rendered through `src/components/ProductSwitcher.tsx`.
- **Per-stage configuration via domain inference.** `stacks/domains.ts` derives resource names, DB names, and domain lists from `ROOT_DOMAIN` + stage, so adding a stage is mostly a name-resolution exercise — but `MONGODB_NAME` is overridden to keep the Atlas DB name stable across renames.
- **Read-from-Mongo invariant.** `/work` and its read APIs serve GitHub events exclusively from MongoDB; the GitHub Events API is touched only by the sync path (local axiom `AX-MOD-V2BS-001`).
- **Secret-protected sync.** `/api/github/sync-events` is callable only with `Authorization: Bearer ${SYNC_SECRET}`, shared by the cron Lambda, `scripts/local-sync-cron.cjs`, and the endpoint (local axiom `AX-MOD-V2BS-002`, repo axiom `AX-REPO-SYNC-SECRET-CONTRACT`).
- **Trimmed events payload.** `pages/api/github/events.ts` projects out `payload.files` (`.project({ 'payload.files': 0 })`) so multi-MB file diffs never reach the client; client caches are keyed by `CACHE_VERSION` (`'5.0'`) in `src/utils/eventCacheManager.ts`, which must be bumped on any response-shape change (local axiom `AX-MOD-V2BS-004`). Payload trimming landed in commit `aea03b2`.
- **Mongo client singleton.** Each Mongo module caches the connect promise (`global._mongoClientPromise` in dev) to survive HMR.
- **Strict env validation at deploy time.** `createSite` (and the dormant `createApi`) abort deployment when any required env var is missing, rather than failing at runtime (repo axiom `AX-REPO-DEPLOY-ENV-VALIDATION`).
- **CDN-hosted media.** Large assets (resume PDF, drum videos, etc.) load from `https://cdn.stokd.cloud/brian.stokd.cloud/...` (constant `route.CDN` in `src/route.ts`); the resume PDF moved to the CDN in commit `37a0da7`.
- **Asset content-type/cache overrides.** `stacks/site.ts` explicitly sets `Cache-Control` and `Content-Type` for media (mp4/webm/mov/mp3/m4a) and immutable static assets; HTML is `no-store`.

### 4.3 Notable Build Quirks

- `NEXT_SKIP_TYPECHECKING=1` is used in `build:next15` for speed.
- `--max_old_space_size=8192` for all Next builds (memory-heavy MUI/MDX).
- ESLint ignored during Next.js builds (per CLAUDE.md).
- Images are unoptimized (Next image optimization disabled).
- Standalone output mode for Lambda packaging.
- Tailwind preflight disabled (MUI’s `CssBaseline` is the reset).
- `SST_ESBUILD_CONFIG_TRANSFORMER = "addExternals"` is set in `sst.config.ts` to inject externals into SST’s esbuild step.

---

## 5. Development Workflow & Build System

### 5.1 Local Development

```bash
pnpm dev          # turbo watch: starts dev:nextjs + dev:cron concurrently
pnpm dev:nextjs   # Next dev server (Turbopack) on port 5040 — kills 5040 first
pnpm dev:cron     # local cron driver: scripts/local-sync-cron.cjs (sleep 10s then run)
```

`pnpm dev` runs `clean:cache` first (`rimraf .next .open-next`) and uses Turbo’s
`tui` UI to multiplex the two persistent tasks defined in `turbo.json`. Env is
loaded via `dotenvx run`. Dev server runs on **port 5040** (repo axiom
`AX-REPO-DEV-PORT-5040`).

### 5.2 Build Variants

| Script | Purpose |
|--------|--------|
| `pnpm build` | Standard Next build with `--profile` and 8 GB heap. |
| `pnpm build:sst` | `next build --no-lint` — used by SST deploy. |
| `pnpm build:next15` | Skips typechecking and prop serialization for speed. |
| `pnpm build:open-next` | OpenNext 2.2.3 build wrapped in `fix:nextjs15` apply/restore. |
| `pnpm build:open-next-standalone` | Wrapper script `open-next-build.js`. |
| `pnpm build:sst-export` / `build:sst-standalone` | SST-specific export/standalone variants. |
| `pnpm build:production` | `dotenvx run -- node scripts/build-prod.js`. |
| `pnpm build:static` | `node next-export.js` (static export). |

### 5.3 Deploy

Production deploys go through the single ingress `scripts/aws-deploy.sh` (repo
axiom `AX-REPO-DEPLOY-SINGLE-INGRESS`). It uses `senvn -f production` (which loads
`.deploy.json` and verifies the target AWS account) for the SST step, then runs
two post-deploy CJS scripts under `AWS_PROFILE=stokd-cloud`:

```bash
pnpm deploy:prod   # ./scripts/aws-deploy.sh deploy →
                   #   1. senvn -f production npx sst deploy --stage production
                   #   2. AWS_PROFILE=stokd-cloud node scripts/update-cloudfront-origins.cjs
                   #   3. AWS_PROFILE=stokd-cloud node scripts/setupLogShipping.cjs (non-fatal)
pnpm remove:prod   # ./scripts/aws-deploy.sh remove → senvn -f production npx sst remove
pnpm refresh:prod  # senvn -f production sst refresh --stage production
pnpm unlock:prod   # release a stuck SST lock
pnpm log:setup     # node scripts/setupLogShipping.cjs (ship logs to private monitoring backend)
```

> AWS profile note: all AWS operations target the **`stokd-cloud`** profile
> (account `167217327520`). The SST deploy itself derives credentials through
> `senvn`/`.deploy.json`; the post-deploy CloudFront-origin repoint and
> log-shipping steps export `AWS_PROFILE=stokd-cloud` explicitly. The
> CloudFront-origin repoint is required because Lambda Function URLs are broken in
> this account (see §2.5); a plain `sst deploy` without it leaves CloudFront
> pointing at dead origins.

### 5.4 Testing

```bash
pnpm test            # full Playwright e2e suite
pnpm test:smoke      # smoke-tests.spec.ts
pnpm test:mobile     # e2e/mobile/
pnpm test:visual     # visual-regression.spec.ts
pnpm test:visual:update   # refresh snapshots
pnpm test:ui|:headed|:debug|:report
```

There is **no unit test runner** (no Jest/Vitest — repo axiom
`AX-REPO-CORRECTNESS-VIA-TYPESCRIPT-AND-PLAYWRIGHT`). Correctness is validated
end-to-end through Playwright and through `pnpm typescript` (runs
`tsc -p tsconfig.json && tsc -p scripts/tsconfig.json`).

### 5.5 Utility Scripts (`scripts/`)

- `local-sync-cron.cjs` — local-only cron loop calling the sync endpoint with the `SYNC_SECRET` bearer.
- `aws-deploy.sh` — single production deploy/remove entry point.
- `update-cloudfront-origins.cjs` — repoints CloudFront origins at API Gateway after deploy (Function URL workaround).
- `setupLogShipping.cjs` — `pnpm log:setup`; ships logs to a private monitoring backend (commit `afde04e`).
- `list-db-info.ts`, `copy-db-schema.ts` — MongoDB introspection (`pnpm list-db-info`, `pnpm copy-db-schema`).
- `populate-github-activity{,-history}.js` — backfill scripts; sole sanctioned writers of `s3://cenv-public/brian-stoker-github-activity.json` (repo axiom `AX-REPO-CENV-PUBLIC-NO-SECRETS`).
- `reportBrokenLinks.js` — `pnpm link-check`.
- `buildIcons.js`, `buildServiceWorker.js` — asset pipeline (`pnpm icons`, `pnpm build-sw`).

---

## 6. Environment Variables

Required by `createSite` — deploy synth aborts if any are missing (repo axiom
`AX-REPO-DEPLOY-ENV-VALIDATION`, local axiom `AX-MOD-V2BS-005`):

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

Additional values resolved at deploy time in `stacks/site.ts`:
`GITHUB_USERNAME` (defaults `brian-stoker`), `MONGODB_NAME`
(`env.MONGODB_NAME || domainInfo.dbName` — pinned to `brianstoker-production` in
prod), `NEXTAUTH_URL` (`https://${domainInfo.domains[0]}`), `S3_BUCKET_NAME`
(from `HalBucket`).

Cron-specific (in `stacks/cron.ts`): `GITHUB_TOKEN`, `GITHUB_USERNAME`,
`MONGODB_NAME`, `MONGODB_URI`, `SYNC_SECRET`, `SYNC_ENDPOINT`.

The dormant `createApi` (`stacks/api.ts`) additionally expects
`MONGODB_QUERY_PARAMS`, `NEXT_PUBLIC_NEXT_API`, and `COINBASE_COMMERCE_API_KEY`.

`ROOT_DOMAIN` is required by `sst.config.ts` itself (throws at import if unset).
Local development reads `.env` / `.env.local` (declared as Turbo
`globalDependencies`).

---

## 7. Entry Points & Critical Paths

### 7.1 Entry Points

| Type | Path |
|------|------|
| Infra root | `sst.config.ts` (app name `brian-stokd-cloud`) |
| Stack registry | `stacks/index.ts` (re-exports `site`, `domains`, `api`, `cron`, `bucket`, `apigateway`, `authorizer`) |
| Web app root | `pages/index.tsx` (`getStaticProps` → `HomeView` with `BrandingCssVarsProvider`, `AppHeader`, `Section`, `AppFooter`) |
| App shell | `pages/_app.js`, `pages/_document.js` |
| Cron handler | `cron/github-sync.ts` → `handler` export |
| MongoDB clients | `pages/api/lib/mongodb.ts`, `lib/mongodb.ts`, `api/lib/mongodb.ts` |
| Auth | `pages/api/auth/[...nextauth].js` |
| Product catalog | `src/products.tsx` |
| Routes table / CDN constant | `src/route.ts` |

Notable top-level pages: `index.tsx`, `work.tsx`, `resume.tsx`, `resume-new.tsx`,
`resume-scale.tsx`, `art.tsx`, `photography.tsx`, `drums.tsx`, `components.tsx`,
`bstoked.plan.tsx`, `subscription.tsx`, `hal.js`, `404.tsx`, plus MDX blog under
`pages/home/`.

### 7.2 Critical Path A — GitHub Events Sync

1. **Trigger:** AWS EventBridge fires `GithubSyncCron` hourly (`stacks/cron.ts`).
2. **Handler:** `cron/github-sync.ts` POSTs to `${SYNC_ENDPOINT}` with the `SYNC_SECRET` bearer, which invokes `syncGitHubEvents()` from `lib/github-sync.ts`.
3. **Fetch:** the sync function paginates the GitHub Events API using `GITHUB_TOKEN`/`GITHUB_USERNAME`, capped at `maxPages = 7`. Guard strings `'GitHub token not configured'` and `'Database not available'` are observable behavior (local axiom `AX-MOD-V2BS-007`).
4. **Persist:** events upserted into MongoDB collection `github_events`; `sync_metadata` updated with cursor/timestamps.
5. **Local alternative:** `scripts/local-sync-cron.cjs` (started by `pnpm dev:cron`) calls `/api/github/sync-events` over HTTP, gated by `SYNC_SECRET`.

### 7.3 Critical Path B — Home Page Render

1. **Request** → CloudFront → API Gateway → Next.js Lambda (OpenNext) → `pages/index.tsx`.
2. `getStaticProps` calls `getAllBlogPosts()` from `lib/sourcing.ts` to resolve MDX blog posts and most-recent posts.
3. `HomeView` mounts `BrandingCssVarsProvider`, `AppHeaderBanner`, `AppHeader`, `Hero` (`src/components/home/HeroMain.tsx`), the main content (`src/components/Main`), product showcases via `src/products.tsx` + `ProductSwitcher`, and a client-only `NewsletterToast`.
4. `AppFooter` rendered last.

### 7.4 Critical Path C — Work Feed & Pull Request Detail

1. UI: `pages/work.tsx` → `src/components/GithubEvents/*` calls `/api/github/events` (Mongo-only, payload trimmed, client-cached by `CACHE_VERSION`).
2. PR detail: `src/components/PullRequest/PullRequestView.tsx` (+ `CommitsList`, `FileChanges`) calls `/api/github/pull-request.ts`, `pull-request/[number].ts`, `pull-request-files.ts`, `commit-files.ts`, and `event/[id].ts`, which proxy GitHub on demand.
3. Storage: events that reference PRs originate from `github_events` (synced in Path A).

### 7.5 Critical Path D — Auth (`/hal`)

1. `/hal` (`pages/hal.js` + `pages/api/hal/logs.js`) is the **only** auth-gated surface (local axiom `AX-MOD-V2BS-006`, repo axiom `AX-REPO-SINGLE-TENANT`).
2. `pages/api/auth/[...nextauth].js` configures the Google provider with `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, signs sessions with `NEXTAUTH_SECRET`, and allow-lists exactly two identities (`brianstoker@gmail.com`, `brian@stokd.cloud`).
3. `NEXTAUTH_URL` is computed from the primary stage domain at deploy time (`stacks/site.ts`).

### 7.6 Critical Path E — Deploy & Origin Repoint

1. `pnpm deploy:prod` → `scripts/aws-deploy.sh deploy`.
2. `senvn -f production npx sst deploy --stage production` builds via OpenNext and updates the Next.js + cron Lambdas and S3/CloudFront.
3. `scripts/update-cloudfront-origins.cjs` repoints CloudFront origins at the manual API Gateway (Function URL workaround, §2.5).
4. `scripts/setupLogShipping.cjs` wires log shipping to the private monitoring backend (non-fatal on failure).

---

## 8. Directory Map (Top Level)

| Path | Purpose |
|------|---------|
| `pages/` | Next.js Pages Router routes (UI + API). |
| `pages/api/` | API routes: `github/` (sync, events, filters, PRs, `event/[id]`), `auth/[...nextauth].js`, `hal/logs.js`, `lib/mongodb.ts`. |
| `src/components/` | React components (`GithubEvents/`, `PullRequest/`, `home/*Showcase.tsx`, `header/`, `banner/`, `footer/`, etc.). |
| `src/layouts/` | `AppHeader`, `AppFooter`, `HeroContainer`, `Section`. |
| `src/modules/` | Shared modules (components, sandbox, utils, constants). |
| `src/products.tsx` | Product catalog driving home page showcases. |
| `src/route.ts` | Centralized route + CDN constants. |
| `src/utils/` | Client caching (`eventCacheManager.ts`, `eventCachePruning.ts`) and helpers. |
| `stacks/` | SST infra: `site.ts`, `cron.ts`, `bucket.ts`, `domains.ts`, `api.ts` (dormant), `apigateway.ts`/`authorizer.ts`/`authorizer-handler.ts` (dormant), `secrets.ts`, `envVars.ts`, `index.ts`. |
| `cron/` | Lambda cron handler (`github-sync.ts`). |
| `lib/` | Shared server logic: `github-sync.ts`, `mongodb.ts`, `sourcing.ts` (MDX). |
| `api/` | **Dormant** standalone Lambda package `@brian-stoker/api` (`subscribe.ts`, `sms.ts`, `lib/mongodb.ts`). Not deployed. |
| `hooks/` | Tiny shared hooks (`useEventListener`, `useWindowSize`). |
| `scripts/` | Build, deploy, sync, and maintenance scripts. |
| `data/` | MDX/JSON content (`about/`, `styles/`, `pages.ts`, etc.). |
| `docs/` | Operator docs (`API_GATEWAY_SETUP.md`, `GITHUB_DEPLOYMENT_SETUP.md`, `PRE_DEPLOYMENT_CHECKLIST.md`, strategy notes). |
| `projects/` | Scratch/sub-project workspace (e.g. `build-nestjs-nwc-api-for-lightning-address`). |
| `mui-vale/`, `styles/` | Styling assets and global stylesheets. |
| `e2e/` | Playwright specs and committed visual snapshots. |
| `public/` | Static assets (icons, fonts). Large media is served from `cdn.stokd.cloud`. |
| `translations/` | i18n strings. |
| `types/`, `utils/` | Ambient TS declarations; generic utilities (`pickProperties` used in stacks). |
| `.stokd/meta/` | Stokd metadata (this overview, axioms, flows, views, recommendations, tests, config). |

---

## 9. Operational Notes & Conventions

- Dev server port is **5040** (not 3000).
- AWS operations target the **`stokd-cloud`** profile / account `167217327520`; production deploys go through `senvn -f production` + `scripts/aws-deploy.sh`. Ambient/default AWS credentials are forbidden (repo axiom `AX-REPO-AWS-PROFILE-DISCIPLINE`).
- Lambda **Function URLs are broken** in this AWS account; production serves via manually managed API Gateways that are **not** in SST state, and `sst deploy` would revert the CloudFront origin change — always follow a deploy with `update-cloudfront-origins.cjs` (handled by `aws-deploy.sh`).
- The Atlas DB name is pinned to `brianstoker-production` (prod) / `brianstoker-local` (dev) via `MONGODB_NAME`, independent of the `brian.stokd.cloud` domain rename.
- Type checking is intentionally skipped during the SST build path (`build:sst`); correctness is enforced by `pnpm typescript` + Playwright.
- No App Router — Pages Router only.
- Git safety: never `git stash`, switch branches, `git reset --hard`, or `git restore .` in this worktree; use `git worktree add` (repo axiom `AX-REPO-NO-GIT-STASH-OR-CHECKOUT`).
- pnpm 10.x is required (`packageManager: pnpm@10.28.2`). `onlyBuiltDependencies` whitelist gates native builds (`@parcel/watcher`, `aws-sdk`, `canvas`, `core-js`, `esbuild`, `sharp`).
- Recent direction (git log): API Gateway prod serving + GitHub events payload trim (`aea03b2`), resume PDF moved to `cdn.stokd.cloud` (`37a0da7`), AWS-account + domain migration to `stokd-cloud` / `brian.stokd.cloud` (`f1bd28b`), Mongo Atlas attribution tags (`af5fa04`), and log shipping to a private monitoring backend (`afde04e`).
