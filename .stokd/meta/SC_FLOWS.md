<!-- stokd-meta-version: 0.4.0 -->
# SC_FLOWS.md

User-flow classification for the `v2.brianstoker.com` portfolio site.
Meta version: 0.4.0 | Generated: 2026-05-26

All flows belong to the single product `SC_PRODUCT_BRIANSTOKER_COM.md`. View references are the view names defined in `SC_VIEWS.md`.

---

## Index

| # | Flow | Actor | Primary Entry |
|---|------|-------|---------------|
| 1 | Product Discovery (Home Showcase) | Anonymous visitor | `GET /` |
| 2 | Browse GitHub Activity | Anonymous visitor | `GET /work` or home → Work showcase |
| 3 | Inspect Pull Request Detail | Anonymous visitor | Click PR row inside `GithubEvents` |
| 4 | Read Resume (PDF) | Anonymous visitor | `GET /resume` or home → Resume showcase |
| 5 | Browse Photography Gallery | Anonymous visitor | `GET /photography` |
| 6 | Browse Art Gallery | Anonymous visitor | `GET /art` |
| 7 | Watch Drum Videos | Anonymous visitor | `GET /drums` |
| 8 | Browse Blog Index | Anonymous visitor | `GET /bstoked.plan` |
| 9 | Read Blog Post | Anonymous visitor | Click post card / link → `GET /.plan/[slug]` |
| 10 | Newsletter Subscribe | Anonymous visitor | `EmailSubscribe` form in `AppFooter` / `NewsletterToast` |
| 11 | Verify Newsletter Email | Subscriber (via email link) | `GET /subscription?code=...` |
| 12 | View HAL Logs (Admin) | Authenticated admin | `GET /hal` |
| 13 | Hourly GitHub Event Sync | AWS EventBridge (system) | `rate(1 hour)` Cron |
| 14 | Local GitHub Event Sync (dev) | Developer | `pnpm dev` / `pnpm dev:cron` |
| 15 | Production Deploy | Developer / operator | `pnpm deploy:prod` |
| 16 | Browse Components Index | Anonymous visitor | `GET /components` |
| 17 | 404 Recovery | Anonymous visitor | Unknown route |

---

## 1. Product Discovery (Home Showcase)

- **Actor:** Anonymous visitor
- **Goal:** See the full product catalog at a glance and drill into the one that interests them.
- **Entry points:**
  - Direct navigation to `https://brianstoker.com/` → `pages/index.tsx`
  - `AppHeader` logo link
- **Products:** `SC_PRODUCT_BRIANSTOKER_COM.md`

**Steps:**

1. Visitor hits `/`; SSR ships shell. *View: **Home — Portfolio Showcase***.
2. Client hydrates (`isClient` guard at `pages/index.tsx:18`), `ProductsPreviews` renders the left product list (desktop) or `MobileStepper` swipe carousel (mobile).
3. Visitor scrolls the showcase into view → `react-intersection-observer` triggers; the right showcase pane renders the active product's `showcaseType`.
4. Visitor hovers/clicks a product item (`Highlighter` button in `ProductSwitcher`) → active product index updates → right pane swaps to that product's showcase:
   - **Work** → `GithubEventsShowcase` (queries `/api/github/events`).
   - **Art / Photography** → `ImageShowcase`.
   - **Drums** → `VideoShowcase` (Plyr autoplay, muted).
   - **Resume** → `PdfShowcase` (renders `PdfDoc`).
   - **.plan** → `BlogShowcase` (up to 5 `PostPreviewBox` cards from `getAllBlogPosts()`).
5. Visitor clicks the showcase pane (wrapping `Link`) or the product item link → navigates to that product's dedicated page (continues into Flow 2, 4, 5, 6, 7, or 8).
6. `NewsletterToast` appears bottom-left after delay (Flow 10 entry point).

**Views used:**
- *Home — Portfolio Showcase* (sections: `AppHeaderBanner`, `AppHeader`, hero body, footer, `NewsletterToast`)
- Sub-views: `GithubEventsShowcase`, `ImageShowcase`, `VideoShowcase`, `PdfShowcase`, `BlogShowcase`

---

## 2. Browse GitHub Activity

