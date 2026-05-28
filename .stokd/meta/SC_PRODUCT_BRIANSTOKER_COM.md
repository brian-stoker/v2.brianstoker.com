<!-- stokd-meta-version: 0.4.0 -->
# SC_PRODUCT — brianstoker-com

Product classification document for the `v2.brianstoker.com` repository.
Generated: 2026-05-26

---

## Product Identity

- **Product name:** `brianstoker-com`
- **Repository:** `v2.brianstoker.com` (single-package Next.js app with sidecar SST infra)
- **Public URL:** https://brianstoker.com (stage `production`); per-stage subdomains via `stacks/domains.ts`
- **Constituent packages:**
  - `api/` — standalone Lambda handler package (`@brian-stoker/api`); dormant subscribe/verify/sms handlers fronted by `sst.aws.ApiGatewayV2`. See `.stokd/meta/api/SC_MODULE.md`.
  - `scripts/` — out-of-band ops module: build wrappers, deploy drivers, GitHub backfill jobs, Mongo schema mirroring. See `.stokd/meta/scripts/SC_MODULE.md`.

The rest of the repo (`pages/`, `src/`, `cron/`, `lib/`, `stacks/`, `data/`, `public/`, `e2e/`) is the Next.js application that hosts the product surface; the two named constituent packages are nested sub-packages with their own `package.json`/`tsconfig`.

---

## Description

`brianstoker-com` is the personal portfolio and product showcase site for Brian Stoker. It solves three intertwined problems for a single owner-operator:

1. **Catalog & cross-link the operator's offerings.** A ~11-product catalog (`src/products.tsx`) is presented through `ProductSwitcher` on the home page, with each entry drilling into a dedicated page (Work, Resume, Art, Photography, Drums, .plan blog, Components index, etc.).
2. **Surface the operator's open-source activity as a living credential.** Hourly cron syncs the GitHub Events API into MongoDB Atlas; the site reads from Mongo (never directly from GitHub in the request path) and renders an activity calendar, filterable event list, and PR/commit detail panes.
3. **Distribute static content under one identity.** Resume PDF, photography, art, drum performance videos, MDX blog (`pages/home/*.mdx`), RSS feed, and an admin-only HAL log viewer all live behind the same shell (`AppHeader` / `AppFooter`), so the operator has one canonical web presence rather than a sprawl of point sites.

Although the catalog showcases products, those products are not separate SC_PRODUCT entries — they are content/surfaces inside this single product. There is one product because there is one user-facing offering ("brianstoker.com") served through one Next.js app to one audience.

---

## Target Audience

- **Primary:** Prospective collaborators, recruiters, and clients evaluating Brian Stoker — they enter at `/`, scan the catalog, and drill into Resume (Flow 4) or Work / GitHub activity (Flow 2).
- **Secondary:** Followers of the operator's creative output — visit `/art`, `/photography`, `/drums`, or the `.plan` blog directly.
- **Tertiary:** Newsletter subscribers (Flow 10 / Flow 11) interested in long-form updates.
- **Operator / admin (single user):** Brian Stoker, who uses `/hal` (Google-OAuth gated, Flow 12) to inspect shipped logs from the private monitoring backend.
- **System actor:** AWS EventBridge, which fires the hourly GitHub sync cron (Flow 13). No human is in that loop.

There is no multi-tenant model. All authenticated functionality is for a single admin identity, gated by NextAuth + Google OAuth in `pages/api/auth/[...nextauth].js`.

---

## Entry Points / Surfaces

### Web routes (Next.js Pages Router, OpenNext Lambda)

| Route | Page file | Purpose |
|-------|-----------|---------|
| `/` | `pages/index.tsx` | Home — portfolio showcase, `ProductSwitcher` carousel, `NewsletterToast` |
| `/work` | `pages/work.tsx` | `GithubCalendar` + `GithubEvents` filterable feed |
| `/resume`, `/resume-new`, `/resume-scale` | `pages/resume*.tsx` | PDF resume viewer (`react-pdf`) |
| `/photography` | `pages/photography.tsx` | Masonry grid + `LightboxGallery` |
| `/art` | `pages/art.tsx` | Masonry grid + `LightboxGallery` |
| `/drums` | `pages/drums.tsx` | `VideoGallery` (Plyr) |
| `/bstoked.plan`, `/.plan`, `/.plan/[slug]` | `pages/bstoked.plan.tsx`, `pages/.plan/*` | Blog index and post |
| `/subscription` | `pages/subscription.tsx` | Newsletter verification landing (reads `?code=`) |
| `/hal` | `pages/hal.js` | Admin log viewer (NextAuth gated) |
| `/components` | `pages/components.tsx` | Components listing / dev surface |
| `*` | `pages/404.tsx` | 404 recovery |

