<!-- stokd-meta-version: 0.4.0 -->
# SC_RECOMMENDATIONS — brianstoker-com

Actionable recommendations for the `v2.brianstoker.com` codebase, grouped by category. Each item references the actual file paths it applies to so changes can be made directly. Items are ordered roughly by impact within each section.

This document is **prescriptive, not exhaustive** — it focuses on issues whose remediation would noticeably improve correctness, maintainability, security, or performance. It is not a code-style nitpick list.

---

## 1. Security

### 1.1 IAM permissions for the site Lambda are unconstrained — HIGH

`stacks/site.ts:44–49` grants the Next.js Lambda `{ actions: ["*"], resources: ["*"] }`. A successful application-layer RCE or SSRF would inherit full AWS privileges within the deploy account. Real needs are narrow:

- `s3:GetObject`, `s3:PutObject` on the `HalBucket` ARN (already exposed via `S3_BUCKET_NAME`).
- Outbound HTTPS only (no AWS API access) for everything else.

**Action:** replace the wildcard policy in `stacks/site.ts:44–49` with an explicit list scoped to the `HalBucket` ARN. If additional AWS services are needed later (SES, SNS, Cognito), add them by name. The wildcard makes audit, blast-radius reasoning, and least-privilege impossible.

### 1.2 `SYNC_SECRET` comparison is not constant-time — MEDIUM

`pages/api/github/sync-events.ts:13–16` compares the bearer token with `!==`. The GitHub event sync endpoint is exposed to the public Lambda URL and is a tempting target for timing attacks. Use `crypto.timingSafeEqual(Buffer.from(headerToken), Buffer.from(expected))` after length-checking both buffers.

### 1.3 `GITHUB_TOKEN` echoed through error paths — MEDIUM

`lib/github-sync.ts:148–164` and `pages/api/github/pull-request.ts:124–126` pass the raw `errorText` from the GitHub API straight into `console.error` and into `error.message`, which `pages/api/github/sync-events.ts:25–31` returns in the HTTP response body. GitHub does not include the bearer token in error bodies today, but it does sometimes include the request URL with query strings. Sanitize before returning to clients — return a generic error message and log the detailed one.

### 1.4 NextAuth session strategy / CSRF not documented — MEDIUM

`pages/api/auth/[...nextauth].js` is the auth entry point but the SC_OVERVIEW notes "Google OAuth" without specifying whether sessions are JWT or database-backed, whether the `NEXTAUTH_SECRET` rotation procedure exists, or whether the `redirect_uri` allowlist is reviewed before changing stage domains. **Action:** read the file, confirm session strategy, and add a short section to `SC_OVERVIEW.md` describing it.

### 1.5 Public S3 / OpenNext asset cache headers are immutable for unhashed files — LOW

`stacks/site.ts:79–98` sets `immutable, max-age=31536000` on `*.png`, `*.jpg`, `*.svg`, `*.ico`, `*.json`, `*.txt`. Without a content hash in the filename, any update to a file under `public/static/` will be invisible to browsers for up to a year. **Action:** restrict immutable caching to hashed Next.js build outputs and use a shorter `max-age` (e.g., 1 hour with `must-revalidate`) for raw `public/` assets, or rename files when they change.

### 1.6 No CSP, no HSTS, no security headers — LOW