- **Actor:** Anonymous visitor
- **Goal:** Explore Brian Stoker's recent open-source activity, filter by repo / event type / date / description, and inspect individual events.
- **Entry points:**
  - `AppHeader` nav → "Work"
  - Home page → click "Work" product showcase
  - Direct URL `/work` → `pages/work.tsx`
  - `AppFooter` site-links column → "Work"
- **Products:** `SC_PRODUCT_BRIANSTOKER_COM.md`

**Steps:**

1. Visitor lands on `/work`. *View: **Work — GitHub Activity Dashboard***.
2. `GithubCalendar` mounts, fetches contribution data via `react-github-calendar` / API; renders SVG heatmap scrolled to the most recent week. *View region: `GithubCalendar`*.
3. `GithubEvents` mounts; calls `GET /api/github/filters` for the repo/action option lists and `GET /api/github/events?page=1&limit=20` for the first page.
4. Visitor narrows the result set via the filter bar (`Autocomplete` repo, `Select` action, date `TextField`, description `TextField`) → component re-queries `/api/github/events`; pagination resets to page 1.
5. Visitor clicks an event row → metadata panel populates:
   - `PullRequestEvent` → `PullRequestView` (Flow 3).
   - `PushEvent` → `PushEvent` commit list (calls `/api/github/commit-files` per commit on expand).
   - Other types → inline detail render.
6. Visitor paginates via `Pagination` control → new page fetched.
7. On mobile (<900px), repo strip + event list stacked; metadata panel displayed below selected event.

**API calls:**
- `GET /api/github/filters` (`pages/api/github/filters.ts`)
- `GET /api/github/events` (`pages/api/github/events.ts`)
- `GET /api/github/event/[id]` (`pages/api/github/event/[id].ts`) — direct event lookup

**Views used:** *Work — GitHub Activity Dashboard* (`GithubCalendar`, `GithubEvents`, optional `PullRequestView` panel).

---

## 3. Inspect Pull Request Detail

- **Actor:** Anonymous visitor
- **Goal:** Drill into a specific PR to view its commits and changed files.
- **Entry points:**
  - From Flow 2: select a `PullRequestEvent` row inside `GithubEvents`
  - Home showcase (`GithubEventsShowcase`) — same selection mechanism
- **Products:** `SC_PRODUCT_BRIANSTOKER_COM.md`

**Steps:**

1. Visitor selects a PR event in the event list → `GithubEvents` swaps the metadata panel to `PullRequestView` (`src/components/PullRequest/PullRequestView.tsx`).
2. `PullRequestView` requests PR data: `GET /api/github/pull-request?...` (`pages/api/github/pull-request.ts`) or `GET /api/github/pull-request/[number]` (`pages/api/github/pull-request/[number].ts`).
3. Tabs render: **Commits (N)** by default → `CommitsList` (`src/components/PullRequest/CommitsList.tsx`).
4. Visitor switches to **Files changed (N)** → `FileChanges` (`src/components/PullRequest/FileChanges.tsx`) requests file diffs via `GET /api/github/pull-request-files` (`pages/api/github/pull-request-files.ts`).
5. `StatsBox` summarizes "Showing N changed files with X additions and Y deletions".
6. Visitor expands a file entry → diff rendered; per-commit drill-down may call `GET /api/github/commit-files` (`pages/api/github/commit-files.ts`).

**Views used:** Sub-views `PullRequestView`, `GithubEventsShowcase` (when entered from home), embedded within *Work — GitHub Activity Dashboard* or *Home — Portfolio Showcase*.

---

## 4. Read Resume (PDF)

- **Actor:** Anonymous visitor
- **Goal:** Read Brian's current resume directly in the browser, paginated.
- **Entry points:**
  - `AppFooter` site-links column → "Resume"
  - Home → Resume showcase click-through
  - Direct URL `/resume` (canonical, `pages/resume.tsx`) or `/resume-new` (`pages/resume-new.tsx`)
  - `/resume-scale` (experimental variant) — `pages/resume-scale.tsx`
- **Products:** `SC_PRODUCT_BRIANSTOKER_COM.md`

**Steps:**