### Pages API routes (same OpenNext Lambda)

| Route | Handler | Purpose |
|-------|---------|---------|
| `POST /api/github/sync-events` | `pages/api/github/sync-events.ts` | Bearer-auth (`SYNC_SECRET`) sync ingress; called by EventBridge cron and local cron driver |
| `GET /api/github/events` | `pages/api/github/events.ts` | Paginated/filtered events |
| `GET /api/github/event/[id]` | `pages/api/github/event/[id].ts` | Single event lookup |
| `GET /api/github/filters` | `pages/api/github/filters.ts` | Repo + action option lists for filter bar |
| `GET /api/github/pull-request`, `/api/github/pull-request/[number]` | `pages/api/github/pull-request*.ts` | PR detail |
| `GET /api/github/pull-request-files` | `pages/api/github/pull-request-files.ts` | PR file diffs |
| `GET /api/github/commit-files` | `pages/api/github/commit-files.ts` | Per-commit file lists |
| `GET/POST /api/auth/[...nextauth]` | `pages/api/auth/[...nextauth].js` | NextAuth + Google OAuth |
| `GET /api/hal/logs` | `pages/api/hal/logs.js` | Admin log feed (reads Mongo / S3 `HalBucket`) |

### Scheduled / system entry points

- **`GithubSyncCron`** — `sst.aws.Cron` with schedule `rate(1 hour)`, handler `cron/github-sync.handler` (`stacks/cron.ts`, `cron/github-sync.ts`). Calls `${SITE_URL}/api/github/sync-events` with `SYNC_SECRET`.

### Dormant Lambda surfaces (constituent `api/` package)

When re-enabled in `stacks/api.ts`, the following would expose additional product entry points behind `sst.aws.ApiGatewayV2`:

- `POST /subscribe` → `api/subscribe.ts:50` — newsletter intake, SES verification email.
- `GET /verify?token&email` → `api/subscribe.ts:141` — token verification, 301-redirect to `/subscription?code=*`.
- `POST /sms` → `api/sms.ts:5` — SNS SMS dispatch.

These wire-ups are currently commented out in `stacks/api.ts:52-101`; the handlers compile and deploy but no public route invokes them.

### Operator entry points (no public URL)

- `pnpm dev`, `pnpm dev:cron`, `pnpm sync-cron` — local dev + sync (Flow 14).
- `pnpm deploy:prod`, `pnpm refresh:prod`, `pnpm unlock:prod`, `pnpm remove:prod` — production deploy lifecycle (Flow 15).
- `pnpm icons`, `pnpm build-sw`, `pnpm link-check`, `pnpm list-db-info`, `pnpm copy-db-schema`, `pnpm populate:github*` — content/data ops (see `scripts/` module doc).

---

## Flows

This product supports every flow defined in `.stokd/meta/SC_FLOWS.md` — that document is scoped to this single product. Numbering follows the SC_FLOWS index:

| Flow | Name | Surface |
|------|------|---------|
| 1 | Product Discovery (Home Showcase) | `/` |
| 2 | Browse GitHub Activity | `/work`, home Work showcase |
| 3 | Inspect Pull Request Detail | `PullRequestView` inside Flows 1/2 |
| 4 | Read Resume (PDF) | `/resume`, `/resume-new`, `/resume-scale` |
| 5 | Browse Photography Gallery | `/photography` |
| 6 | Browse Art Gallery | `/art` |
| 7 | Watch Drum Videos | `/drums` |
| 8 | Browse Blog Index | `/bstoked.plan`, `/.plan` |
| 9 | Read Blog Post | `/.plan/[slug]` |
| 10 | Newsletter Subscribe | `EmailSubscribe` footer + `NewsletterToast` |
| 11 | Verify Newsletter Email | `/subscription?code=…` |
| 12 | View HAL Logs (Admin) | `/hal` (NextAuth gated) |
| 13 | Hourly GitHub Event Sync | EventBridge → `cron/github-sync.ts` |
| 14 | Local GitHub Event Sync (dev) | `scripts/local-sync-cron.cjs` |
| 15 | Production Deploy | `scripts/aws-deploy.sh` |
| 16 | Browse Components Index | `/components` |
| 17 | 404 Recovery | unrouted URL → `pages/404.tsx` |

Flow 10/11 will be materially affected when `api/subscribe.ts` is re-enabled — today the subscribe POST target is an external/legacy backend and `/subscription` only renders the result code.

---

## Modules