There is no `headers()` block in `next.config.mjs` and no equivalent in `stacks/site.ts`. Add at minimum `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a starter Content Security Policy.

---

## 2. Code Quality

### 2.1 Two near-duplicate MongoDB client modules — HIGH

`pages/api/lib/mongodb.ts` and `lib/mongodb.ts` are 95% identical. They diverge in three small ways:
- `appName` (`brianstoker-pages-api` vs `brianstoker-site`).
- `lib/mongodb.ts:3–5` **throws** at import time when `MONGODB_URI` is missing; `pages/api/lib/mongodb.ts:7–9` only `console.warn`s and returns `null` from `getDatabase()`.
- The return type of `getDatabase()` is `Db | null` in one and `Db` in the other.

Confusingly, `lib/github-sync.ts:2` (which is *imported by the cron Lambda*) imports the API-flavored client from `pages/api/lib/mongodb`. The cron is therefore tagged as `brianstoker-pages-api` on the Atlas dashboard, which contradicts the intent of commit `af5fa04` ("tag mongo clients for atlas attribution").

**Action:**
1. Consolidate into a single `lib/mongodb.ts` that accepts `appName` as a parameter (or reads from env).
2. Update `lib/github-sync.ts:2` to import from `lib/mongodb` and pass `brianstoker-cron`.
3. Update Pages API handlers to pass `brianstoker-pages-api`.
4. Choose one error policy (warn-and-null vs throw) and apply consistently.

### 2.2 In-memory description filter breaks pagination correctness — HIGH

`pages/api/github/events.ts:115–130` applies the `description` filter **after** MongoDB has already sliced the page with `skip`/`limit`. The result is that:
- `total` reported to the client (line 86–140) reflects pre-description-filter count, but `events.length` may be smaller, breaking the page-count math the UI uses to render pagination controls.
- Pages can return zero events while `total_pages > 1`.

**Action:** either move the description match into the Mongo query (PushEvent description is synthesized, but PR/issue titles are stored under `payload.pull_request.title` / `payload.issue.title` — those can be matched server-side with a `$or` of `$regex` clauses), or run the description filter *before* `skip`/`limit` and accept the perf cost. The current shape is the worst of both.

### 2.3 PR enrichment block is a 100+ line nested loop — MEDIUM

`lib/github-sync.ts:197–308` contains three nested fetch loops (PR detail → commits → files → push compare) with shared rate-limit short-circuit state. It is also where most of the GitHub API quota is spent. Symptoms:
- Untestable without an end-to-end run.
- `console.log` × 15 makes Lambda log volume non-trivial.
- The `data.length = 0; data.push(...eventsToProcess)` mutation at `lib/github-sync.ts:191–192` is a footgun — it works but is the kind of thing that breaks during a future refactor.

**Action:** extract `enrichPullRequest(event, githubToken)` and `enrichPushEvent(event, githubToken)` into small testable functions (return enriched event or rate-limit sentinel). Replace the array-mutation trick with an explicit assignment.

### 2.4 `as any` casts hide schema bugs — MEDIUM

`pages/api/github/events.ts:39`, `:44`, `:112`, and several spots in `lib/github-sync.ts` (`{ _id: 'github_events_sync' } as any`, `{ sort: ... as any }`) suppress type errors that would otherwise expose the fact that `_id` is being used as a string discriminator but typed as ObjectId.

**Action:** define a typed `SyncMetadataDoc` and a typed `GithubEventDoc` (with `_id: string`), and use `db.collection<SyncMetadataDoc>('sync_metadata')` so the casts disappear. The driver's generic API supports this.

### 2.5 Verbose `console.log` in hot path — MEDIUM

`lib/github-sync.ts` has 15 `console.log` calls and `pages/api/github/events.ts:132` logs every list request. In Lambda this is real money (CloudWatch ingestion + storage) for a personal site. **Action:** introduce a tiny `lib/logger.ts` wrapping `console` with a `LOG_LEVEL` env knob; default to `info` in prod, `debug` locally.

### 2.6 Mixed `.ts` / `.tsx` / `.js` in `pages/api` and `src/modules` — LOW

The `src/modules/components/` tree has multiple `.js` files (`ThemeContext.js`, `AppFrame.js`, `AppNavDrawer.js`, etc.) sitting alongside `.tsx`. `pages/api/auth/[...nextauth].js` and `pages/api/hal/logs.js` are also untyped. **Action:** convert one file per PR. Start with `pages/api/auth/[...nextauth].js` (security surface) and `src/modules/components/AppNavDrawer.js` (highest `TODO` count at 5).

### 2.7 Type checking explicitly disabled on build path — LOW

`NEXT_SKIP_TYPECHECKING=1` in `package.json:11` and `next build --no-lint` in `build:sst`. The intent (speed) is reasonable but means deploys can ship broken types. **Action:** run `pnpm typescript` as a required pre-deploy step in `scripts/aws-deploy.sh` so type errors block deployment without slowing the bundler.

### 2.8 Stale / backup files in repo — LOW

`babel.config.js.bk`, `next.config.mjs.bak`, `src/modules/components/TopLayoutBlog.js.old`, `original.tsconfig.json`, `social-plus-logo-merged.xcf`, `social-plus-logo.xcf`, `mui-vale.zip` should be deleted (large binaries belong in Git LFS or `public/`). Audit `cost-log.json`, `autonomous-assignments.json`, `notifications.json` at repo root — if these are session artifacts they should be `.gitignore`d.

---

## 3. Architecture

### 3.1 Public API routes proxy GitHub directly — HIGH

`pages/api/github/pull-request.ts`, `pull-request-files.ts`, and `commit-files.ts` proxy live GitHub API calls per request. Three issues:

1. **No caching.** Every PR view hits GitHub; rate-limit budget is consumed by visitors, not just by the cron.
2. **No reuse of MongoDB data.** PR detail is already partially enriched and stored in `github_events.payload.pull_request` by `lib/github-sync.ts:197–272`. The proxy endpoints don't read from Mongo first.
3. **Inconsistent enrichment.** The cron enriches PRs only on pages 1–2 (`lib/github-sync.ts:197`) — PRs visible via the proxy may have richer data than older PRs visible only via cached events.

**Action:** introduce a thin cache layer: store fetched PR detail in a `github_pull_requests` collection keyed by `owner/repo/number` with a short TTL field, and have `pages/api/github/pull-request.ts` consult Mongo first. Drop the page-1/2-only enrichment cap when the live proxy can fill gaps on demand.

### 3.2 No revalidation / ISR strategy for the home page — MEDIUM

`pages/index.tsx` reads MDX via `getAllBlogPosts()` and the home page is rendered by Lambda on every request. Output should be `getStaticProps` + ISR with a short revalidate window so OpenNext serves cached HTML and the Lambda is invoked only at revalidation. **Action:** convert `pages/index.tsx` (and the resume / about pages) to `getStaticProps` with `revalidate: 300`.

### 3.3 No global error boundary or 5xx instrumentation — MEDIUM

There is no `pages/_error.js` override and no client-side error tracking. The `pages/api/hal/logs.js` ship-to-private-backend setup (commit `afde04e`) handles server logs, but unhandled React errors and API 5xx responses are not aggregated. **Action:** add a minimal `pages/_error.tsx` that POSTs to `/api/hal/logs`, and wrap the App tree in a `<ErrorBoundary>` in `pages/_app.js`.

### 3.4 Inconsistent route convention — LOW

`pages/api/github/event/`, `pages/api/github/pull-request/` directories coexist with sibling `pages/api/github/events.ts`, `pages/api/github/pull-request.ts` files — i.e., both a directory route and a flat file exist for `pull-request`. Confirm the directory variant is actually used or remove it; this is the kind of thing that bites during a Next.js major upgrade.

### 3.5 Per-stage database name derived implicitly from domain — LOW

`stacks/domains.ts` derives `dbName` from domain subdomain segments. This couples a deploy-time identifier (DB name) to the human-readable URL. Renaming a stage domain silently switches the deploy to a new (empty) Mongo database. **Action:** make `MONGODB_NAME` an explicit per-stage env var; keep the derivation as a default but log a warning when the derived name differs from a prior deploy's name (a simple "create file in S3 with last-used name" check would do it).

---

## 4. Performance

### 4.1 PR enrichment is sequential, not parallel — HIGH

`lib/github-sync.ts:200–271` enriches PRs one at a time with three sequential GitHub API calls per PR (`/pulls/N`, `/pulls/N/commits`, `/pulls/N/files`). For 40 events × 3 calls × ~200ms = up to 24s of wall time. The 5-minute Lambda timeout (`stacks/cron.ts`) masks this but Atlas connection pool and rate-limit headroom both suffer.

**Action:** for each PR, run the three fetches in `Promise.all`. Across PRs on a page, batch with bounded concurrency (e.g., `p-limit(5)`).

### 4.2 `eventsCollection.createIndex` runs every sync — MEDIUM

`lib/github-sync.ts:70–73` calls `createIndex` four times on every cron invocation. MongoDB is idempotent here (it no-ops if the index exists) but the round trips add ~50–100ms per cold sync. **Action:** move index creation to a one-time bootstrap script under `scripts/` (call it from `scripts/aws-deploy.sh`), and drop it from the hot path.

### 4.3 Per-event `updateOne` instead of `bulkWrite` — MEDIUM

`lib/github-sync.ts:311–323` upserts events one at a time inside a `for` loop. For 280 events (7 pages × 40) that's 280 round trips. Use `eventsCollection.bulkWrite([{ updateOne: { ... } }, ...], { ordered: false })` — typical speedup is 5–10x.

### 4.4 `total` count duplicates the filter query — LOW

`pages/api/github/events.ts:86` runs `countDocuments(query)` then `find(query)` separately. With an index, this is fine; without a `created_at`/`type`/`repo.name` compound index covering common filter combos, it does two collection scans. Confirm the indexes from §4.2 cover the actual query shapes shown at lines 46–82, and add a `(repo.name, created_at)` compound if `repo` is filtered frequently.

### 4.5 Images not optimized — LOW

`next.config.mjs` disables Next image optimization (per `SC_OVERVIEW.md` §4.3). The site uses many product showcase images. **Action:** investigate why optimization was disabled (likely OpenNext compatibility in 2024); revisit with OpenNext 3.x. If still incompatible, at least pre-generate WebP/AVIF variants in `scripts/buildIcons.js`-style preprocessing.

### 4.6 Large bundle from MUI + Tailwind + Emotion + styled-components — LOW

The dependency list pulls in **four** styling systems: MUI's Emotion, Tailwind, JSS (`jss`, `jss-rtl`), and `styled-components`. Run `pnpm dlx webpack-bundle-analyzer` (the dev dep is already there) and confirm tree-shaking actually drops the unused ones. If `styled-components` and `jss` aren't used by hot pages, remove them.

---

## 5. Testing

### 5.1 No unit tests at all — HIGH

The repo has Playwright e2e (`e2e/smoke-tests.spec.ts`, `e2e/visual-regression.spec.ts`, `e2e/mobile/`) but no Jest/Vitest. The functions most in need of unit tests:

- `lib/github-sync.ts` — paging logic, rate-limit handling, enrichment branch selection, the array-mutation trick at line 191.
- `pages/api/github/events.ts` — the date-filter switch at lines 58–79, description filter at 115–130.
- `stacks/domains.ts` — domain → dbName derivation (regression bait when a stage is added).

**Action:** add `vitest` as a devDep, create `lib/__tests__/github-sync.test.ts` with `nock` or `msw` for the GitHub API, and target ≥70% coverage of `lib/github-sync.ts` first.

### 5.2 No CI workflow visible — HIGH

There is no `.github/workflows/` directory referenced in the overview. Without CI:
- `pnpm typescript`, `pnpm knip`, `pnpm link-check`, and Playwright tests are only run when humans remember.
- `pnpm build:sst` not being verified means the deploy command is the only test of build correctness.

**Action:** add `.github/workflows/ci.yml` that runs `pnpm install`, `pnpm typescript`, `pnpm knip`, and `pnpm test:smoke` on every PR.

### 5.3 Visual regression snapshots are checked in but not gated — MEDIUM

`e2e/visual-regression.spec.ts-snapshots/` exists, but without CI those snapshots can drift silently. The `test:visual:update` script makes it easy to commit "fixes" that mask real visual breakage. **Action:** require visual regression runs on every PR (in CI from §5.2) and protect the `update-snapshots` flag behind a label-gated workflow.

### 5.4 No tests for the cron Lambda — MEDIUM

`cron/github-sync.ts` is a thin wrapper but has no smoke test. Add one Playwright API spec that calls `/api/github/sync-events` with the test secret and asserts a 200/401 contract.

---

## 6. Documentation

### 6.1 Decision rationale for build quirks not captured — MEDIUM

Multiple non-obvious workarounds need an explanation in-tree:
- `fix-nextjs15.js` — what does it patch? Add a header comment with the original OpenNext issue link.
- `NEXT_SKIP_TYPECHECKING=1` — why (speed) and when it's safe to enable typechecking again (post-`typescript@6` stable, currently on `6.0.0-dev.20251014`).
- Tailwind preflight disabled — why MUI's `CssBaseline` is the chosen reset (`tailwind.config.js`).

### 6.2 No runbook for `unlock:prod` / `refresh:prod` — MEDIUM

`pnpm unlock:prod` and `pnpm refresh:prod` exist in `package.json:28–29` but there's no documentation on when they're needed (SST state lock contention, drift detection). Add a short `docs/operations.md` with the symptoms that should make an on-caller reach for each.

### 6.3 `DEPLOYMENT_READY.md` and `GITHUB_EVENTS_ANALYSIS.md` may be stale — LOW

Top-level analysis docs exist (`DEPLOYMENT_READY.md`, `GITHUB_EVENTS_ANALYSIS.md`, `TESTING.md`). Confirm they reflect current behavior or move them under `docs/archive/` with a date stamp. Otherwise they will mislead future contributors.

### 6.4 `src/products.tsx` is undocumented — LOW

The product catalog drives the home page but has no header explaining how to add a product (which showcase component to create, where icons live, ordering rules). Add a 10-line block comment at the top.

---

## 7. Operability

### 7.1 No structured logs — MEDIUM

Lambda CloudWatch logs are line-oriented strings (e.g., `lib/github-sync.ts:83, :105, :122`). Without JSON structure they can't be parsed by log shipping (commit `afde04e` set up shipping to a private backend) for metrics/alerts. **Action:** emit JSON via the logger from §2.5: `{ event: 'sync_page', page, eventCount, rateRemaining }`.

### 7.2 No alerting on sync failures — MEDIUM

`lib/github-sync.ts:382–401` records `success: false` in `sync_metadata` on failure, but nothing watches that document. If the cron silently breaks, the home page will go stale without anyone noticing for days. **Action:** add a Cloudwatch alarm on Lambda errors for the `GithubSyncCron`, and a "stale events" check (e.g., a tiny `/api/github/health` route that returns 503 if `sync_metadata.lastSync` is older than 2 hours).

### 7.3 GitHub rate-limit budget is not surfaced to humans — LOW

`github_rate_limits` collection is populated (`lib/github-sync.ts:140–144`) but never exposed in a UI or dashboard. Add a `/api/github/rate-limit` route that returns the latest doc; it's a 10-line handler and lets the developer eyeball headroom.

---

## 8. Priority Triage

If only a handful of items get done, do these first:

1. **§1.1** — narrow site Lambda IAM (security blast radius).
2. **§2.1** — consolidate MongoDB clients (cron is mis-tagged in Atlas right now).
3. **§2.2** — fix the description filter / pagination correctness bug (real user-visible bug).
4. **§4.3** — switch sync to `bulkWrite` (cheap, large perf win).
5. **§5.2** — add a CI workflow (everything else degrades silently without it).
6. **§3.1** — cache PR proxy responses in Mongo (avoids quota burn from visitors).

The remaining items are real but lower-urgency. Track them as separate Stokd tasks rather than batching into one large PR.
