# SC_TEST.md — brianstoker.com

Testing strategy for the Next.js 15 portfolio + GitHub-activity site (Workspace-wide, priority: **critical**).
Package root: `/opt/worktrees/v2.brianstoker.com/v2.brianstoker.com-main`.

## 1. Current State

| Layer | Tooling | Status |
|-------|---------|--------|
| E2E (browser) | Playwright 1.56 (`e2e/`) | Mature — 7 spec files, 9 viewport projects |
| Visual regression | Playwright snapshots (`e2e/visual-regression.spec.ts`) | Baseline committed |
| Unit / component tests | — | **None** |
| API route tests | — | **None** |
| Integration (DB + handlers) | — | **None** |
| Type checking | `pnpm typescript` | Build bypasses TS (`NEXT_SKIP_TYPECHECKING=1`) |
| Dead code | `pnpm knip` | Available |
| Link validation | `pnpm link-check` | Available |

The critical gap is the **server-side surface**: `pages/api/**`, `lib/github-sync.ts`, `pages/api/lib/mongodb.ts`, and the SST cron handler are completely untested despite being the only stateful, money-spending parts of the system.

## 2. What Must Be Tested

### 2.1 Critical paths (P0 — block release if red)

1. **GitHub event sync pipeline**
   - `pages/api/github/sync-events.ts` — auth (Bearer `SYNC_SECRET`), method gating (POST only), `fullRefresh=true` branch, error envelope.
   - `lib/github-sync.ts` — pagination, dedup against `github_events` collection, `sync_metadata` checkpoint write, GitHub 304/429/5xx handling.
   - Cron entry (`cron/` + `stacks/`) — invokes the same code path Lambda will run.
2. **Public event API**
   - `pages/api/github/events.ts` — query filter parsing, MongoDB projection, pagination bounds, response shape.
   - `pages/api/github/filters.ts` — distinct repo / type aggregation.
   - `pages/api/github/pull-request.ts`, `pull-request-files.ts`, `commit-files.ts` — GitHub token fan-out, 404 pass-through.
3. **Mongo client lifecycle** — `pages/api/lib/mongodb.ts` singleton must not leak connections in dev HMR; `getDatabase()` must pick the correct DB per `NODE_ENV`.
4. **Auth boundary** — `pages/api/auth/[...nextauth].js` Google OAuth callback shape, session JWT not leaking server-only env.
5. **Log shipping** — `pages/api/hal/logs.js` rate-limit + payload size guard (it accepts arbitrary client POSTs).
6. **Mobile UX regressions already covered** — keep `e2e/mobile/*` green (see `TESTING.md`).

### 2.2 Edge cases worth pinning

- Sync endpoint called without `SYNC_SECRET` env set → must 401, not 500.
- `MONGODB_URI` missing → fail fast at module load with a readable error.
- GitHub API returns empty page → checkpoint still advances; no infinite re-fetch.
- Event with duplicate `id` arriving twice (GitHub retries) → upsert, not insert.
- `/api/github/events` with `?limit=99999` → clamp, not OOM.
- `pages/api/hal/logs.js` POST > 1 MB → reject.
- NextAuth callback with unverified Google email → reject.
- Products carousel with `prefers-reduced-motion` → no auto-advance.
- Static export build (`pnpm build:static`) — pages with `getServerSideProps` must not silently fall back.

### 2.3 Integration points

- **MongoDB Atlas** (`brianstoker-local` / `brianstoker-production`)
- **GitHub Events API** (`GITHUB_TOKEN`, `GITHUB_USERNAME`)
- **Google OAuth** (NextAuth)
- **SST cron → Lambda → API route**
- **OpenNext build output** consumed by CloudFront

## 3. Recommended Framework & Tooling