This product is supported by two constituent module docs plus the in-app code that lives outside any named module:

### `.stokd/meta/api/SC_MODULE.md` — `api/` package

Standalone Lambda handlers for non-Next.js HTTP entry points: newsletter subscribe/verify (`api/subscribe.ts`) and SMS dispatch (`api/sms.ts`). Owns its own MongoDB client (`api/lib/mongodb.ts`, `appName: brianstoker-api`) and depends on SES (`us-east-1`) + SNS. Contributes to **Flow 10** and **Flow 11** when wired; currently dormant (`stacks/api.ts` route bindings commented out at lines 52-101). Its presence in the deployment is forward-looking infrastructure for the newsletter and notification surfaces of this product.

### `.stokd/meta/scripts/SC_MODULE.md` — `scripts/` package

Out-of-band ops: build pipeline glue (`build-prod.js`, `buildIcons.js`, `buildServiceWorker.js`, `fix-next-lambda.cjs`), deployment drivers (`aws-deploy.sh`, `setupLogShipping.cjs`, `configure-github-secrets.sh`), GitHub activity backfill (`populate-github-activity{,-history}.js`), local cron driver (`local-sync-cron.cjs`), Mongo introspection (`list-db-info.ts`, `copy-db-schema.ts`), broken-link checker (`reportBrokenLinks.js`), and RSS generation (`generateRSSFeed.ts`). Contributes to **Flow 14** (local sync), **Flow 15** (deploy), and materially shapes the data behind **Flows 2, 8, 9** (events feed, PWA icons, RSS).

### In-app code (not a separately documented module)

`pages/`, `src/`, `cron/`, `lib/`, `stacks/`, `data/`, `public/`, `e2e/` are the Next.js application that hosts Flows 1–13, 16, 17. The repo's `SC_OVERVIEW.md`, `SC_VIEWS.md`, `SC_FLOWS.md`, and `SC_TEST.md` cover these directly; no per-directory module doc exists today because the app is intentionally a single deployment unit.

---

## Operational Boundaries

### Integrations

| System | Direction | Used by | Purpose |
|--------|-----------|---------|---------|
| **GitHub REST Events API** | outbound | `lib/github-sync.ts` via `cron/github-sync.ts` and `pages/api/github/sync-events.ts` | Hourly event ingest (`GITHUB_TOKEN`, `GITHUB_USERNAME`) |
| **GitHub REST/GraphQL** | outbound | `pages/api/github/pull-request*`, `commit-files`, `scripts/populate-github-activity-history.js` | PR + contribution detail |
| **MongoDB Atlas** | bidirectional | `pages/api/lib/mongodb.ts` (tagged `brianstoker-pages-api`), `lib/mongodb.ts` (cron), `api/lib/mongodb.ts` (tagged `brianstoker-api`) | Persisted `github_events`, `sync_metadata`, `github_rate_limits`, `subscribers`, and HAL log records. Per-stage DB names (`brianstoker-production`, `brianstoker-local`) derived in `stacks/domains.ts`. |
| **Google OAuth (NextAuth)** | outbound | `pages/api/auth/[...nextauth].js` | Admin sign-in for `/hal` |
| **AWS SES (`us-east-1`)** | outbound | `api/subscribe.ts` (dormant) | Verification emails from `no-reply@${ROOT_DOMAIN}` |
| **AWS SNS (`us-east-1`)** | outbound | `api/sms.ts` (dormant) | SMS dispatch |
| **AWS S3 — `HalBucket`** | bidirectional | `stacks/bucket.ts`, `pages/api/hal/logs.js`, `scripts/setupLogShipping.cjs` | Ships `~/.openclaw/logs/{gateway,gateway.err}.log` to `logs.txt`/`errors.txt` for `/hal` to read |
| **AWS S3 — `cenv-public`** | outbound | `scripts/populate-github-activity{,-history}.js` | Public JSON contribution heatmap (`brian-stoker-github-activity.json`) |
| **AWS EventBridge** | inbound | `stacks/cron.ts` → `cron/github-sync.handler` | Hourly schedule (`rate(1 hour)`) |
| **AWS Lambda (OpenNext) + ApiGatewayV2** | inbound | `stacks/site.ts`, `stacks/api.ts` | Site + (dormant) standalone API |

### Runtime constraints

