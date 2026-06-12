# SC_TEST.md — brianstoker.com (Monorepo)

Testing strategy and implementation plan for the Next.js 15 portfolio + GitHub-activity
site. **Scope:** Workspace-wide. **Priority:** **critical**.
Package root: `/opt/worktrees/v2.brianstoker.com/v2.brianstoker.com-main`.

> Every claim below was verified against the source on 2026-06-09. Where a "test case"
> is listed, the **expected** behavior is the *current verified* behavior unless the row
> is flagged **(GAP)** — those describe behavior that does not exist yet and the test is
> expected to go red first (see Axiom 5 / TDD). Don't write a test asserting behavior the
> code doesn't have and call it green.

---

## 1. Current State

| Layer | Tooling | Status |
|-------|---------|--------|
| E2E (browser) | Playwright 1.56 (`e2e/`) | Present — `smoke-tests.spec.ts`, `visual-regression.spec.ts`, 5 specs in `e2e/mobile/`, 9 viewport projects |
| Visual regression | Playwright snapshots (`e2e/visual-regression.spec.ts-snapshots/`) | Baselines committed (`*-darwin.png`) |
| Unit / component tests | — | **None** |
| API route / handler tests | — | **None** |
| Integration (DB + handlers) | — | **None** |
| Type checking | `pnpm typescript` (`tsc -p tsconfig.json && tsc -p scripts/tsconfig.json`) | Available; **builds bypass TS** (`NEXT_SKIP_TYPECHECKING=1`) |
| Dead code | `pnpm knip` | Available |
| Link validation | `pnpm link-check` | Available |
| CI for tests | `.github/workflows/mobile-ux-tests.yml` | **`workflow_dispatch` only** — auto PR/push triggers are commented out ("missing dotenvx dependency"). Tests effectively do not gate merges today. |

There is **no unit-test runner** (`rg '"jest"|"vitest"' package.json` → no matches; see
repo axiom *AX-REPO-CORRECTNESS-VIA-TYPESCRIPT-AND-PLAYWRIGHT*). The critical untested
gap is the **server-side surface** — `pages/api/**`, `lib/github-sync.ts`,
`pages/api/lib/mongodb.ts`, and the SST cron handler `cron/github-sync.ts`. These are the
only stateful, money-spending, rate-limit-exposed parts of the system and have zero
coverage.

Note: there is no active Babel config — `babel.config.js.bk` is intentionally disabled
(`.bk` suffix). Any tooling choice below must avoid resurrecting it.

---

## 2. What Must Be Tested

### 2.1 Critical paths (P0 — block release if red)

1. **GitHub event sync pipeline** (the heart of the app, and the only GitHub-rate-limit consumer)
   - `pages/api/github/sync-events.ts` — `POST`-only (405 otherwise), bearer auth `Authorization === \`Bearer ${SYNC_SECRET}\`` (401 otherwise), `?fullRefresh=true` passthrough, error envelope `{ message, error, ...details }` with `syncError.statusCode || 500`. *(Axiom AX-MOD-V2BS-002)*
   - `lib/github-sync.ts` → `syncGitHubEvents(options)` — token/db guards, the stored-rate-limit pre-check (429), pagination cap (`maxPages = 7`, `per_page=40`), incremental stop-on-known-events, upsert-by-`_id`, `sync_metadata` checkpoint write, and the catch block that records failure metadata then rethrows.
   - `cron/github-sync.ts` — Lambda `handler` wraps `syncGitHubEvents()` and maps thrown `SyncGitHubEventsError.statusCode` into `{ statusCode, body }`.
2. **Public event read APIs** (must be DB-only — *Axiom AX-MOD-V2BS-001*; no `api.github.com` in the request path)
   - `pages/api/github/events.ts` — `GET`-only, filter parsing (`repo`, `action`, `date`, `description`), `payload.files` projection exclusion, pagination, response shape, empty-DB shape, db-null → 500.
   - `pages/api/github/filters.ts` — `GET`-only, repo aggregation + `distinct('type')`, db-null → 500.
