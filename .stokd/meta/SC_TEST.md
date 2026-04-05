# SC_TEST — Testing Strategy: v2.brianstoker.com

**Package:** Monorepo root (`/`)
**Priority:** Critical
**Last updated:** 2026-03-21

---

## 1. Test Framework & Tooling

### Current state
- **Playwright** (`@playwright/test ^1.56.1`) — only test framework currently installed
- **No unit/integration test runner** (Jest, Vitest, etc.) is present; `pnpm test` invokes Playwright exclusively

### Recommended additions

| Layer | Tool | Rationale |
|---|---|---|
| Unit / Integration | **Vitest** | Zero-config TS support, same syntax as Jest, runs in Node without a browser — ideal for API handlers, `lib/github-sync.ts`, and pure utilities |
| Component | **Vitest + React Testing Library** | Lightweight, no server needed, works with Next.js Pages Router |
| API route | **Vitest + node-mocks-http** (or MSW) | Mock `NextApiRequest/Response` without spinning up the full server |
| E2E (existing) | **Playwright** | Already configured; keep and expand |

Add to `devDependencies`:
```
vitest, @vitest/coverage-v8, @testing-library/react, @testing-library/user-event,
@testing-library/jest-dom, msw, node-mocks-http
```

---

## 2. Coverage Targets (Critical Priority)

| Layer | Target | Rationale |
|---|---|---|
| `lib/github-sync.ts` | **90 %** | Core data pipeline; bugs here silently corrupt the DB |
| `pages/api/github/*.ts` | **85 %** | All API routes are public entry points |
| `src/utils/githubEmoji.ts` | **100 %** | Pure function, trivial to cover |
| `src/components/GithubEvents/` | **70 %** | UI components — render + interaction paths |
| E2E smoke suite | all pages load, no horizontal scroll | Already in place |
| E2E visual regression | key viewports per component | Already in place |

---

## 3. What to Test — Critical Paths

### 3.1 `lib/github-sync.ts` — `syncGitHubEvents()`

This is the highest-risk function: it calls GitHub, writes to MongoDB, handles pagination (max 7 pages), enriches PRs/pushes, and updates `sync_metadata`. Bugs here are silent and accumulate.

**Test cases to implement first:**

```
tests/unit/github-sync.test.ts
```

| Case | What to assert |
|---|---|
| Missing `GITHUB_TOKEN` | throws `SyncGitHubEventsError` with `statusCode = 500` |
| DB unavailable (`getDatabase` returns `null`) | throws with message `'Database not available'` |
| Rate limit pre-check: `remaining <= 10` before sync | throws 429, body contains `resetAt` |
| Incremental mode: all events on page 1 are older than `mostRecentEvent` | exits after page 1, `newEventCount = 0`, `duplicatesSkipped = N` |
| Incremental mode: mix of new and old events on page 1 | stops after page 1, inserts only new events |
| Full refresh: clears collection, inserts all fetched events | `deleteMany` called once, `mode = 'full_refresh'` |
| GitHub returns 403 with `x-ratelimit-remaining: 0` | throws 429 |
| GitHub returns non-OK, non-403 status | throws generic `SyncGitHubEventsError` |
| GitHub returns empty array on page 1 | terminates immediately, `pagesChecked = 1`, `newEventCount = 0` |
| `maxPages` cap (7 pages) | stops at page 7 even if more data exists |
| PR enrichment on pages 1-2: enriches `PullRequestEvent` | fetch called for `/pulls/:number`, `/pulls/:number/commits`, `/pulls/:number/files` |
| PR enrichment: 404 on PR | skips silently, event still stored |
| PR enrichment: 403 rate limit mid-enrichment | sets `rateLimitHit`, stops further PR enrichment |
| Push enrichment pages 1-2: no `payload.size` + compare API available | sets `payload.size` from `total_commits` |
| Push enrichment pages 3+: no `payload.size` | sets `payload.size = 1`, does NOT call compare API |
| `sync_metadata` written on success | `upsert` called with `success: true`, `totalEventCount` |
| `sync_metadata` written on error | `upsert` called with `success: false`, `error` message |

**Mock strategy:** Use `vi.stubGlobal('fetch', vi.fn())` for GitHub HTTP calls. Use an in-memory mock for MongoDB (`Collection` with a stub object satisfying the used methods: `createIndex`, `findOne`, `find`, `updateOne`, `deleteMany`, `countDocuments`, `aggregate`, `distinct`). Do NOT hit real MongoDB or GitHub in unit tests.

### 3.2 API Route: `pages/api/github/events.ts`

```
tests/unit/api/events.test.ts
```

