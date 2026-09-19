<!-- stokd-meta-version: 0.4.0 -->
# SC_RECOMMENDATIONS — brianstoker-com

Actionable, prescriptive recommendations for the `v2.brianstoker.com` codebase. Every item references a concrete file (and verified line range where useful) so it can be acted on directly. Items are ordered by impact within each section.

Repo root: `/opt/worktrees/v2.brianstoker.com/v2.brianstoker.com-main` (branch `main`).

This is **not** a style nitpick list. It targets correctness, security, maintainability, performance, and operability. All line references below were verified against the working tree at the time of writing.

> **Scope note — two backend surfaces.** This repo has two distinct server surfaces, and recommendations cover both:
> 1. The Next.js Pages-Router app (`pages/api/**`, `lib/**`) deployed via OpenNext to a Lambda (`stacks/site.ts`).
> 2. A separate API-Gateway Lambda set under the root `api/` directory (`api/subscribe.ts`, `api/sms.ts`) with its own `package.json` and `lib/mongodb`, wired by `stacks/api.ts` / `stacks/apigateway.ts`. This surface is public-facing and is the source of several of the highest-priority security items below.

---

## 0. Priority Triage (do these first)

| # | Item | Section | Why now |
|---|------|---------|---------|
| 1 | Newsletter endpoint has no email validation, no rate limit, sends SES mail to arbitrary addresses | §1.1 | Email-bombing / SES reputation abuse on a publicly reachable endpoint |
| 2 | `SYNC_SECRET` auth bypass when env unset (`Bearer undefined`) + non-constant-time compare | §1.2 | Auth bypass on the public sync Lambda URL |
| 3 | Site Lambda granted `actions:["*"], resources:["*"]` IAM | §1.3 | Any app-layer RCE/SSRF inherits the whole AWS account |
| 4 | CI deploys on every push to `main` via **raw `sst deploy`** — bypasses `scripts/aws-deploy.sh`, so it skips the CloudFront origin repoint (breaks prod in this account) and runs no typecheck/test gate | §6.1 | A green ✅ deploy can revert CloudFront to dead Function-URL origins **and** ship unverified code straight to prod |
| 5 | In-memory `description` filter runs after `skip`/`limit` → pagination is wrong | §2.1 | User-visible bug: empty pages, wrong page counts |
| 6 | Two divergent MongoDB client modules; cron is mis-tagged in Atlas | §2.2 | Correctness + the Atlas-attribution work (`af5fa04`) is silently undone |
| 7 | Per-event `updateOne` loop instead of `bulkWrite` | §4.1 | Cheap, large perf win on the hourly cron |

Track the rest as separate Stokd tasks rather than one mega-PR.

---

## 1. Security

### 1.1 Public newsletter endpoint: no email validation, no rate limit, SES abuse vector — HIGH

`api/subscribe.ts` is a publicly reachable API-Gateway Lambda that sends email via SES on demand. Multiple problems compound:

- **No email format validation** (`api/subscribe.ts:79-85`): `const { email } = JSON.parse(...)` is checked only for truthiness, then passed straight into `SES.sendEmail` (`api/subscribe.ts:126-140`). An attacker can drive verification emails to arbitrary recipients from your verified `no-reply@${ROOT_DOMAIN}` sender — classic email-bombing that burns SES reputation and risks the domain being sandboxed.
- **No rate limiting / throttling.** Each POST triggers an SES send. There is no per-IP/per-email cap.
- **Weak origin check that can crash** (`api/subscribe.ts:65`): `process.env.ROOT_DOMAIN?.includes(event.headers.origin.replace("https://",""))`. If the `origin` header is absent, `.replace` throws → 500. The check is also a substring match (`includes`), so `evilrootdomain.com` style values can pass.
- **Internal error text leaked into a redirect URL** (`api/subscribe.ts:218`): the `verify` handler puts `error=${encodeURIComponent(error)}` in the `Location`, exposing stack/driver detail to the browser and any proxy logs.

**Action:** add a strict email regex + length cap; guard the origin read (`event.headers.origin ?? ''`) and switch to an exact allowlist; add a simple per-email cooldown (the `subscribers` doc already exists — store `lastEmailSentAt` and refuse re-sends within N minutes); stop echoing `error` into the redirect.

### 1.2 `SYNC_SECRET` check: bypass-when-unset and non-constant-time — HIGH

`pages/api/github/sync-events.ts:13-16`:

```ts
const authHeader = req.headers.authorization;
if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
  return res.status(401).json({ message: 'Unauthorized' });
}
```

