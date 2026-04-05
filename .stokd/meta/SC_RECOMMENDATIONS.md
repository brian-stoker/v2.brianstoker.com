---
meta_version: 0.2.0
generated: 2026-03-21
scope: full codebase
---

# SC_RECOMMENDATIONS

Actionable recommendations for `v2.brianstoker.com`. Organized by category, ordered by priority within each section.

---

## 1. Security

### 1.1 XSS via Unsanitized Markdown (CRITICAL)

**Files:** `src/components/GithubEvents/PullRequestEvent.tsx:432`, `src/components/GithubEvents/IssueCommentEvent.tsx:190`, `src/components/GithubEvents/PushEvent.tsx:168`, `src/components/GithubEvents/IssuesEvent.tsx:174`

All four files render GitHub-sourced markdown directly into the DOM:

```tsx
dangerouslySetInnerHTML={{ __html: renderMarkdown(prDetails.body) }}
```

`marked()` alone does not sanitize HTML. A malicious PR body, issue body, or commit message containing `<script>` tags or event handlers would execute in the browser. Add `dompurify` (or the server-side `isomorphic-dompurify`) and pipe `marked()` output through `DOMPurify.sanitize()` before rendering.

### 1.2 Overly Permissive IAM Role (HIGH)

**File:** `stacks/site.ts:44-48`

```ts
permissions: [{ actions: ["*"], resources: ["*"] }]
```

The Lambda function backing the Next.js site has admin-level IAM permissions. Scope this to the specific services actually needed: S3 (for the HAL bucket), and nothing else for the website handler. The sync cron has its own permissions. Principle of least privilege prevents any SSRF or credential-exfiltration attack from escalating to full AWS account compromise.

### 1.3 Unauthenticated GitHub Token Proxy (HIGH)

**Files:** `pages/api/github/pull-request.ts`, `pages/api/github/pull-request/[number].ts`, `pages/api/github/commit-files.ts`, `pages/api/github/pull-request-files.ts`

All four endpoints proxy requests to the GitHub API using the server's `GITHUB_TOKEN` with no authentication gate. Any anonymous visitor can call these endpoints and exhaust the GitHub API rate limit (5000 req/hr). They can also look up details on any repo accessible by the token. Add authorization (session check via `getServerSession`) or at minimum rate-limit these endpoints per IP.

### 1.4 No Rate Limiting on Public Read APIs (MEDIUM)

**Files:** `pages/api/github/events.ts`, `pages/api/github/filters.ts`

Both endpoints hit MongoDB on every request with no throttling or HTTP cache headers. A bot or misconfigured client can issue unlimited requests. Add `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` headers to `filters.ts` (data changes hourly at most) and `s-maxage=30` to `events.ts`. This also reduces MongoDB load significantly.

### 1.5 Unvalidated Pagination Parameters (LOW)

**File:** `pages/api/github/events.ts:102-104`

`parseInt(page as string)` and `parseInt(per_page as string)` have no bounds checking. A request with `per_page=999999` would attempt a massive MongoDB scan. Add `Math.min(Math.max(perPage, 1), 100)` and similar for page to constrain inputs.

---

## 2. Code Quality

### 2.1 `renderMarkdown` Duplicated in Four Files

**Files:** `src/components/GithubEvents/PullRequestEvent.tsx:25`, `src/components/GithubEvents/IssueCommentEvent.tsx:13`, `src/components/GithubEvents/PushEvent.tsx:22`, `src/components/GithubEvents/IssuesEvent.tsx:16`

Identical function copy-pasted verbatim. Extract to `src/utils/renderMarkdown.ts`. This also makes it easier to add sanitization in one place (see 1.1).

### 2.2 Duplicate Pull Request API Routes

**Files:** `pages/api/github/pull-request.ts` and `pages/api/github/pull-request/[number].ts`

Both routes fetch the same PR data (PR details + commits + files) from the GitHub API. They differ only in how the parameters arrive (`owner/repo/pull_number` query params vs. `[number]` + `repo` query param). One should be removed, or they should share a common implementation module.

### 2.3 Loose `any` Typing on GitHub Payloads

**File:** `src/types/github.ts:18,26`

`payload: any` and `commitsList: any[]` cascade `any` throughout the GithubEvents component tree, disabling type safety for the most complex data in the app. Define discriminated union types per event type (at minimum `PushEventPayload`, `PullRequestEventPayload`, `IssuesEventPayload`) and narrow in the component switch/if chains.