| Case | Expected response |
|---|---|
| `GET` — happy path, no filters | 200 with `{ events, total, page, per_page, total_pages, syncMetadata }` |
| `GET` with `?repo=owner/name` | MongoDB query contains `{ 'repo.name': 'owner/name' }` |
| `GET` with `?action=PullRequest` | query contains `{ type: 'PullRequestEvent' }` |
| `GET` with `?date=today` | `created_at.$gte` is today midnight ISO |
| `GET` with `?date=week` | `created_at.$gte` is 7 days ago |
| `GET` with `?date=yesterday` | `created_at.$gte` is yesterday midnight ISO |
| `GET` with `?description=fix` | in-memory filter applied to matching events |
| `GET` — `totalCount = 0` | 200 with `events: [], total: 0, total_pages: 0` |
| Non-`GET` method (`POST`) | 405 |
| DB unavailable | 500 with `{ message: 'Database not available' }` |
| DB throws | 500 with `message: 'Error fetching GitHub events'` |
| Pagination: `?page=2&per_page=10` | `skip = 10`, `limit = 10` passed to MongoDB |

### 3.3 API Route: `pages/api/github/sync-events.ts`

```
tests/unit/api/sync-events.test.ts
```

| Case | Expected response |
|---|---|
| `POST` + correct `Authorization: Bearer <SYNC_SECRET>` | calls `syncGitHubEvents()`, returns 200 |
| `POST` + wrong/missing auth header | 401 |
| Non-`POST` method | 405 |
| `?fullRefresh=true` | calls `syncGitHubEvents({ fullRefresh: true })` |
| `syncGitHubEvents` throws with `statusCode = 429` | returns 429 with error body |
| `syncGitHubEvents` throws without `statusCode` | returns 500 |

### 3.4 API Route: `pages/api/github/filters.ts`

```
tests/unit/api/filters.test.ts
```

| Case | Expected |
|---|---|
| `GET` — happy path | 200, response includes `repositories`, `repositoryStats`, `actionTypes`, `lastUpdated` |
| `actionTypes` strips `Event` suffix | `'PushEvent'` becomes `'Push'` in output |
| Non-`GET` method | 405 |
| DB unavailable | 500 |

### 3.5 Pure utility: `src/utils/githubEmoji.ts` — `replaceGithubEmoji()`

```
tests/unit/utils/githubEmoji.test.ts
```

| Case | Input | Expected output |
|---|---|---|
| Standard shortcode | `':rocket:'` | `'🚀'` |
| Extra shortcode (EXTRA_EMOJI map) | `':pencil:'` | `'📝'` |
| Extra shortcode | `':adhesive_bandage:'` | `'🩹'` |
| Extra shortcode | `':monocle_face:'` | `'🧐'` |
| Unknown shortcode | `':nonexistent:'` | `':nonexistent:'` (unchanged) |
| Empty string | `''` | `''` |
| No shortcodes | `'hello world'` | `'hello world'` |
| Mixed text + shortcodes | `':pencil: fix typo'` | `'📝 fix typo'` |
| Multiple shortcodes | `':rocket: :pencil:'` | `'🚀 📝'` |

### 3.6 Component: `src/components/GithubEvents/PushEvent.tsx`

```
tests/components/PushEvent.test.tsx
```

| Case |
|---|
| Renders `null` when `event.date` is undefined |
| Shows branch name stripped of `refs/heads/` prefix |
| Shows commit count chip (`N commits`) |
| Single commit uses commit message as summary (not "Pushed N commits") |
| Multiple commits: summary is `"Pushed N commits to <branch>"` |
| Commit row expands on first click when body exists |
| Commit row navigates on second click when expanded |
| Commit row navigates on first click when no body |
| SHA copy button shows 7-char SHA, triggers clipboard write on click |
| Falls back to `event.payload.commits` when `event.commitsList` is empty |

### 3.7 Component: `src/components/GithubEvents/PullRequestEvent.tsx`

```
tests/components/PullRequestEvent.test.tsx
```

| Case |
|---|
| Renders `null` when `event.date` is undefined |
| Renders `null` when `event.payload.pull_request` is missing |
| Shows loading spinner while fetching PR details |
| Uses pre-enriched data (`_enriched: true`) without making a fetch call |
| Skips fetch for deleted/closed PRs, uses empty commits/files |
| Fetches from `/api/github/pull-request` for open unenriched PRs |
| Shows error state when fetch fails |
| Renders PR title with link to `html_url` |
| Head/base branch chips present |
| Tab switch between Commits and Files changes visible content |
| `handleCheckout` copies git checkout command to clipboard |

---

## 4. Test File Organization

```
/
├── e2e/                              <- Playwright (existing)
│   ├── smoke-tests.spec.ts
│   ├── visual-regression.spec.ts
│   ├── mobile/
│   │   ├── footer-responsive.spec.ts
│   │   ├── header-navigation.spec.ts
│   │   ├── newsletter-toast.spec.ts
│   │   ├── product-carousel.spec.ts
│   │   └── showcase-code-toggle.spec.ts
│   └── utils/
│       └── viewport-helpers.ts
│
└── tests/                            <- NEW (Vitest)
    ├── vitest.config.ts
    ├── setup.ts                      <- @testing-library/jest-dom + global mocks
    ├── unit/
    │   ├── github-sync.test.ts       <- lib/github-sync.ts (highest priority)
    │   ├── utils/
    │   │   └── githubEmoji.test.ts
    │   └── api/
    │       ├── events.test.ts
    │       ├── sync-events.test.ts
    │       └── filters.test.ts
    └── components/
        ├── PushEvent.test.tsx
        └── PullRequestEvent.test.tsx
```