3. **GitHub token fan-out endpoints** (these *do* call `api.github.com` — that's allowed; they are not the `/work` feed path)
   - `pages/api/github/pull-request.ts`, `pull-request/[number].ts`, `pull-request-files.ts`, `commit-files.ts`, `event/[id].ts` — happy path, 404 pass-through, missing-token behavior.
4. **Mongo client lifecycle** — `pages/api/lib/mongodb.ts` `getDatabase()` singleton (HMR-safe via `global._mongoClientPromise` in dev), DB-name selection from `MONGODB_NAME` with `NODE_ENV` fallback, and **null-not-throw** when `MONGODB_URI` is unset. *(Axiom AX-MOD-V2BS-003)*
5. **Auth boundary** — `pages/api/auth/[...nextauth].js` `signIn` callback enforces the 2-email allow-list (`brianstoker@gmail.com`, `brian@stokd.cloud`); `pages/api/hal/logs.js` returns 401 without a session. *(Axiom AX-MOD-V2BS-006)*
6. **HAL log viewer** — `pages/api/hal/logs.js` is a **session-gated S3 reader** (reads keys `logs.txt`/`errors.txt` from `S3_BUCKET_NAME`); test the auth gate, the `NoSuchKey → default message` path, and the 500-on-S3-error path. *(Not an inbound log-ingest endpoint — do not test it as one.)*
7. **Client cache contract** — `src/utils/eventCacheManager.ts` (`CACHE_VERSION = '5.0'`) and `src/utils/eventCachePruning.ts`: bumping `CACHE_VERSION` must invalidate stale `localStorage` caches. *(Axiom AX-MOD-V2BS-004)*
8. **Mobile UX regressions already covered** — keep `e2e/mobile/*` and the visual baselines green (see `TESTING.md` at repo root).

### 2.2 Edge cases worth pinning

| # | Case | Expected | Source |
|---|------|----------|--------|
| 1 | `POST /api/github/sync-events` with no/incorrect `Authorization` | **401** (not 500), `syncGitHubEvents` not invoked | `sync-events.ts:13-16` |
| 2 | `GET` to `sync-events` (or any non-POST) | **405** | `sync-events.ts:9-11` |
| 3 | `SYNC_SECRET` unset **and** client sends literal `Authorization: Bearer undefined` | **(GAP / security)** currently *authenticates* — the comparison is `\`Bearer ${undefined}\``. Pin this; harden so a missing secret always 401s | `sync-events.ts:14` |
| 4 | `syncGitHubEvents` with no token (no `options.githubToken`, no `GITHUB_TOKEN`) | throws `'GitHub token not configured'` (statusCode 500) | `github-sync.ts:58-60` |
| 5 | `syncGitHubEvents` when `getDatabase()` returns null | throws `'Database not available'` | `github-sync.ts:63-66` |
| 6 | Stored `github_rate_limits` core `remaining <= 10` and `reset` in future | throws 429 `'Rate limit too low, waiting for reset'` with `details.resetAt` | `github-sync.ts:92-103` |
| 7 | GitHub responds 403 with `x-ratelimit-remaining: 0` mid-sync | throws 429 `'Rate limit exceeded during sync'` | `github-sync.ts:152-161` |
| 8 | Incremental sync where first page's events are all `<= mostRecentEvent.created_at` | stops, `newEventCount: 0`, checkpoint still written | `github-sync.ts:173-194,350-369` |
| 9 | Duplicate event `id` arriving again | upsert by `_id: event.id`, no insert/throw | `github-sync.ts:310-323` |
| 10 | GitHub returns empty page | `shouldContinue=false`, loop ends, no infinite re-fetch | `github-sync.ts:170-171` |
| 11 | Pagination never exceeds `maxPages = 7` | hard cap honored | `github-sync.ts:118,121,328-333` |
| 12 | `GET /api/github/events` against empty collection | **200** with `{ events: [], total: 0, repositories: [], actionTypes: [], total_pages: 0, ... }` (not 500) | `events.ts:88-99` |
| 13 | `GET /api/github/events?action=Push` | filters `type: 'PushEvent'` (param is **`action`**, server appends `Event`) | `events.ts:50-52` |
| 14 | `GET /api/github/events?date=week` | `created_at >=` 7-day cutoff (also `today`/`yesterday`/`month`) | `events.ts:54-82` |
| 15 | `GET /api/github/events?per_page=99999` | **(GAP)** currently **not clamped** — passes straight to `.limit()`. Add a documented cap (e.g. 100) so a hostile query can't pull every doc and blow the Lambda timeout | `events.ts:103,111-117` |
| 16 | events response never includes `payload.files` | projection `{ 'payload.files': 0 }` enforced | `events.ts:111-117` |
| 17 | `getDatabase()` with `MONGODB_URI` unset | returns **`null`** (does **not** throw; logs a warning at module load) | `mongodb.ts:7-9,33-35` |
| 18 | `getDatabase()` DB name | `MONGODB_NAME` wins; else `brianstoker-production` (prod) / `brianstoker-local` | `mongodb.ts:38-40` |
| 19 | `GET /api/hal/logs` without a NextAuth session | **401** | `hal/logs.js:6-9` |
| 20 | `hal/logs` when S3 key missing (`NoSuchKey`) | returns `'No logs available yet.'` / `errors: null`, not 500 | `hal/logs.js:14-32` |
| 21 | NextAuth `signIn` with an email outside the 2-address allow-list | rejected | `auth/[...nextauth].js:12-16` |

> **Do not** write a "returns checkpoint when GitHub returns 304" test — `syncGitHubEvents`
> uses `cache: 'no-store'` and never sends `If-None-Match`, so there is no 304 path. (This
> was an error in the prior version of this plan.)

### 2.3 Integration points

- **MongoDB Atlas** — `brianstoker-local` / `brianstoker-production`, native driver, no ORM. Connections must carry a `brianstoker-*` `appName` (repo axiom *AX-REPO-MONGO-ATLAS-APPNAME*).
- **GitHub Events + REST API** — `GITHUB_TOKEN`, `GITHUB_USERNAME` (default user `brian-stoker`).
- **Google OAuth** via NextAuth.
- **AWS S3** — `pages/api/hal/logs.js` reads `S3_BUCKET_NAME`.
- **SST cron → Lambda → `syncGitHubEvents`** (EventBridge schedule in `stacks/cron.ts`).
- **OpenNext build output** consumed by API Gateway / CloudFront (see memory: Function URLs are broken in the current AWS account; prod serves via manual API Gateways).

---

## 3. Recommended Framework & Tooling

| Concern | Pick | Why |
|---------|------|-----|
| Unit / component | **Vitest** + **@testing-library/react** + **jsdom** | Native ESM/TS, reads `tsconfig.json` directly, no Babel (keeps `babel.config.js.bk` dead). Fastest fit for Next 15 + Turbopack. |
| API route handlers | **Vitest** + **node-mocks-http** | Pages-Router handlers are plain `(req, res) => …` — directly callable in-process. |
| MongoDB integration | **`mongodb-memory-server`** | Ephemeral `mongod` exercising the *real* native driver already in use — no mock divergence. |
| GitHub / S3 HTTP mocks | **MSW (node)** for `fetch`; **`aws-sdk-client-mock`** for `@aws-sdk/client-s3` | MSW intercepts the global `fetch` used in `github-sync.ts`; the AWS mock is only needed for `hal/logs.js`. |
| E2E | **Keep Playwright** | Already configured (`playwright.config.ts`), baselines committed. No migration. |
| Coverage | **Vitest `--coverage` (v8 provider)** | Native, no Istanbul/Babel hop. |
| Mutation (optional, P2) | **Stryker** scoped to `lib/github-sync.ts` only | The one piece of branchy pure-ish logic worth proving. |

> **Do not add Jest.** It would force the disabled Babel config back into the build.

### 3.1 Install footprint

```bash
pnpm add -D vitest @vitest/coverage-v8 @testing-library/react \
  @testing-library/jest-dom @testing-library/user-event jsdom \
  node-mocks-http mongodb-memory-server msw aws-sdk-client-mock
```

Add to `package.json` scripts (do **not** rename the existing `test` → it is wired into
docs and `mobile-ux-tests.yml` as Playwright; add a distinct `test:e2e` alias instead):

```jsonc
"test:unit": "vitest run",
"test:unit:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e": "playwright test"
```

Create `vitest.config.ts` with two projects (environments): `node` for `lib/**` +
`pages/api/**`, `jsdom` for `src/components/**`. Point `test.setupFiles` at
`test/setup.ts`.

---

## 4. File Organization & Naming

```
lib/
  github-sync.ts
  github-sync.test.ts          ← colocated pure-logic + DB-integration test (node env)
pages/api/github/
  events.ts
  __tests__/events.test.ts     ← handlers grouped in __tests__ (Pages-Router files ARE routes; don't colocate next to them)
  __tests__/sync-events.test.ts
  __tests__/filters.test.ts
pages/api/lib/
  __tests__/mongodb.test.ts
pages/api/hal/
  __tests__/logs.test.ts
src/components/GithubEvents/
  GithubEvents.tsx
  GithubEvents.test.tsx        ← colocated component test (jsdom env)
src/utils/
  eventCacheManager.test.ts
e2e/                           ← Playwright (existing)
  smoke-tests.spec.ts
  visual-regression.spec.ts
  mobile/*.spec.ts
  api/                         ← NEW: black-box HTTP specs against `pnpm dev`
    sync-events.spec.ts
test/
  setup.ts                     ← jest-dom matchers, MSW server lifecycle, console guard
  fixtures/
    github-events.json         ← canned GitHub Events API payloads (PII-stripped)
    github-pull-request.json
  msw/
    handlers.ts                ← GitHub REST mock handlers
  mongo.ts                     ← mongodb-memory-server start/seed/teardown helper
```

Conventions:
- `*.test.ts(x)` → **Vitest** (in-process unit/integration). `*.spec.ts` → **Playwright** (browser/HTTP). This split must stay clean: `playwright.config.ts` `testDir: './e2e'`, and Vitest must `exclude: ['e2e/**']`.
- One `describe` per exported symbol; test names start with a verb (`returns 401 when authorization header is missing`).
- No inline snapshots in unit tests (they rot). Snapshots are for Playwright visual regression only.

---

## 5. Mock / Stub Strategy

| Dependency | Strategy |
|------------|----------|
| `mongodb` driver | Real driver against **`mongodb-memory-server`** for `events`/`filters`/`github-sync` tests. **Do not mock the driver** — mocked queries drift from real `$group`/`projection`/`upsert` semantics. Tag the test client `appName: 'brianstoker-test'` to respect the Atlas-appName axiom. |
| `getDatabase()` | For pure handler-shape tests, `vi.mock('../lib/mongodb')` returning a memory-server-backed `Db`; for the null-path test, mock it to return `null` and assert the 500/guard. |
| GitHub REST API | **MSW** handlers in `test/msw/handlers.ts`. Capture fixtures from a real call, strip PII, commit under `test/fixtures/`. Set unmocked outbound `fetch` to **throw** in `test/setup.ts`. |
| `@aws-sdk/client-s3` | `aws-sdk-client-mock` — stub `GetObjectCommand` to resolve a body, reject `NoSuchKey`, or throw, for the three `hal/logs.js` paths. |
| `next-auth` (`getServerSession`) | `vi.mock('next-auth/next')` returning a canned session (or `null`) for `hal/logs.js`. For the `signIn` allow-list, import and call the callback from `authOptions` directly. |
| `process.env` | `vi.stubEnv()` per test (`SYNC_SECRET`, `GITHUB_TOKEN`, `MONGODB_URI`, `MONGODB_NAME`, `NODE_ENV`). Never mutate `process.env` directly. |
| Time | `vi.useFakeTimers()` for the rate-limit `reset > now` check and `_syncedAt`/`lastSync` assertions. |
| `console.*` | `test/setup.ts` should fail the test on unexpected `console.error`/`warn` (sync code is noisy — opt specific tests in via an allowlist helper). |

---

## 6. Coverage Targets

Priority is **critical**; weight by blast radius rather than chasing a uniform number.

| Area | Line | Branch | Notes |
|------|------|--------|-------|
| `lib/github-sync.ts` | **90%** | 85% | Branchy, high-value, the one thing that can burn GitHub rate limit or corrupt the feed. |
| `pages/api/github/**` | **80%** | 75% | Every handler: ≥1 happy path + ≥1 failure (auth/method/db-null). |
| `pages/api/lib/mongodb.ts` | 70% | — | Singleton reuse + DB-name selection + null path. |
| `pages/api/hal/logs.js` | 80% | — | Auth gate + NoSuchKey + error path. |
| `cron/github-sync.ts` | 90% | — | Tiny wrapper; assert statusCode mapping. |
| `src/utils/eventCache*.ts` | 70% | — | Version-mismatch invalidation + pruning shape. |
| `src/components/**` | 40% | — | Only logic-bearing ones: `GithubEvents/`, `GithubCalendar/`, `ProductSwitcher.tsx`, `home/NewsletterToast.tsx`. Skip pure-MUI styling components. |
| `pages/**` (non-API) | E2E only | — | Playwright covers rendered pages; don't unit-test them. |

CI gate: start by failing under **70% overall line coverage** *once unit tests exist*;
ratchet +5% per iteration. Do not enable a coverage gate before the first suite lands (it
would just fail at 0%).

---

## 7. First Test Cases to Implement (in order)

Each bullet is one small PR. Per Axiom 5 (TDD), write the test, **run it red**, then make
it green. **(GAP)** rows below are *expected to stay red until the implementation is added*
— that red is the point; do not weaken the test to fake green.

1. **`lib/github-sync.test.ts`** — `syncGitHubEvents()` (node env, MSW + memory-server)
   - throws `'GitHub token not configured'` when no token (no env, no option)
   - throws `'Database not available'` when `getDatabase()` returns null
   - throws 429 `'Rate limit too low, waiting for reset'` when stored `github_rate_limits` remaining ≤ 10 and reset in future
   - incremental: events `<=` stored `mostRecentEvent.created_at` are skipped; `newEventCount: 0`; checkpoint still written
   - duplicate event id upserts (one doc, no throw)
   - respects `maxPages = 7` (MSW serves ≥8 non-empty pages; assert exactly 7 fetched)
   - on a thrown error, `sync_metadata` records `success: false` with the message, then rethrows
2. **`pages/api/github/__tests__/sync-events.test.ts`** (node-mocks-http; mock `syncGitHubEvents`)
   - 405 on GET
   - 401 when `Authorization` missing or wrong; `syncGitHubEvents` **not** called
   - 200 with mocked happy-path result; `fullRefresh=true` query forwarded as `{ fullRefresh: true }`
   - 500 (or `syncError.statusCode`) with envelope `{ message, error, ...details }`
   - **(GAP)** missing `SYNC_SECRET` + `Authorization: Bearer undefined` must be rejected (harden `sync-events.ts:14`)
3. **`pages/api/github/__tests__/events.test.ts`** (memory-server seeded)
   - returns events sorted by `created_at` desc with `{ total, page, per_page, total_pages, syncMetadata }`
   - `?action=Push` narrows to `type: 'PushEvent'`
   - `?date=week` applies the 7-day cutoff
   - empty collection → 200 with `{ events: [], total: 0, repositories: [], actionTypes: [] }`
   - response never contains `payload.files` (projection)
   - 405 on POST; 500 when `getDatabase()` → null
   - **(GAP)** `?per_page=99999` clamps to the documented max (add the clamp in this PR)
4. **`pages/api/lib/mongodb.test.ts`**
   - `getDatabase()` returns `null` when `MONGODB_URI` unset (does not throw)
   - picks `MONGODB_NAME` when set; else `brianstoker-production` under `NODE_ENV=production`
   - reuses the same client promise across calls (singleton)
5. **`pages/api/hal/__tests__/logs.test.ts`** (mock `getServerSession` + `aws-sdk-client-mock`)
   - 401 when no session
   - returns `{ logs, errors }` when S3 returns bodies
   - `NoSuchKey` → `'No logs available yet.'` / `errors: null`; S3 throw → 500
6. **`cron/github-sync.test.ts`** — maps a thrown `SyncGitHubEventsError.statusCode` to `{ statusCode }`; success → 200 with `data` in body
7. **`src/components/GithubEvents/GithubEvents.test.tsx`** (jsdom, MSW)
   - renders loading state, then groups events by repo from a mocked `/api/github/events`
   - renders empty state when API returns `events: []`
8. **`src/utils/eventCacheManager.test.ts`** — a cache written under an old `CACHE_VERSION` is discarded on read (guards Axiom AX-MOD-V2BS-004)
9. **`e2e/api/sync-events.spec.ts`** (Playwright, real `pnpm dev`) — smoke: POST with valid `SYNC_SECRET` → 200; POST with bad bearer → 401
10. **CI wiring** — see §8

---

## 8. CI Integration

Two real problems to fix, in order:

1. **`mobile-ux-tests.yml` currently has all auto-triggers commented out** (`workflow_dispatch` only). Re-enable `pull_request` / `push` triggers — resolve the noted `dotenvx` dependency issue first so the `pnpm dev` web server boots in CI (the Playwright `webServer.command` is `pnpm dev`, which runs `dotenvx`).
2. Add a fast **unit + typecheck** job that runs on every push, *before* the (slower, browser) Playwright job, so logic failures fail fast and cheap:

```yaml
unit:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
      with: { version: 10 }
    - uses: actions/setup-node@v4
      with: { node-version: '18', cache: 'pnpm' }
    - run: pnpm install --frozen-lockfile
    - run: pnpm test:unit -- --reporter=github
    - run: pnpm typescript
    - run: pnpm knip --reporter=compact   # warn-only until baseline is clean
```

- Unit tests + typecheck on **every push**. Playwright on PRs. Visual-regression baseline updates stay PR-only and reviewed.
- Tests must use `mongodb-memory-server` and MSW — **no CI test may connect to Atlas or hit `api.github.com`** (rate limits would flake; secrets would leak).

---

## 9. Acceptance Checks for This Plan

This strategy is "applied" when:

- [ ] `pnpm test:unit` exists and runs ≥ 20 passing tests.
- [ ] `lib/github-sync.ts` has ≥ 90% line coverage.
- [ ] Every `pages/api/**` handler has ≥1 auth/method-failure test and ≥1 happy-path test.
- [ ] The two **(GAP)** hardenings land with their tests: `per_page` clamp in `events.ts`, and missing-`SYNC_SECRET` rejection in `sync-events.ts`.
- [ ] CI fails the build when `pnpm test:unit` or `pnpm typescript` errors, on every push.
- [ ] `mobile-ux-tests.yml` auto-triggers are re-enabled (or the workflow is replaced by one that gates merges).
- [ ] The existing Playwright suite + visual baselines still pass unchanged.
- [ ] No test connects to Atlas or `api.github.com` (memory-server + MSW only).

---

## 10. Explicit Non-Goals

- **No Jest** — it would reintroduce the deliberately-disabled `babel.config.js.bk`.
- **No Storybook** — MUI components are visually pinned by Playwright snapshots.
- **No real Google OAuth E2E** — mock `getServerSession` / the `signIn` callback at the boundary.
- **No live GitHub contract tests in CI** — rate limits flake; use committed fixtures via MSW.
- **No load testing** — single-tenant portfolio traffic does not justify it.
- **No multi-tenant / per-user test fixtures** — the product is single-operator (repo axiom *AX-REPO-SINGLE-TENANT*).

---

## 11. Axiom Cross-Reference

Tests here reinforce the local directory axioms (`.axioms.md`) — keep them in lockstep:

| Axiom | Guarded by test(s) |
|-------|--------------------|
| AX-MOD-V2BS-001 (Mongo-only read path) | `events.test.ts`, `filters.test.ts` assert DB reads only; `rg -F "api.github.com" pages/api/github/events.ts pages/api/github/filters.ts` → no match |
| AX-MOD-V2BS-002 (SYNC_SECRET bearer, 401/405) | `sync-events.test.ts` |
| AX-MOD-V2BS-003 (getDatabase singleton) | `mongodb.test.ts` |
| AX-MOD-V2BS-004 (bump CACHE_VERSION on shape change) | `eventCacheManager.test.ts`; reviewer check on any `events.ts` response change |
| AX-MOD-V2BS-007 (guard strings + `maxPages = 7` are observable) | `github-sync.test.ts` asserts the exact strings `'GitHub token not configured'`, `'Database not available'`, and the 7-page cap |