### 2.4 MongoDB `as any` Casts on `_id` Queries

**Files:** `lib/github-sync.ts:79`, `pages/api/github/event/[id].ts:25`, `pages/api/github/events.ts:39`

Multiple `findOne({} as any)` and `{ _id: 'github_events_sync' } as any` casts hide potential type errors. Use the MongoDB driver's `WithId<Document>` and `Filter<Document>` types properly, or create typed collection wrappers.

### 2.5 TypeScript Dev Pre-release Version

**File:** `package.json:191`

```json
"typescript": "6.0.0-dev.20251014"
```

Using a dev pre-release TypeScript build in production tooling is risky — compiler bugs and breaking API changes are expected. Downgrade to the latest stable `5.x` release.

### 2.6 Type Checking Skipped in Builds

**File:** `package.json:11` (`NEXT_SKIP_TYPECHECKING=1`)

Type errors are completely invisible during CI builds. Run `pnpm typescript` as a required pre-build step or in CI. Errors caught now in `src/types/github.ts` and API routes confirm this is masking real issues.

### 2.7 `prop-types` Dependency

**File:** `package.json:112`

`prop-types` is a runtime validation library from the React 15 era, superseded by TypeScript. It adds ~6KB to the bundle with no benefit in a fully typed codebase. Remove it.

---

## 3. Architecture

### 3.1 In-Memory Description Filter Breaks Pagination

**File:** `pages/api/github/events.ts:114-130`

The description filter is applied **after** MongoDB skip/limit pagination. This means a page of 40 results can silently return fewer items when the filter eliminates matches, and total count reported to the client is wrong (it reflects unfiltered total). Either:
- Add description as a MongoDB text-search filter (requires a text index on relevant fields), or
- Document the limitation and fetch a larger page server-side before applying the in-memory filter

### 3.2 MongoDB Index Creation on Every Sync

**File:** `lib/github-sync.ts:70-73`

```ts
await eventsCollection.createIndex({ created_at: -1 });
await eventsCollection.createIndex({ id: 1 }, { unique: true });
// ...
```

`createIndex` is called on every hourly sync. While MongoDB no-ops if the index exists, it still incurs a round-trip. Move index initialization to a one-time setup script (`scripts/`) or call it conditionally (e.g., only on full refresh or first run).

### 3.3 No HTTP Caching on Read-Only API Routes

**Files:** `pages/api/github/events.ts`, `pages/api/github/filters.ts`

Neither route sets `Cache-Control` response headers. CloudFront (via SST/OpenNext) cannot cache these responses, so every request hits Lambda + MongoDB. `filters.ts` data changes at most hourly; `events.ts` changes at most hourly. Adding `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` would dramatically reduce cold-path load.

### 3.4 Cron Job Calls HTTP Instead of Importing Sync Logic Directly

**File:** `stacks/cron.ts:6` — cron calls `${siteUrl}/api/github/sync-events` via HTTP

The Lambda cron invokes the sync by making an HTTP POST to the Next.js API, which requires the web layer to be running and reachable. For non-`production` stages (`siteUrl` falls back to `localhost:5040`), the cron will silently fail. The cron Lambda already imports `lib/github-sync.ts` indirectly — it could call `syncGitHubEvents()` directly, eliminating the HTTP hop and the secret-based auth requirement.

### 3.5 Cold-Start MongoDB Connection in Production Lambda

**File:** `pages/api/lib/mongodb.ts:23-27`

In production mode, `new MongoClient(uri)` and `client.connect()` run on module load. Lambda reuses execution contexts between invocations but does not guarantee it, so each cold start pays full connection establishment time. Consider using `global` caching in all environments (same pattern as dev), or use MongoDB Atlas connection pooling with a short `maxPoolSize`.

---

## 4. Performance

### 4.1 Images Completely Unoptimized

**File:** `next.config.mjs:12`

```js
images: { unoptimized: true }
```

Next.js image optimization is disabled globally. Large images (resume PDF previews, photography gallery, product icons) are served at full resolution to all devices. Removing this flag and using `<Image>` with `sizes` would cut bandwidth significantly for mobile users. If optimization infra is a concern, at minimum use Cloudfront + WebP conversion.

### 4.2 Verbose Cache Logging in Production Client Bundle

**File:** `src/utils/eventCacheManager.ts:50-54`

`console.log()` calls fire on every localStorage read/write in production:

```ts
console.log(`[Cache] Saving ${key}: ${sizeKB.toFixed(2)} KB`);
console.log(`[Cache] Successfully saved ${key}`);
```

This is shipped to all browsers. Guard with `process.env.NODE_ENV === 'development'` or remove.

### 4.3 Sequential GitHub API Fetches During PR Enrichment

**File:** `lib/github-sync.ts:205-270`

For each `PullRequestEvent` on pages 1-2, the sync fetches PR details, then commits, then files — three sequential awaits per PR. With 40 events per page, worst case is 120 sequential GitHub API calls before any MongoDB writes. Use `Promise.all()` to parallelize the commits + files fetches after getting PR details.

### 4.4 `fullRefresh` Deletes All Events Before Refetch

**File:** `lib/github-sync.ts:109`

```ts
await eventsCollection.deleteMany({});
```

Full refresh deletes every event, then re-fetches only 7 pages (280 events max). If the refetch fails mid-way, the collection is left empty. Use a shadow collection or mark records with a refresh ID, swapping atomically on completion.

---

## 5. Missing Tests

### 5.1 No Unit Tests

The codebase has zero unit or integration tests. All testing is Playwright e2e. The following have the highest bug surface and most benefit from unit coverage:

- `lib/github-sync.ts` — sync logic with branching incremental/full-refresh paths, rate-limit handling, PR enrichment
- `src/utils/eventCacheManager.ts` — LRU eviction, quota handling, version migration
- `pages/api/github/events.ts` — filter/pagination logic, especially description filter behavior

### 5.2 Weak Smoke Test Assertions

**File:** `e2e/smoke-tests.spec.ts:169`

```ts
expect(isVisible || true).toBeTruthy(); // always passes
```

Several test cases have conditional logic that skips the assertion if the element is absent, making them pass even when the feature is broken. Use `if (isVisible)` + a comment explaining why, or assert the element *must* be visible if the feature is required.

### 5.3 No API Route Tests

`pages/api/github/` contains 7 route handlers with meaningful business logic (pagination, filtering, error handling) and zero test coverage. Use `next-test-api-route-handler` or direct handler invocation with mock `req`/`res` objects to test:

- Correct MongoDB query construction from filter params
- Pagination boundary conditions (page 0, page beyond total, NaN inputs)
- Auth checks on `sync-events`
- Rate-limit error propagation

---

## 6. Documentation

### 6.1 Cache Architecture Rationale Not Documented

**File:** `src/utils/eventCacheManager.ts`

The two-tier index/details cache design (1000 index entries + 150 LRU detail entries) is non-obvious. Add a block comment at the top of the file explaining the capacity decisions, the reason for the version key (`CACHE_VERSION = '5.0'`), and migration behavior.

### 6.2 `SYNC_SECRET` Auth Mechanism Undocumented

**File:** `pages/api/github/sync-events.ts`

There's no documentation on how `SYNC_SECRET` is generated, rotated, or validated. Add a note in `CLAUDE.md` or a `docs/` file explaining the Bearer token pattern and how to rotate it in SST secrets.

### 6.3 Missing `.env.example`

There is no `.env.example` file. New contributors have no reference for required environment variables. The list is partially documented in `CLAUDE.md`, but a concrete `.env.example` with placeholder values is the standard approach and prevents missing-variable build failures.

---

## 7. Dependency Hygiene

### 7.1 `react-swipeable-views` is Unmaintained

**File:** `package.json:120` (`react-swipeable-views: ^0.14.1`)

This package has been unmaintained since 2020, has no React 18 support guarantee, and is a known source of SSR issues. It is used in `src/products.tsx` (ProductSwitcher). Replace with `@mui/material/MobileStepper` + CSS transitions, `swiper`, or the MUI `Tabs` component.

### 7.2 Redundant MUI Packages

The following are likely unused or duplicated based on the import patterns observed:

- `@mui/styles` (legacy JSS-based styling, deprecated in MUI v5 — Emotion is already configured)
- `@mui/internal-markdown` (internal MUI package not intended for external use)
- `@stoked-ui/docs-markdown` (dev dependency, verify it's actually used at build)

Run `pnpm knip` and review its output to confirm and prune.

### 7.3 `@serverless-stack/cli` v1 in devDependencies

**File:** `package.json:165` (`@serverless-stack/cli: ^1.18.4`)

This is SST v1 CLI, while the project uses SST v3 (`sst: 3.9.7`). These are incompatible major versions. The v1 entry appears to be a leftover and should be removed.