Two issues:
1. **Bypass when the env is missing.** If `SYNC_SECRET` is unset, the expected string becomes the literal `"Bearer undefined"`, and anyone sending `Authorization: Bearer undefined` is authorized. Fail closed instead — reject with 500 when the secret is not configured.
2. **Timing side channel.** `!==` short-circuits on the first differing byte. Use `crypto.timingSafeEqual` on length-checked buffers.

The endpoint is exposed on the public Lambda/CloudFront URL, so both matter.

### 1.3 Site Lambda IAM is unconstrained — HIGH

`stacks/site.ts:44-49` grants the Next.js server function:

```ts
permissions: [{ actions: ["*"], resources: ["*"] }],
```

A successful SSRF or RCE in any `pages/api/**` handler inherits full AWS privileges in the deploy account. The function's real needs are narrow: `s3:GetObject`/`s3:PutObject` on the `HalBucket` ARN (exposed via `S3_BUCKET_NAME`, read by `pages/api/hal/logs.js`) plus outbound HTTPS (no AWS API) for everything else.

**Action:** replace the wildcard with an explicit statement scoped to the `HalBucket` ARN; add named services later if/when used (SES, SNS, Cognito). The wildcard makes least-privilege and blast-radius reasoning impossible.

### 1.4 No security response headers (CSP/HSTS/nosniff) — MEDIUM