- **AWS account discipline.** All deploys must run under `AWS_PROFILE=stoked` via `senvn -f production`; `scripts/aws-deploy.sh` is the only sanctioned ingress. Per global rules, the default AWS profile may point at a customer account and must never be used here.
- **Dev port is `5040`** (not 3000). `pnpm dev:nextjs` kills the port before starting.
- **`SYNC_SECRET` is the only auth for the sync endpoint.** Both the EventBridge cron and `scripts/local-sync-cron.cjs` must share the same secret as `pages/api/github/sync-events.ts`; rotating one without the other breaks Flow 13/14.
- **Cron Lambda timeout: 5 minutes.** Set in `stacks/cron.ts`. GitHub paginated sync must finish inside this budget.
- **Site Lambda IAM: `*:*`.** `stacks/site.ts` grants wildcard permissions to the Next.js Lambda — any new AWS-side functionality is technically reachable, but new direct AWS calls from the request path should still be reviewed.
- **Strict env validation at deploy.** `createSite` aborts deploy when any of `NEXT_PUBLIC_WEB_URL`, `GITHUB_TOKEN`, `MONGODB_URI`, `MONGODB_USER`, `MONGODB_PASS`, `SST_STAGE`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SYNC_SECRET` is missing.
- **Single audience, single tenant.** All Mongo collections are unscoped by user; there is no multi-tenant partitioning.
- **No App Router.** Pages Router only; routes must follow `pages/` conventions and `_app.js`/`_document.js` wrappers.
- **No unit test runner.** Correctness is enforced via `pnpm typescript` (root + `scripts/` tsconfigs) and Playwright e2e (`pnpm test`, `pnpm test:smoke`, `pnpm test:mobile`, `pnpm test:visual`).
- **`cenv-public` is public.** `scripts/populate-github-activity*.js` writes to a bucket owned outside this app — never reuse it for sensitive data.

### Data stores summary

| Store | Owner | Contents |
|-------|-------|----------|
| MongoDB Atlas — `brianstoker-{stage}` | this product | `github_events`, `sync_metadata`, `github_rate_limits`, `subscribers` (when `api/` re-enabled), HAL log records |
| S3 — `HalBucket` (SST-managed) | this product | Shipped operator logs |
| S3 — `cenv-public` | external (public) | Legacy contribution heatmap JSON |
| Filesystem — `public/static/` | this product | Resume PDF, art, photography, drum videos, PWA icons, RSS feed |
| Filesystem — `pages/home/*.mdx` | this product | Blog post source |

---

## Product Axioms

- **AX-PROD-BRIANSTOKER-COM-001:** All user-facing dynamic data (GitHub events, PRs, commits) MUST be served from MongoDB; the request path MUST NOT call the GitHub API directly.
- **AX-PROD-BRIANSTOKER-COM-002:** The hourly GitHub sync (Flow 13) and the local sync driver (Flow 14) MUST share the same `SYNC_SECRET` bearer-token contract with `pages/api/github/sync-events.ts`; changing either side requires changing the other in the same task.
- **AX-PROD-BRIANSTOKER-COM-003:** This product is a single-tenant, single-operator site; no flow may introduce multi-tenant data partitioning or per-user data scoping without a governed project.
- **AX-PROD-BRIANSTOKER-COM-004:** Production deploys MUST run under `AWS_PROFILE=stoked` via `scripts/aws-deploy.sh` (which wraps `senvn -f production npx sst deploy --stage production`); ambient AWS credentials are forbidden.
- **AX-PROD-BRIANSTOKER-COM-005:** Per-stage MongoDB database names MUST be derived by `stacks/domains.ts` from `ROOT_DOMAIN` + stage; handlers and scripts must not hard-code DB names except for the documented `brianstoker-production` → `brianstoker-local` schema-mirror flow in `scripts/copy-db-schema.ts`.
- **AX-PROD-BRIANSTOKER-COM-006:** Only `/hal` requires authentication; all other end-user flows MUST remain anonymous-accessible and MUST NOT regress to gated state without a governed task.
- **AX-PROD-BRIANSTOKER-COM-007:** New end-user routes MUST use the Next.js Pages Router under `pages/`; the App Router is not in use and must not be introduced ad hoc.
- **AX-PROD-BRIANSTOKER-COM-008:** The deploy abort-on-missing-env contract in `stacks/site.ts` MUST be preserved — adding a required runtime env var means adding it to that validation set, not silently defaulting at runtime.
- **AX-PROD-BRIANSTOKER-COM-009:** Re-enabling the dormant `api/` routes (`subscribe`, `verify`, `sms`) is a governed task: it MUST include verification of SES domain identity, SNS spend caps, and updated CORS origin allowlists in `stacks/api.ts` before deploy.
- **AX-PROD-BRIANSTOKER-COM-010:** User-facing flows for this product must not regress without a governed task; correctness is enforced through `pnpm typescript` + Playwright e2e since there is no unit test harness.