1. Visitor lands on `/resume`. *View: **Resume (Primary PDF Viewer)***.
2. Container `ResizeObserver` measures viewport → sets `containerWidth`.
3. `PdfDoc` (`react-pdf` `Document`) fetches `brian.stokd.cloud/brian-stoker-resume.pdf` and renders the first `Page`.
4. Visitor hovers the document → `ButtonGroup` page controls reveal (Prev `Fab` / `Page X of N` label / Next `Fab`).
5. Visitor advances pages via Fabs; `pageNumber` updates; Prev/Next disable at boundaries.
6. (Optional) Visitor visits `/resume-scale` to evaluate the experimental container-width strategy (`useResizeObserver`), same `PdfDoc`.

**Views used:** *Resume (Primary PDF Viewer)*, *Resume Scale (Experimental)*.

---

## 5. Browse Photography Gallery

- **Actor:** Anonymous visitor
- **Goal:** View Brian's photography in a masonry grid; open any image full-screen.
- **Entry points:**
  - Home → Photography product showcase
  - `AppFooter` → "Photography"
  - Direct URL `/photography` → `pages/photography.tsx`
- **Products:** `SC_PRODUCT_BRIANSTOKER_COM.md`

**Steps:**

1. Visitor lands on `/photography`; MUI `ImageList` renders the 3-column masonry grid (10 photos, lazy-loaded).
2. Visitor hovers a tile → scale animation.
3. Visitor clicks a tile → `LightboxGallery` opens (`open=true`); current image displayed full-screen.
4. Visitor navigates via left/right arrow buttons or by clicking the left/right click-zone halves.
5. Visitor closes via top-right close icon, the `Escape` key, or by clicking the backdrop.

**Views used:** *Photography Gallery* + sub-view `LightboxGallery (Modal Overlay)`.

---

## 6. Browse Art Gallery

- **Actor:** Anonymous visitor
- **Goal:** View Brian's artwork in a masonry grid; open any image full-screen.
- **Entry points:**
  - Home → Art product showcase
  - `AppFooter` → "Art"
  - Direct URL `/art` → `pages/art.tsx`
- **Products:** `SC_PRODUCT_BRIANSTOKER_COM.md`

**Steps:** Identical to Flow 5, but with 12 artwork images. Same `LightboxGallery` modal.

**Views used:** *Art Gallery* + sub-view `LightboxGallery (Modal Overlay)`.

---

## 7. Watch Drum Videos

- **Actor:** Anonymous visitor
- **Goal:** Play the three drum performance videos.
- **Entry points:**
  - Home → Drums product showcase
  - `AppFooter` → "Drums"
  - Direct URL `/drums` → `pages/drums.tsx`
- **Products:** `SC_PRODUCT_BRIANSTOKER_COM.md`

**Steps:**

1. Visitor lands on `/drums`; `VideoGallery` renders three `<video>` elements with poster images:
   - "Normal Guy" (QuickTime)
   - "Golden Stream" (MP4)
   - "Tell Me Mister" (MP4)
2. Visitor clicks Play; native controls drive playback. `playsInline` prevents iOS fullscreen auto-trigger.
3. Visitor scrubs / pauses / resumes via native controls (Picture-in-Picture disabled).

**Views used:** *Drums — Video Gallery*.

---

## 8. Browse Blog Index

- **Actor:** Anonymous visitor
- **Goal:** Find a blog post by browsing the index or filtering by tag.
- **Entry points:**
  - Home → ".plan" product showcase (`BlogShowcase`)
  - `AppHeader` / `AppFooter` → ".plan"
  - Direct URL `/bstoked.plan` (`pages/bstoked.plan.tsx`) — main index
  - Direct URL `/.plan` (`pages/.plan/index.jsx`) — card grid variant
- **Products:** `SC_PRODUCT_BRIANSTOKER_COM.md`

**Steps:**

1. Visitor lands on `/bstoked.plan`. *View: **Blog Index — `bstoked.plan`***.
2. Hero section renders; the 2 most-recent posts populate the featured `PostPreviewBox` overlay.
3. Remaining posts list paginated 7/page; sticky sidebar shows tag filter chips + social links.
4. Visitor clicks a tag chip → query param `?tags=<tag>` set; list narrows; page resets to 0.
5. Visitor clicks the active chip's delete affordance → tag cleared.
6. Visitor paginates → `postListRef` scrolled into view.
7. Visitor clicks any post `Read more` button or title → continues into Flow 9.
8. (Alternative) Visitor visits `/.plan` to browse the card-grid variant; clicks a card → Flow 9.