`next.config.mjs` has no `headers()` block, and `stacks/site.ts` sets no security headers on responses. Add at minimum `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a starter `Content-Security-Policy`. (CSP is non-trivial with MUI/Emotion inline styles — start in `Content-Security-Policy-Report-Only` mode.)

### 1.5 GitHub error bodies returned to clients — MEDIUM

`pages/api/github/sync-events.ts:27-31` returns `syncError.message` (and `...syncError.details`) in the HTTP body. That message can include raw GitHub API error text built in `lib/github-sync.ts:163` (`GitHub API error: ${status} - ${errorText}`). GitHub does not echo the bearer token, but it does include request URLs/query strings. Return a generic client message; log the detailed one server-side.

### 1.6 NextAuth allowlist does not check `email_verified`; allowlist is hard-coded — MEDIUM/LOW

`pages/api/auth/[...nextauth].js:11-23` uses default JWT sessions and gates sign-in by an in-source `allowedEmails` array, but does **not** check `profile.email_verified`. For Google consumer/Workspace this is low risk in practice, but the SC_TEST plan already lists "unverified Google email → reject" as a required case — add the `profile.email_verified === true` guard. Separately, the allowlist living in source means adding an operator requires a code change + full prod deploy; consider moving it to an env var.

### 1.7 Immutable cache on unhashed public assets — LOW

`stacks/site.ts:86-105` applies `max-age=31536000,public,immutable` to `*.png`, `*.jpg`, `*.svg`, `*.ico`, `*.json`, `*.txt`, fonts, etc. Files under `public/static/` are **not** content-hashed, so any update is invisible to browsers for up to a year. Restrict `immutable` to Next.js hashed build outputs; serve raw `public/` assets with a short `max-age` + `must-revalidate`, or hash filenames on change.

---

## 2. Code Quality & Correctness

### 2.1 `description` filter applied after pagination → broken page math — HIGH (real bug)

`pages/api/github/events.ts`:
- `totalCount = countDocuments(query)` at line 86 (does **not** account for the description filter).
- `find(query).skip(skip).limit(perPage)` at lines 111-117 slices the page from the DB.
- The `description` filter then runs **in memory on the already-sliced page** (lines 120-135).

Consequences: `total`/`total_pages` returned to the client (lines 142-149) reflect the pre-filter count, but `events.length` can be smaller — so the UI renders pagination controls for pages that come back empty, and a search can show "page 1 of 5" with zero results.

**Action:** push the description match into the Mongo `query`. PR/issue titles live at `payload.pull_request.title` / `payload.issue.title` and can be matched with a `$or` of `$regex` clauses; the synthesized "Pushed N commits" string for `PushEvent` can be approximated server-side (or excluded from text search with a documented caveat). If a perfect match is required, filter the full result set *before* `skip`/`limit` and pay the cost — but the current shape is the worst of both worlds.

### 2.2 Two near-duplicate MongoDB clients; cron mis-attributed in Atlas — HIGH

`pages/api/lib/mongodb.ts` and `lib/mongodb.ts` are ~95% identical but diverge in three ways:
- `appName`: `brianstoker-pages-api` (`pages/api/lib/mongodb.ts:5`) vs `brianstoker-site` (`lib/mongodb.ts:9`).
- Missing-URI policy: `lib/mongodb.ts:3-5` **throws at import**; `pages/api/lib/mongodb.ts:7-9` only `console.warn`s and `getDatabase()` returns `null`.
- Return type: `getDatabase(): Promise<Db | null>` vs `Promise<Db>`.

Critically, `lib/github-sync.ts:2` — the code path the **cron Lambda** runs — imports the *API-flavored* client (`pages/api/lib/mongodb`). So the hourly cron is tagged `brianstoker-pages-api` on the Atlas dashboard, directly contradicting the intent of commit `af5fa04` ("tag mongo clients for atlas attribution").

**Action:**
1. Consolidate to a single factory that takes `appName` as a parameter (or reads it from env).
2. Have `lib/github-sync.ts` request `brianstoker-cron`; Pages handlers request `brianstoker-pages-api`.
3. Pick one missing-URI policy (recommend warn-and-null at the edge, throw at the cron entry) and one return type.
4. Note the root `api/lib/mongodb` is a *third* client for the API-Gateway surface — fold it into the same factory if practical.

### 2.3 PR/Push enrichment is a 100+-line nested loop with array-mutation footgun — MEDIUM

`lib/github-sync.ts:197-308` nests PR-detail → commits → files fetches and a separate push-compare loop, sharing a `rateLimitHit` short-circuit. It is untestable without an end-to-end run and carries `data.length = 0; data.push(...eventsToProcess)` (lines 191-192) — a mutate-in-place trick that works today but is exactly what breaks in a refactor.

**Action:** extract `enrichPullRequest(event, token)` and `enrichPushEvent(event, token)` as pure-ish functions returning an enriched event or a rate-limit sentinel; replace the array mutation with an explicit `const eventsToProcess = ...` reassignment.

### 2.4 `as any` casts hide a real schema mismatch — MEDIUM

`_id` is used as a **string** discriminator (`{ _id: 'github_events_sync' }`, `{ _id: event.id }`) but the driver types it as `ObjectId`, so the code sprinkles `as any`: `events.ts:39`, plus `lib/github-sync.ts:79, 90, 141, 313, 355, 388`. The `sort` cast (`{ sort: { created_at: -1 } as any }`) hides the same thing.

**Action:** declare typed documents — `interface SyncMetadataDoc { _id: string; ... }`, `interface GithubEventDoc { _id: string; ... }` — and use `db.collection<SyncMetadataDoc>('sync_metadata')`. The driver's generic collection API removes the casts and surfaces the string-`_id` decision in the type system.

### 2.5 Excessive `console.*` in the hot cron path — MEDIUM

`lib/github-sync.ts` has **27** `console.{log,warn,error}` calls, several inside per-event loops. On Lambda this is recurring CloudWatch ingestion + storage cost for a personal site, and it makes the log-shipping pipeline (`afde04e`) noisy. Introduce a tiny `lib/logger.ts` wrapping `console` with a `LOG_LEVEL` env knob (default `info` in prod, `debug` locally) and emit structured JSON (`{ event: 'sync_page', page, eventCount, rateRemaining }`) so logs are queryable.

### 2.6 `api/subscribe.ts` does admin DB introspection on every request — MEDIUM

`ensureDatabaseAndCollectionExists` (`api/subscribe.ts:14-42`) calls `admin().listDatabases()` and `db.listCollections()` on **every** subscribe/verify call. This (a) requires the Mongo user to hold admin/`listDatabases` privileges — a least-privilege violation — and (b) adds two round trips per request. MongoDB creates databases/collections implicitly on first write; drop this entirely and rely on `insertOne`. Also note `getVerification` is called with a `token` argument it never uses (`api/subscribe.ts:47, 93`) — dead param.

### 2.7 Inconsistent AWS SDK versions — LOW

The Next app uses AWS SDK v3 (`@aws-sdk/client-s3`), while `api/subscribe.ts:2` imports SES from `aws-sdk` (v2, maintenance mode). Standardize on v3 (`@aws-sdk/client-ses` / `@aws-sdk/client-sesv2`) so the API-Gateway bundle isn't pulling the entire v2 SDK.

### 2.8 Mixed `.js`/`.ts`/`.tsx` and untyped API routes — LOW

`src/modules/components/` carries 20+ `.js` files (`AppFrame.js`, `AppNavDrawer.js`, `ThemeContext.js`, …) alongside `.tsx`; `pages/api/auth/[...nextauth].js` and `pages/api/hal/logs.js` are untyped JS on the security/IO surface. Convert one file per PR, starting with the auth and S3-reading handlers. There are also ~30 `TODO`/`FIXME` markers across `src`/`lib`/`pages` worth triaging into tasks.

### 2.9 Stale/backup/binary files committed to the repo — LOW

Remove or relocate the tracked backup/binary files (all still committed): `babel.config.js.bk`, `next.config.mjs.bak`, `original.tsconfig.json`, `src/modules/components/TopLayoutBlog.js.old`, `mui-vale.zip`, and the two **5.7 MB** GIMP files `social-plus-logo.xcf` / `social-plus-logo-merged.xcf` (these belong in Git LFS or out of the repo). Audit the three root-level runtime-artifact JSONs, which are all tracked and not in `.gitignore`:
- `cost-log.json` is now an intentional empty scaffold (`{ "version": 1, "entries": [] }`, committed in `578a32d`). If it's meant to accumulate agent cost data at runtime, `.gitignore` it (and commit a `.example`) rather than churning the committed file.
- `autonomous-assignments.json` still carries a **stale absolute path** (`projectPath: "/Users/stoked/work/brianstoker.com"`, which no longer matches this worktree at `/opt/worktrees/...`) and an empty `assignments` array — clearly stale agent state.
- `notifications.json` is a committed ~900-byte blob of marketing-toast copy.

All three look like session/agent output; either move them under `data/` with a documented purpose or `.gitignore` them.

---

## 3. Architecture

### 3.1 Duplicate GitHub route definitions (flat file + dynamic dir) — MEDIUM

For both `events` and `pull-request` there are *two* route shapes coexisting:
- `pages/api/github/events.ts` **and** `pages/api/github/event/[id].ts`
- `pages/api/github/pull-request.ts`, `pull-request-files.ts` **and** `pages/api/github/pull-request/[number].ts`

This is confusing and a known foot-gun on Next.js major upgrades. Confirm which variant the frontend actually calls (`src/components/PullRequest/*`, `src/components/GithubEvents/*`), then delete the unused one.

### 3.2 PR proxy endpoints hit GitHub live, per request, with no cache — MEDIUM

`pages/api/github/pull-request.ts:132-144` makes three **sequential** GitHub calls (`/pulls/N`, `/pulls/N/commits`, `/pulls/N/files`) on every PR view, with no caching and no reuse of data the cron already stored in `github_events.payload.pull_request` (`lib/github-sync.ts:205-254`). Visitors therefore burn the shared GitHub rate-limit budget, and enrichment is inconsistent (the cron only enriches pages 1-2, `lib/github-sync.ts:197`).

**Action:** read from Mongo first; on miss, fetch from GitHub and write into a `github_pull_requests` collection keyed by `owner/repo/number` with a short TTL. This also lets you drop the page-1/2 enrichment cap.

### 3.3 No ISR/static strategy for content pages — MEDIUM

`pages/index.tsx` (and resume/about pages) render on the Lambda per request and read MDX via `getAllBlogPosts()`. These are near-static. Convert to `getStaticProps` + `revalidate` (e.g. 300s) so OpenNext/CloudFront serves cached HTML and the Lambda is invoked only on revalidation — fewer cold starts, lower latency, lower cost.

### 3.4 No global error boundary or 5xx aggregation — MEDIUM

There is no `pages/_error.tsx` override and no React error boundary in `pages/_app.js`. Server logs ship to a private backend (`afde04e` / `pages/api/hal/logs.js`), but unhandled client errors and API 5xx responses are not aggregated. Add a minimal `pages/_error.tsx` and wrap the app tree in an `<ErrorBoundary>`.

### 3.5 DB name derived implicitly from the domain — LOW

`stacks/domains.ts:13-17` derives `dbName` from the first domain's subdomain segments + stage. Renaming a stage domain silently repoints the deploy at a new (empty) Mongo database. Make `MONGODB_NAME` an explicit per-stage value, keeping the derivation only as a logged default and warning when it differs from the last-used name.

---

## 4. Performance

### 4.1 Per-event `updateOne` instead of `bulkWrite` — HIGH (cheap win)

`lib/github-sync.ts:310-323` upserts events one-by-one in a `for` loop. With `maxPages = 7 × per_page = 40` that's up to ~280 sequential round trips per sync. Replace with a single `eventsCollection.bulkWrite([{ updateOne: { filter, update, upsert: true } }, ...], { ordered: false })` — typically a 5-10× speedup and far less Atlas connection pressure.

### 4.2 PR enrichment fetches are fully sequential — HIGH

`lib/github-sync.ts:200-301` enriches each PR with three sequential fetches, and pages are processed serially. Run the three per-PR fetches in `Promise.all`, and bound cross-PR concurrency (e.g. `p-limit(5)`), preserving the rate-limit short-circuit. This cuts wall-clock from ~seconds-per-PR toward the slowest single call.

### 4.3 `createIndex` ×4 on every sync — MEDIUM

`lib/github-sync.ts:70-73` issues four `createIndex` calls every cron run. They're idempotent but cost ~50-100ms of round trips on each cold invocation. Move index creation into a one-time bootstrap script under `scripts/` (invoke from `scripts/aws-deploy.sh`) and drop it from the hot path.

### 4.4 `countDocuments` + `find` may double-scan without covering indexes — LOW

`pages/api/github/events.ts:86` and `:111` run two queries against the same filter. The indexes created in §4.3 cover `created_at`, `id`, `repo.name`, and `type` individually, but common combined filters (`repo.name` + `created_at` sort) aren't covered by a compound index. Add a `{ 'repo.name': 1, created_at: -1 }` compound if repo filtering is common.

### 4.5 Image optimization disabled; four styling systems shipped — LOW

`next.config.mjs:11-13` sets `images.unoptimized: true` (likely an OpenNext-2.x workaround) — revisit now that OpenNext 3.x is in use, or pre-generate WebP/AVIF in the icon/build pipeline. Separately, the dependency set ships **four** styling systems (MUI/Emotion, Tailwind, JSS via `jss`/`jss-rtl`, and `styled-components`). Run the already-present `webpack-bundle-analyzer` and drop whichever aren't used by hot pages.

---

## 5. Testing

(See `SC_TEST.md` for the full strategy; this section is the recommendation summary.)

### 5.1 No unit/integration tests for the server surface — HIGH

Playwright e2e exists (`e2e/`), but `lib/github-sync.ts`, every `pages/api/**` handler, `api/subscribe.ts`, and both Mongo clients have **zero** tests — and they are the only stateful, money-spending parts. Add **Vitest** + `node-mocks-http` + `mongodb-memory-server` + **MSW** (do not add Jest — there's no active Babel config). First targets, highest ROI:
- `lib/github-sync.ts`: 304 handling, dedup/upsert, `fullRefresh`, 429 propagation, the array-mutation path (§2.3).
- `pages/api/github/sync-events.ts`: 405/401 contract — including the **unset-secret bypass** in §1.2 (write the failing test, then fix).
- `pages/api/github/events.ts`: the description-filter pagination bug in §2.1 (regression test it).
- `api/subscribe.ts`: rejects malformed email, throttles repeat sends, survives a missing `origin` header (§1.1).

### 5.2 Add a real `vitest` script + coverage gate — HIGH

There is no `test:unit` script. Add `"test:unit": "vitest run"` and `"test:coverage": "vitest run --coverage"`, and gate CI at a starting 70% line coverage, ratcheting up. Target ≥90% on `lib/github-sync.ts` (pure logic, high blast radius).

---

## 6. CI/CD & Operability

### 6.1 CI deploys via raw `sst deploy` — bypasses the sanctioned ingress and ships ungated — HIGH

`.github/workflows/deploy-production.yml` triggers on **every push to `main`** (lines 4-5) and deploys by running `dotenvx run -f .env.production -- pnpm exec sst deploy --stage production` (line 73) — calling SST **directly**, not through `scripts/aws-deploy.sh`. Two compounding problems:

1. **It bypasses the post-deploy CloudFront origin repoint, which can break production in this AWS account.** `scripts/aws-deploy.sh` runs `update-cloudfront-origins.cjs` (line 19) and `setupLogShipping.cjs` (line 21) *after* the `sst deploy` (line 17), because Lambda Function URLs are broken in account `167217327520` and production serves through manually-managed API Gateways that are **not** in SST state (SC_OVERVIEW §2.5). A bare `sst deploy` reverts the CloudFront origins to the dead Function URLs and drops log shipping — so this workflow, if its AWS secrets are live, actively breaks prod on every push. It also violates repo axiom `AX-REPO-DEPLOY-SINGLE-INGRESS`.
2. **No typecheck/test gate.** The deploy step sets `NEXT_SKIP_TYPECHECKING=1` (line 67) and there is no `pnpm typescript`, no Playwright, and no smoke test before `sst deploy`. Combined with §6.2 (the test workflow is disabled), nothing verifies the code before it reaches prod.

**Action:** make CI call `./scripts/aws-deploy.sh deploy` (the sanctioned ingress) instead of raw `sst deploy`, so the origin repoint + log-shipping steps run; **or** disable the `push` trigger and keep deploys manual (`pnpm deploy:prod`) until the workflow is corrected. Independently, add a gating job (`pnpm typescript` + `pnpm test:smoke` + the new unit tests) that the `deploy` job `needs:` — at minimum run `pnpm typescript` before any deploy so type errors block it.

### 6.2 The test workflow is disabled and the visual-regression "gate" is a no-op — HIGH

`.github/workflows/mobile-ux-tests.yml` runs **only** on `workflow_dispatch` — automatic `pull_request`/`push` triggers are commented out (lines 4-14, "Disabled automatic triggers due to missing dotenvx dependency"). So the Playwright suite never runs unless a human clicks it. Worse, the `visual-regression` job runs with `--update-snapshots` **and** `continue-on-error: true` (lines 135-138): it regenerates baselines every run and cannot fail — it provides zero protection.

**Action:** fix the underlying `dotenvx` issue and re-enable `pull_request`/`push` triggers; remove `--update-snapshots` from the CI visual job and drop `continue-on-error` so drift actually fails (gate snapshot updates behind a separate, label-triggered workflow); add `pnpm typescript`, `pnpm knip`, and `pnpm link-check` steps.

### 6.3 No alerting on sync failure or staleness — MEDIUM

`lib/github-sync.ts:387-397` records `success: false` in `sync_metadata` on failure, but nothing watches it. If the hourly cron breaks, the activity feed silently goes stale for days. Add a CloudWatch alarm on `GithubSyncCron` Lambda errors, plus a tiny `/api/github/health` route returning 503 when `sync_metadata.lastSync` is older than ~2 hours.

### 6.4 GitHub rate-limit headroom is captured but never surfaced — LOW

`lib/github-sync.ts:140-144` upserts the `github_rate_limits` collection every page, but it's never exposed. A ~10-line `/api/github/rate-limit` handler returning the latest doc lets you eyeball headroom before it bites.

---

## 7. Documentation

### 7.1 Non-obvious build workarounds are undocumented — MEDIUM

Add short in-tree rationale for: `fix-nextjs15.js` (what OpenNext/Next15 issue it patches — link it); `NEXT_SKIP_TYPECHECKING=1` (why, and when it's safe to re-enable — currently blocked by the `typescript@6.0.0-dev.20251014` preview pin in `package.json`); and Tailwind preflight being disabled in favor of MUI `CssBaseline` (`tailwind.config.js`).

### 7.2 No operations runbook — MEDIUM

`pnpm unlock:prod` / `pnpm refresh:prod` exist (`package.json:29-30`) with no docs on the symptoms (SST state-lock contention, drift) that warrant them. Add a short `docs/operations.md`. Also confirm whether the top-level `DEPLOYMENT_READY.md`, `DEPLOYMENT_CHECKLIST.md`, `API_GATEWAY_IMPLEMENTATION.md`, and `GITHUB_EVENTS_ANALYSIS.md` still reflect reality or move them to `docs/archive/` with a date stamp.

### 7.3 `src/products.tsx` has no contributor guide — LOW

The product catalog drives the home-page showcases but has no header explaining how to add a product (which `*Showcase.tsx` to create, where icons live, ordering). Add a ~10-line block comment.

---

## 8. Notes & Corrections vs. Prior Analysis

For reviewers comparing against earlier notes:
- **CI does exist** (`.github/workflows/{deploy-production,mobile-ux-tests}.yml`) — but `deploy-production.yml` calls `sst deploy` **directly** rather than through `scripts/aws-deploy.sh`, so it is both **non-gating** (§6.1–§6.2) *and* **bypasses the Function-URL origin-repoint workaround** production depends on. A green ✅ deploy here is worse than no CI: it looks covered while it can revert CloudFront to dead origins.
- **`pages/api/hal/logs.js` is a read-only S3 log *viewer*** gated by `getServerSession` (`pages/api/hal/logs.js:5-9`), not an arbitrary-POST log sink. It lacks method gating but is auth-protected.
- **The biggest unguarded public input is `api/subscribe.ts`** (the API-Gateway surface), not the Pages API — see §1.1.

If only the top of §0 gets done, the security posture and deploy safety improve the most for the least effort.