### Naming convention

- Unit/integration: `<module-name>.test.ts`
- Component: `<ComponentName>.test.tsx`
- Playwright E2E: `<feature>.spec.ts` (existing convention, keep it)

---

## 5. Mock / Stub Strategy

### GitHub API (global fetch)
```ts
// tests/unit/github-sync.test.ts
import { vi } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Per-test example:
mockFetch.mockResolvedValueOnce({
  ok: true,
  status: 200,
  headers: new Headers({
    'x-ratelimit-remaining': '4999',
    'x-ratelimit-limit': '5000',
    'x-ratelimit-reset': '0',
    'x-ratelimit-resource': 'core',
  }),
  json: () => Promise.resolve([] as GitHubEvent[]),
  text: () => Promise.resolve(''),
});
```

### MongoDB (in-memory stub — no real driver)
Do NOT mock at the driver level. Create a lightweight stub object:
```ts
const makeCollection = (docs: any[] = []) => ({
  createIndex: vi.fn().mockResolvedValue({}),
  findOne: vi.fn().mockResolvedValue(docs[0] ?? null),
  find: vi.fn().mockReturnValue({
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    toArray: vi.fn().mockResolvedValue(docs),
  }),
  updateOne: vi.fn().mockResolvedValue({ upsertedCount: 1 }),
  deleteMany: vi.fn().mockResolvedValue({}),
  countDocuments: vi.fn().mockResolvedValue(docs.length),
  aggregate: vi.fn().mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }),
  distinct: vi.fn().mockResolvedValue([]),
});

// In the test module setup:
vi.mock('../pages/api/lib/mongodb', () => ({
  getDatabase: vi.fn().mockResolvedValue({
    collection: vi.fn().mockImplementation((name: string) => makeCollection()),
  }),
}));
```

### Next.js API routes (via `node-mocks-http`)
```ts
import { createMocks } from 'node-mocks-http';

const { req, res } = createMocks({
  method: 'GET',
  query: { repo: 'owner/name', action: 'PullRequest' },
});

await handler(req as any, res as any);

expect(res._getStatusCode()).toBe(200);
const body = res._getJSONData();
expect(body.events).toBeDefined();
```

### React components
Use `@testing-library/react` with `render()`. Mock `navigator.clipboard.writeText` globally:
```ts
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
});
```
Mock `fetch` for components that call `/api/github/...` via `vi.stubGlobal('fetch', vi.fn())`.

---

## 6. Vitest Configuration

```ts
// tests/vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',           // component tests need DOM
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'lib/**/*.ts',
        'pages/api/**/*.ts',
        'src/utils/**/*.ts',
        'src/components/GithubEvents/**/*.tsx',
      ],
      exclude: ['**/*.d.ts', '**/node_modules/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
});
```

Add scripts to `package.json`:
```json
"test:unit":          "vitest run --config tests/vitest.config.ts",
"test:unit:watch":    "vitest --config tests/vitest.config.ts",
"test:unit:coverage": "vitest run --config tests/vitest.config.ts --coverage"
```

---

## 7. E2E Gaps to Address (Playwright)

The existing Playwright suite is solid for layout/responsive behaviour. These API-level and data-flow tests are currently missing:

| Missing test | Suggested file |
|---|---|
| `/api/github/events` returns 200 with valid shape | `e2e/api/events-api.spec.ts` |
| `/api/github/events?repo=X&action=Y&date=week` filters produce correct results | same |
| `/api/github/filters` returns 200 with correct shape | `e2e/api/filters-api.spec.ts` |
| Sync endpoint rejects request without `Authorization` header | `e2e/api/sync-auth.spec.ts` |
| GitHub events section renders on homepage (non-empty) | `e2e/github-events.spec.ts` |

---

## 8. Implement in This Order

1. **`tests/unit/utils/githubEmoji.test.ts`** — zero dependencies, proves the runner works
2. **`tests/unit/github-sync.test.ts`** — highest risk, most branching logic
3. **`tests/unit/api/sync-events.test.ts`** — thin handler, fast to write
4. **`tests/unit/api/events.test.ts`** — query-building and date-filter logic
5. **`tests/unit/api/filters.test.ts`** — aggregation shape and `Event` suffix stripping
6. **`tests/components/PushEvent.test.tsx`** — most render/interaction logic
7. **`tests/components/PullRequestEvent.test.tsx`** — async fetch + tab state
8. **E2E API tests** — run against `pnpm dev`, require a live DB connection