**Data:** `getAllBlogPosts()` from `lib/sourcing.ts` (MDX in `pages/home/*.mdx` and similar).

**Views used:** *Blog Index — `bstoked.plan`*, *Plan Index — `/.plan`*.

---

## 9. Read Blog Post

- **Actor:** Anonymous visitor
- **Goal:** Read a single MDX-authored blog post.
- **Entry points:**
  - Click a `PostPreviewBox` "Read more" or title link in Flow 8
  - Home `BlogShowcase` post-card click
  - Direct deep link `/.plan/<slug>` → `pages/.plan/[slug].tsx`
- **Products:** `SC_PRODUCT_BRIANSTOKER_COM.md`

**Steps:**

1. Next.js resolves the slug at build time via `getStaticPaths` (`fallback: false`) and serializes MDX via `getStaticProps`.
2. *View: **Blog Post — `.plan/[slug]`*** renders via `TopLayoutBlog` from `@stoked-ui/docs`.
3. Metadata header (title, date, authors, tags) renders above the rendered MDX body.
4. Unknown slug → Next.js 404 (Flow 17).

**Views used:** *Blog Post — `.plan/[slug]`*.

---

## 10. Newsletter Subscribe

- **Actor:** Anonymous visitor
- **Goal:** Subscribe to Brian's newsletter using their email address.
- **Entry points:**
  - `EmailSubscribe` form in `AppFooter` (every page) — `src/components/footer/EmailSubscribe.tsx`
  - `NewsletterToast` (home page only, bottom-left, post-delay) — `src/components/home/NewsletterToast.tsx`
- **Products:** `SC_PRODUCT_BRIANSTOKER_COM.md`

**Steps:**

1. Visitor sees the form (footer or toast).
2. Visitor enters email → submits.
3. Submission POSTs to the subscribe backend (external email/newsletter provider); a confirmation email is sent containing a `/subscription?code=...&token=...&email=...` link.
4. Toast auto-dismisses or visitor closes the close button.
5. Visitor opens email → continues into Flow 11.

**Views used:** Shared shell regions `AppFooter` (`EmailSubscribe`) and `NewsletterToast`.

---

## 11. Verify Newsletter Email

- **Actor:** Subscriber clicking a confirmation link from their inbox
- **Goal:** Confirm email ownership and finalize subscription.
- **Entry points:** Email-delivered link `https://brianstoker.com/subscription?code=<code>&token=<token>&email=<email>` → `pages/subscription.tsx`
- **Products:** `SC_PRODUCT_BRIANSTOKER_COM.md`

**Steps:**

1. Subscriber clicks link → `/subscription` loads.
2. Page reads `?code=` query param:
   - **No code** → immediate redirect to `/404`.
   - **200** → success alert "Email verified: {email}".
   - **201** → "Email already verified: {email}".
   - **401** → "Invalid token or Email".
   - **404** → "Email not found: {email}".
   - **402 / 500** → "System error occurred staff has been notified."
3. Subscriber reads the result `Alert` and navigates elsewhere via shell links.

**Views used:** *Subscription / Email Verification*.

---

## 12. View HAL Logs (Admin)

- **Actor:** Authenticated admin (Google OAuth identity matching the configured admin allow-list)
- **Goal:** Inspect application logs / errors collected by the HAL log-shipping backend.
- **Entry points:** Direct URL `/hal` → `pages/hal.js`
- **Products:** `SC_PRODUCT_BRIANSTOKER_COM.md`

**Steps:**

1. Admin opens `/hal`. *View: **HAL Logs (Admin)*** — unauthenticated state shows "Access Restricted" with `Sign In` button.
2. Admin clicks `Sign In` → NextAuth `signIn()` → Google OAuth handshake via `pages/api/auth/[...nextauth].js` → redirected back authenticated.
3. View flips to authenticated state. `useEffect` fires `GET /api/hal/logs` (`pages/api/hal/logs.js`).
4. Server reads from MongoDB (or S3 `HalBucket`, `stacks/bucket.ts`) and returns `{ logs, errors }`.
5. **Logs** tab renders `logs` string in `LogPanel`; **Errors** tab renders `errors` (turning red if present).
6. Admin toggles tabs to inspect output.
7. Admin clicks `Sign Out` → NextAuth signs out → returns to the unauthenticated state.