| Concern | Pick | Why |
|---------|------|-----|
| Unit / component | **Vitest** + **@testing-library/react** + **jsdom** | Native ESM, fastest in the Next 15 + Turbopack ecosystem; no Babel config to maintain (`babel.config.js.bk` is already disabled). |
| API route handlers | **Vitest** + **node-mocks-http** | Pages-Router handlers are plain `(req, res) => …` functions — trivially callable in-process. |
| MongoDB integration | **`mongodb-memory-server`** | Spins an ephemeral mongod; matches the native driver already in use (no ORM mismatch). |
| HTTP mocks (GitHub API) | **MSW (node)** | Intercepts `fetch`, survives Next's polyfill. |
| E2E | **Keep Playwright** (already configured) | No reason to migrate. |
| Coverage | **Vitest `--coverage` (v8 provider)** | Native, no Istanbul/Babel hop. |
| Mutation (optional, P2) | **Stryker** on `lib/github-sync.ts` only | High value on the one piece of pure logic worth proving correct. |

> Do **not** add Jest. The project has no active Babel config (`babel.config.js.bk`); Jest would force one back. Vitest reads `tsconfig.json` directly.

### 3.1 Install footprint

```bash
pnpm add -D vitest @vitest/coverage-v8 @testing-library/react \
  @testing-library/jest-dom @testing-library/user-event jsdom \
  node-mocks-http mongodb-memory-server msw
```

Add to `package.json` scripts:

```jsonc
"test:unit": "vitest run",
"test:unit:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e": "playwright test",   // rename existing "test"
"test": "pnpm test:unit && pnpm test:e2e --grep @smoke"
```

## 4. File Organization & Naming

```
src/
  components/Foo/
    Foo.tsx
    Foo.test.tsx              ← colocated unit/component
lib/
  github-sync.ts
  github-sync.test.ts         ← colocated pure-logic test
pages/api/github/
  events.ts
  __tests__/events.test.ts    ← API handlers grouped (Pages Router files are routes; don't colocate)
e2e/
  smoke-tests.spec.ts         ← existing
  mobile/*.spec.ts            ← existing
  api/                        ← NEW: black-box HTTP tests against `pnpm dev`
    sync-events.spec.ts
    events.spec.ts
test/
  setup.ts                    ← jest-dom matchers, MSW server start
  fixtures/
    github-events.json        ← canned GitHub API payloads
    mongo-events.ts           ← seed helpers
  msw/
    handlers.ts               ← GitHub API mock handlers
```

Conventions:
- `*.test.ts(x)` → Vitest (unit/integration in-process).
- `*.spec.ts` → Playwright (browser/HTTP).
- One `describe` per exported symbol; test names start with a verb (`returns 401 when…`).
- No snapshots in unit tests — they rot. Snapshots only for Playwright visual regression.

## 5. Mock / Stub Strategy

| Dependency | Strategy |
|------------|----------|
| `mongodb` driver | Real driver against `mongodb-memory-server` for sync/query tests. **Do not mock the driver itself** — past incidents in similar repos came from mocked queries that diverged from real behavior. |
| GitHub REST API | MSW handlers in `test/msw/handlers.ts`. Fixtures captured from a real call, stripped of PII, committed under `test/fixtures/`. |
| `process.env` | Use `vi.stubEnv()` per test; never mutate `process.env` directly. |
| `next-auth` session | `vi.mock('next-auth/react')` returning canned `useSession` results. For server callbacks, build the JWT manually with the same secret. |
| AWS SDK (`@aws-sdk/client-s3`) | `aws-sdk-client-mock` only when an API route actually calls S3 (currently rare). |
| Network in unit tests | MSW intercepts everything; any unmocked outbound fetch should throw in test setup. |
| Time | `vi.useFakeTimers()` for sync checkpoint / TTL logic. |
| `console.error` / `console.warn` | Fail the test if any are emitted unexpectedly (helper in `test/setup.ts`). |

## 6. Coverage Targets

Priority is **critical**, but coverage is not uniform — weight by blast radius:

| Area | Line | Branch | Notes |
|------|------|--------|-------|
| `lib/github-sync.ts` | **90%** | 85% | Pure logic, easy + high-value. |
| `pages/api/**` | **80%** | 75% | Every handler must have at least one happy-path + one auth-fail test. |
| `pages/api/lib/mongodb.ts` | 70% | — | Singleton behavior + env selection. |
| `src/components/**` (presentational) | 40% | — | Skip pure-MUI styling components; only test ones with logic (`GithubEvents`, `GithubCalendar`, `ProductSwitcher`, `NewsletterToast`). |
| `src/products.tsx` | smoke only | — | Data file; type-check is enough. |
| `pages/**` (non-API) | E2E only | — | Don't unit-test pages; Playwright covers them. |

Fail CI under **70% overall line coverage** once unit tests exist; ratchet up by 5% each sprint.

## 7. First Test Cases to Implement (in order)

These are the highest-ROI tests to write first. Each is small enough to land in one PR.

1. **`lib/github-sync.test.ts`** — `syncGitHubEvents()`
   - returns checkpoint when GitHub returns 304
   - upserts duplicate event ids without throwing
   - respects `fullRefresh: true` (ignores stored checkpoint)
   - propagates 429 as `SyncGitHubEventsError` with `statusCode: 429`
2. **`pages/api/github/__tests__/sync-events.test.ts`**
   - 405 on GET
   - 401 when `Authorization` header missing or wrong
   - 401 when `SYNC_SECRET` env unset (currently 500 — fix while adding the test)
   - 200 with happy-path mocked `syncGitHubEvents`
   - 500 with error envelope including `error.message`
3. **`pages/api/github/__tests__/events.test.ts`** (against `mongodb-memory-server`)
   - returns paginated events sorted by `created_at` desc
   - `?type=PushEvent` filter narrows results
   - `?limit=10000` clamps to documented max
   - empty DB returns `{ events: [], total: 0 }`, not 500
4. **`pages/api/lib/mongodb.test.ts`**
   - reuses client across calls in dev (singleton)
   - selects `brianstoker-production` when `NODE_ENV=production`
   - throws readable error when `MONGODB_URI` is unset
5. **`pages/api/hal/__tests__/logs.test.ts`**
   - rejects payloads > size limit
   - rejects non-POST
   - sanitizes / size-bounds before write
6. **`src/components/GithubEvents.test.tsx`**
   - renders skeleton while loading
   - renders empty state when API returns `events: []`
   - groups events by repo
7. **`e2e/api/sync-events.spec.ts`** (Playwright, real `pnpm dev`)
   - smoke: POST with valid `SYNC_SECRET` returns 200 against the dev server
8. **CI wiring** — add `pnpm test:unit` to the existing GitHub Actions workflow (`.github/workflows/mobile-ux-tests.yml`) **before** Playwright runs, so unit failures fail fast.

## 8. CI Integration

Extend `.github/workflows/mobile-ux-tests.yml`:

```yaml
- name: Unit tests
  run: pnpm test:unit -- --reporter=github
- name: Type check
  run: pnpm typescript
- name: Knip (dead code)
  run: pnpm knip --reporter=compact
- name: Playwright
  run: pnpm test:e2e
```

Run unit tests on **every push**, not just PRs. Visual-regression baselines stay PR-only.

## 9. Acceptance Checks for This Plan

A future agent should consider this strategy applied when:

- [ ] `pnpm test:unit` exists and runs ≥ 20 passing tests.
- [ ] `lib/github-sync.ts` has ≥ 90% line coverage.
- [ ] Every `pages/api/**` handler has at least one auth-failure and one happy-path test.
- [ ] CI fails the build when `pnpm test:unit` or `pnpm typescript` reports errors.
- [ ] The existing Playwright suite still passes unchanged.
- [ ] `mongodb-memory-server` is used in tests; no test connects to Atlas.

## 10. Explicit Non-Goals

- No Storybook. The MUI components are visually validated by Playwright snapshots already.
- No E2E auth flow against real Google. Mock NextAuth at the boundary.
- No load testing. The traffic profile (single-tenant portfolio) does not justify it.
- No contract tests against GitHub's real API in CI — rate limits would flake.