**Views used:** *HAL Logs (Admin)*.

---

## 13. Hourly GitHub Event Sync (System)

- **Actor:** AWS EventBridge scheduler (system, no human in the loop)
- **Goal:** Keep MongoDB `github_events` and `sync_metadata` collections current with the latest events from the GitHub Events API.
- **Entry points:** `sst.aws.Cron` created by `stacks/cron.ts` with schedule `rate(1 hour)` — calls `cron/github-sync.handler`.
- **Products:** `SC_PRODUCT_BRIANSTOKER_COM.md`

**Steps:**

1. EventBridge fires every 60 minutes.
2. Lambda handler `cron/github-sync.ts` boots; reads env (`GITHUB_TOKEN`, `GITHUB_USERNAME`, `MONGODB_*`, `SYNC_SECRET`, `SYNC_ENDPOINT`).
3. Handler invokes `syncGitHubEvents()` from `lib/github-sync.ts` (or POSTs `${SITE_URL}/api/github/sync-events` with `SYNC_SECRET`, per `stacks/cron.ts`).
4. Sync logic paginates the GitHub Events API for `GITHUB_USERNAME`.
5. Events upserted into the `github_events` collection in the per-stage MongoDB database (e.g. `brianstoker-production`); `sync_metadata` updated with cursor/timestamps.
6. Lambda exits (5-minute timeout). Next visitor loading `/work` or the home Work showcase (Flow 2) receives the fresh data via `/api/github/events`.

**Views used:** None (background system flow). Output surfaces in Flow 2 / Flow 1 (Work showcase).

---

## 14. Local GitHub Event Sync (Developer)

- **Actor:** Developer running the app locally
- **Goal:** Populate the local MongoDB (`brianstoker-local`) with fresh GitHub events so the dev UI has data to show.
- **Entry points:**
  - `pnpm dev` (runs `dev:nextjs` + `dev:cron` via Turbo)
  - `pnpm dev:cron` directly (`scripts/local-sync-cron.cjs`)
  - `pnpm sync-cron` — manual one-shot
  - `pnpm populate:github` / `pnpm populate:github-history` — backfill scripts (`scripts/populate-github-activity*.js`)

**Steps:**

1. Developer runs `pnpm dev`; Turbo starts `dev:nextjs` (Next on port 5040) and `dev:cron` concurrently.
2. After ~10s warm-up, `scripts/local-sync-cron.cjs` POSTs `http://localhost:5040/api/github/sync-events` with the `SYNC_SECRET` from `.env`.
3. `pages/api/github/sync-events.ts` validates the secret, then calls `syncGitHubEvents()`.
4. Events written to `brianstoker-local` Atlas DB.
5. Developer iterates against `/work` and `/` showcases (Flows 1, 2) with live data.
6. (Backfill variant) Developer runs `pnpm populate:github-history` to seed the local DB with historical events.

**Views used:** None (background developer flow).

---

## 15. Production Deploy

- **Actor:** Developer / operator with `AWS_PROFILE=stoked` credentials
- **Goal:** Ship a new revision of the site, cron, and infra to AWS.
- **Entry points:**
  - `pnpm deploy:prod` → `scripts/aws-deploy.sh deploy`
  - Direct `AWS_PROFILE=stoked senvn -f production npx sst deploy --stage production`
  - Maintenance variants: `pnpm refresh:prod`, `pnpm unlock:prod`, `pnpm remove:prod`

**Steps:**

1. Operator confirms branch state (`main`); ensures `.env.production` is populated.
2. Runs `pnpm deploy:prod`.
3. Script applies `fix-nextjs15.js` patches, then runs `pnpx @opennextjs/aws@latest build` to produce the Lambda bundle.
4. `sst.config.ts.run()` wires resources via `stacks/`:
   - `stacks/domains.ts` resolves domain + DB name for stage `production`.
   - `stacks/bucket.ts` ensures `HalBucket` (S3).
   - `stacks/site.ts` deploys the Next.js Lambda (validates required env vars, attaches `*:*` IAM, sets cache headers).
   - `stacks/cron.ts` deploys the hourly GitHub-sync cron Lambda.
5. SST prints output URL; operator validates `https://brianstoker.com/` smoke (Flow 1) and `/work` data freshness (Flow 2).
6. If stuck, operator runs `pnpm unlock:prod` to release the SST lock.

**Views used:** None (operational flow). Verification touches Flows 1, 2, 12.

---

## 16. Browse Components Index

- **Actor:** Anonymous visitor (typically internal / curious developer)
- **Goal:** Discover component documentation pages exposed by the site.
- **Entry points:** Direct URL `/components` → `pages/components.tsx`
- **Products:** `SC_PRODUCT_BRIANSTOKER_COM.md`

**Steps:**

1. Visitor lands on `/components`. *View: **Components Listing***.
2. Page reads static data from `data/pages` and renders the responsive category grid.
3. Each `ListItemButton` is a link to a component-specific page; visitor clicks to navigate.

**Views used:** *Components Listing*.

---

## 17. 404 Recovery

- **Actor:** Anonymous visitor
- **Goal:** Recover gracefully from an unknown URL.
- **Entry points:** Any unrouted URL — Next.js renders `pages/404.tsx`.

**Steps:**

1. Next.js intercepts the missing route and renders `HomeView` with `NotFoundHero` (`src/components/NotFoundHero.tsx`).
2. Visitor reads the "page not found" indicator and uses `AppHeader` / `AppFooter` shell links to return to a real page.

**Views used:** *404 Not Found*.

---

## Cross-Cutting Concerns

### Authentication

NextAuth.js v4 + Google OAuth (`pages/api/auth/[...nextauth].js`) currently gates only the HAL Logs flow (Flow 12). No other end-user flow requires sign-in.

### Persistent Data

All visitor-facing dynamic data (GitHub events, PRs, commits) is read from MongoDB Atlas — populated by Flow 13 (production) or Flow 14 (development). The site never hits the GitHub API in the user-request path; it reads cached records via `/api/github/*` handlers backed by `pages/api/lib/mongodb.ts`.

### Static Content

Resume PDF, art, photography, and drum videos are static assets in `public/static/`. The MDX blog (`pages/home/*.mdx` + `lib/sourcing.ts`) is statically resolved at build time.

### Navigation Backbone

`AppHeader` (`HeaderNavBar` desktop / `HeaderNavDropdown` mobile) and `AppFooter` are rendered on every page-level view and serve as the secondary entry point into Flows 2, 4, 5, 6, 7, 8.

---

## Route → Flow Map

| Route | Page File | Flow(s) |
|-------|-----------|---------|
| `/` | `pages/index.tsx` | 1 (10 via toast) |
| `/work` | `pages/work.tsx` | 2 (→ 3) |
| `/resume`, `/resume-new`, `/resume-scale` | `pages/resume.tsx`, `pages/resume-new.tsx`, `pages/resume-scale.tsx` | 4 |
| `/photography` | `pages/photography.tsx` | 5 |
| `/art` | `pages/art.tsx` | 6 |
| `/drums` | `pages/drums.tsx` | 7 |
| `/bstoked.plan`, `/.plan` | `pages/bstoked.plan.tsx`, `pages/.plan/index.jsx` | 8 (→ 9) |
| `/.plan/[slug]` | `pages/.plan/[slug].tsx` | 9 |
| `/subscription` | `pages/subscription.tsx` | 11 |
| `/hal` | `pages/hal.js` | 12 |
| `/components` | `pages/components.tsx` | 16 |
| `*` (404) | `pages/404.tsx` | 17 |
| `/api/github/sync-events` | `pages/api/github/sync-events.ts` | 13, 14 |
| `/api/github/events`, `/api/github/event/[id]`, `/api/github/filters` | `pages/api/github/*` | 2 |
| `/api/github/pull-request`, `/api/github/pull-request/[number]`, `/api/github/pull-request-files`, `/api/github/commit-files` | `pages/api/github/*` | 3 |
| `/api/auth/[...nextauth]` | `pages/api/auth/[...nextauth].js` | 12 |
| `/api/hal/logs` | `pages/api/hal/logs.js` | 12 |
| EventBridge `GithubSyncCron` | `cron/github-sync.ts` | 13 |
