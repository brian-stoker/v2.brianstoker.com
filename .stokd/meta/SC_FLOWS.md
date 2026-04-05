# SC_FLOWS.md

User flow classification for the v2.brianstoker.com portfolio site.
Meta version: 0.2.0 | Generated: 2026-03-21

---

## Overview

This site has two actor classes: **Visitors** (anonymous public users) and the **Owner** (Brian Stoker, authenticated via Google OAuth). Flows are grouped by domain: portfolio browsing, GitHub activity, content, newsletter/subscription, and system/admin.

---

## Flow Index

| # | Flow Name | Actor | Domain |
|---|-----------|-------|--------|
| 1 | Portfolio Home Browse | Visitor | Portfolio |
| 2 | Site Navigation | Visitor | Portfolio |
| 3 | Theme Toggle | Visitor | Portfolio |
| 4 | GitHub Activity Dashboard Browse | Visitor | GitHub Activity |
| 5 | GitHub Event Detail Inspection | Visitor | GitHub Activity |
| 6 | GitHub Events Filtering | Visitor | GitHub Activity |
| 7 | Resume View | Visitor | Content |
| 8 | Photography Gallery Lightbox | Visitor | Content |
| 9 | Art Gallery Lightbox | Visitor | Content |
| 10 | Drums Video Playback | Visitor | Content |
| 11 | Blog Index Browse | Visitor | Content |
| 12 | Blog Post Read | Visitor | Content |
| 13 | Email Newsletter Subscribe | Visitor | Newsletter |
| 14 | Email Verification (Subscription Confirm) | Visitor | Newsletter |
| 15 | HAL Admin Sign-In | Owner | Admin |
| 16 | HAL Log Inspection | Owner | Admin |
| 17 | GitHub Events Sync (Scheduled/Automated) | System | Data Pipeline |
| 18 | GitHub Events Sync (Manual) | Developer / Owner | Data Pipeline |

---

## Flows

---

### Flow 1 — Portfolio Home Browse

**Actor:** Visitor (anonymous)

**Goal:** Get an overview of Brian Stoker's work and navigate to a specific product area.

**Entry points:**
- Direct URL: `/`
- External link / social media referral
- Logo click from any page (via `AppHeader`)

**Steps:**
1. Visitor lands on `/`. Server renders static shell; `getStaticProps` provides up to 5 most-recent blog posts.
2. `AppHeaderBanner` (top strip) renders above the header.
3. `AppHeader` renders with logo, `HeaderNavBar` (desktop) or `HeaderNavDropdown` (mobile), GitHub icon link, `ThemeModeToggle`.
4. `NewsletterToast` mounts client-side (NoSsr) — appears bottom-left after hydration.
5. Client hydration completes; `isClient` guard at `pages/index.tsx:18` allows `HeroMain` to render.
6. `ProductsPreviews` (`src/products.tsx`) renders:
   - **Desktop:** Left panel with `ProductSwitcher` vertical list (6 products: Work, Art, Photography, Drums, Resume, .plan). Right panel shows active product's showcase.
   - **Mobile:** `SwipeableViews` + `MobileStepper` carousel replaces vertical list.
7. Active product defaults to "Work" — right pane renders `GithubEventsShowcase`.
8. Visitor clicks/swipes to a different product (e.g., "Resume") — right pane swaps to `PdfShowcase`.
9. Visitor clicks the active product's name or right-panel link — navigates to the product's dedicated page (e.g., `/resume`).
10. `AppFooter` renders at bottom with `EmailSubscribe` form and site/social links.

**Views used:**
- `Home Portfolio Showcase` (`pages/index.tsx`)
- `AppHeader` (shared shell)
- `AppFooter` (shared shell)
- `GithubEventsShowcase` (inline showcase, `src/components/home/GithubEventsShowcase.tsx`)
- `PdfShowcase`, `VideoShowcase`, `ImageShowcase`, `BlogShowcase` (inline showcases, swapped per active product)

**Products:** Work, Art, Photography, Drums, Resume, .plan

---

### Flow 2 — Site Navigation

**Actor:** Visitor (anonymous)

**Goal:** Navigate between the different sections of the site.

**Entry points:**
- `HeaderNavBar` nav links (desktop, `src/components/header/HeaderNavBar.tsx`)
- `HeaderNavDropdown` hamburger drawer (mobile, `src/components/header/HeaderNavDropdown.tsx`)
- `AppFooter` site-links column (Art, Photography, Drums, .plan, Work, Resume)
- `AppFooter` external links column (Stoked Consulting, Stoked UI, LinkedIn, Discord, Slack)
- `AppFooter` social icon strip (GitHub, RSS, Slack, LinkedIn, Discord)

**Steps:**
1. Visitor clicks a nav link in `AppHeader` or `AppFooter`.
2. Next.js client-side navigation routes to the target page.
3. Target page view renders with shared `AppHeader` + `AppFooter` shell.
4. On mobile, `HeaderNavDropdown` drawer opens on hamburger tap; visitor taps a link; drawer closes on navigation.

**Views used:** Any page view; `AppHeader`, `AppFooter` (shared shell)

---

### Flow 3 — Theme Toggle

**Actor:** Visitor (anonymous)

**Goal:** Switch between light and dark color modes.

**Entry points:**
- `ThemeModeToggle` button in `AppHeader` (`src/components/header/ThemeModeToggle.tsx`)

**Steps:**
1. Visitor clicks the sun/moon icon in the header.
2. `BrandingCssVarsProvider` CSS variable mode toggles between `light` and `dark`.
3. All MUI components re-render with the new palette; preference is stored in localStorage by the provider.

**Views used:** All views (shared shell behavior)

---

### Flow 4 — GitHub Activity Dashboard Browse

**Actor:** Visitor (anonymous)

**Goal:** View Brian's GitHub contribution history and recent activity events.

**Entry points:**
- Direct URL: `/work`
- "Work" nav link in `AppHeader` / `AppFooter`
- Home page "Work" product link (`src/products.tsx` — `workData.url`)

**Steps:**
1. Visitor navigates to `/work` (`pages/work.tsx`).
2. `GithubCalendar` component (`src/components/GithubCalendar/GithubCalendar.tsx`) fetches `/api/github/events` (lightweight) to build contribution heatmap data.
3. Calendar renders in `loading` skeleton state, then transitions to the SVG heatmap grid, auto-scrolled to the most-recent week.
4. `GithubEvents` component (`src/components/GithubEvents/GithubEvents.tsx`) fetches `/api/github/events?page=1&per_page=20`.
5. Event list populates: paginated rows showing event type chip (color-coded), repo name, date, message snippet.
6. Visitor hovers over heatmap cells — `punch` fx triggers rect fly-out animation; month/day labels fade in.
7. Visitor scrolls the event list; clicks `Pagination` to advance pages.

**Views used:**
- `Work GitHub Activity Dashboard` (`pages/work.tsx`)
- `GithubCalendar` sub-view
- `GithubEvents` sub-view (list only, no event selected)

**Products:** Work

---

### Flow 5 — GitHub Event Detail Inspection

**Actor:** Visitor (anonymous)

**Goal:** Inspect the full details of a specific GitHub event (commits, PR diffs, etc.).

**Entry points:**
- Clicking an event row in the `GithubEvents` list (on `/work` or the home page showcase)

**Steps:**
1. Visitor clicks an event row in the `GithubEvents` list.
2. Component fetches full event details from `/api/github/event/[id]` (or uses two-tier localStorage cache via `eventCacheManager`).
3. Metadata panel populates:
   - **PushEvent:** `PushEvent` component shows commit list with messages and SHAs (`src/components/GithubEvents/PushEvent.tsx`).
   - **PullRequestEvent:** `PullRequestView` (`src/components/PullRequest/PullRequestView.tsx`) renders with two tabs:
     - **Commits tab:** `CommitsList` (`src/components/PullRequest/CommitsList.tsx`)
     - **Files changed tab:** `FileChanges` diff list (`src/components/PullRequest/FileChanges.tsx`) + stats bar
   - **IssuesEvent / IssueCommentEvent / CreateEvent / DeleteEvent / ForkEvent / ProjectsV2\*:** matching event-type component renders.
   - **Fallback:** `ReactJson` (react-json-view) renders raw event JSON.
4. On desktop (≥900px): metadata panel is sticky, side-by-side with event list.
5. On mobile (<900px): metadata panel stacks below the event list.
6. Visitor clicks a different event row — metadata panel updates.
7. For PR events, visitor clicks "Files changed" tab — diff view renders with additions/deletions.

**Views used:**
- `Work GitHub Activity Dashboard` (`pages/work.tsx`) or `GithubEventsShowcase` (home)
- `GithubEvents` sub-view with metadata panel active
- `PullRequestView` sub-panel (for PR events)

**API routes:** `GET /api/github/events`, `GET /api/github/event/[id]`, `GET /api/github/pull-request/[number]`, `GET /api/github/commit-files`, `GET /api/github/pull-request-files`

**Products:** Work

---

### Flow 6 — GitHub Events Filtering

**Actor:** Visitor (anonymous)

**Goal:** Narrow the event list by repository, event type, date range, or description keyword.

**Entry points:**
- Filter bar controls at the top of `GithubEvents` (on `/work` page)

**Steps:**
1. Visitor is on `/work` with event list populated.
2. Visitor types a repo name into the repo `Autocomplete` field — list narrows to events from that repo; pagination resets to page 1.
3. Visitor selects an action type from the `Select` dropdown (e.g., "PushEvent") — list filters by event type.
4. Visitor selects a date range from the date `TextField` (today / yesterday / week / month) — `created_at` filter applied server-side.
5. Visitor types a description keyword into the description `TextField` — in-memory filter applied on the fetched page.
6. Multiple filters may be active simultaneously.
7. Visitor clears a filter — list re-fetches and expands back.

**Views used:**
- `Work GitHub Activity Dashboard` (`pages/work.tsx`)
- `GithubEvents` sub-view (filter bar + list)

**API routes:** `GET /api/github/events?repo=&action=&date=&description=&page=&per_page=`

**Products:** Work

---

### Flow 7 — Resume View

**Actor:** Visitor (anonymous)

**Goal:** View Brian's resume as a rendered PDF.

**Entry points:**
- Direct URL: `/resume`
- "Resume" nav link in `AppHeader` / `AppFooter`
- Home page "Resume" product link (`src/products.tsx`)
- Home page `PdfShowcase` inline preview

**Steps:**
1. Visitor navigates to `/resume` (`pages/resume.tsx`).
2. `PdfDoc` component (`pages/resume-new.tsx:95`) is rendered; `ResizeObserver` measures container width.
3. `react-pdf` `Document` loads `/static/resume/brian-stoker-resume.pdf` from the CDN.
4. `Page` renders the PDF canvas at computed width (max 850px, minus padding).
5. Visitor hovers over the PDF — page navigation `ButtonGroup` (Prev Fab / "Page X of N" / Next Fab) fades in at bottom center.
6. For multi-page PDFs, visitor clicks Next/Prev Fabs to change pages.
7. On narrow viewports (<900px), the optional side icon column is hidden; layout stacks vertically.

**Views used:**
- `Resume PDF Viewer` (`pages/resume.tsx`)
- `PdfShowcase` inline sub-view (home only)

**Products:** Resume

---

### Flow 8 — Photography Gallery Lightbox

**Actor:** Visitor (anonymous)

**Goal:** Browse photography images in a masonry grid and view individual photos full-screen.

**Entry points:**
- Direct URL: `/photography`
- "Photography" nav link in `AppHeader` / `AppFooter`
- Home page "Photography" product link (`src/products.tsx`)

**Steps:**
1. Visitor navigates to `/photography` (`pages/photography.tsx`).
2. 10 photos render in a 3-column MUI masonry `ImageList`; images lazy-load.
3. Visitor hovers an image — it scales up (1.02x transform).
4. Visitor clicks an image — `LightboxGallery` modal opens (`src/components/LightboxGallery/index.tsx`) with clicked image displayed.
5. Visitor navigates using arrow buttons (left/right click zones, or `ArrowBackIosNew` / `ArrowForwardIos` icon buttons) to cycle through images.
6. Visitor closes the lightbox by: clicking the X `IconButton`, clicking the `Backdrop`, or pressing Escape.

**Views used:**
- `Photography Gallery` (`pages/photography.tsx`)
- `LightboxGallery` modal sub-view

**Products:** Photography

---

### Flow 9 — Art Gallery Lightbox

**Actor:** Visitor (anonymous)

**Goal:** Browse artwork images and view them full-screen.

**Entry points:**
- Direct URL: `/art`
- "Art" nav link in `AppHeader` / `AppFooter`
- Home page "Art" product link (`src/products.tsx`)

**Steps:** Identical to Flow 8 — Photography Gallery Lightbox. Displays 12 artwork images in the same masonry + lightbox layout.

**Views used:**
- `Art Gallery` (`pages/art.tsx`)
- `LightboxGallery` modal sub-view

**Products:** Art

---

### Flow 10 — Drums Video Playback

**Actor:** Visitor (anonymous)

**Goal:** Watch Brian's drum performance videos.

**Entry points:**
- Direct URL: `/drums`
- "Drums" nav link in `AppHeader` / `AppFooter`
- Home page "Drums" product link; `VideoShowcase` inline preview on home page

**Steps:**
1. Visitor navigates to `/drums` (`pages/drums.tsx`).
2. Three videos render in `VideoGallery` container (`src/components/video/videos.tsx`): "Normal Guy" (QuickTime), "Golden Stream" (MP4), "Tell Me Mister" (MP4).
3. Each video shows a poster image until play begins; native `<video controls>` UI is used.
4. Visitor clicks the play button on a video — native browser video player begins playback.
5. On the home page showcase (`VideoShowcase`): Plyr player (dynamically imported) autoplays muted on load.

**Views used:**
- `Drums Video Gallery` (`pages/drums.tsx`)
- `VideoShowcase` inline sub-view (home only)

**Products:** Drums

---

### Flow 11 — Blog Index Browse

**Actor:** Visitor (anonymous)

**Goal:** Discover and filter blog posts on the `.plan` blog.

**Entry points:**
- Direct URL: `/bstoked.plan`
- ".plan" nav link in `AppHeader` / `AppFooter`
- Home page ".plan" product link; `BlogShowcase` inline preview on home page

**Steps:**
1. Visitor navigates to `/bstoked.plan` (`pages/bstoked.plan.tsx`). `getStaticProps` provides all blog posts; RSS feed regenerates.
2. Hero section renders with gradient headline.
3. Top 2 most-recent posts render as featured `PostPreviewBox` cards (image, tags, title, description, authors, "Read more" button).
4. Remaining posts render in a paginated list (7/page) on the left; sticky sidebar on the right (desktop) with tag filter chips and social links.
5. Visitor clicks a tag chip — chip becomes filled + deletable; post list filters to matching posts; `?tags=` query param updates in URL; pagination resets to page 0.
6. Visitor clicks a filled tag chip's X — tag removed; list expands back.
7. Visitor clicks `Pagination` to navigate pages — `postListRef` scrolls into view.
8. Visitor clicks a post title or "Read more" — navigates to `/.plan/[slug]`.

**Views used:**
- `Blog Index` (`pages/bstoked.plan.tsx`)
- `BlogShowcase` inline sub-view (home only)

**Products:** .plan

---

### Flow 12 — Blog Post Read

**Actor:** Visitor (anonymous)

**Goal:** Read a specific blog post article.

**Entry points:**
- Clicking post title / "Read more" from Blog Index (`/bstoked.plan`)
- Direct URL: `/.plan/[slug]`
- `BlogShowcase` post card on home page
- RSS feed link (`/feed/.plan/rss.xml`)

**Steps:**
1. Visitor navigates to `/.plan/[slug]` (`pages/.plan/[slug].tsx`).
2. `getStaticProps` loads the MDX file from `data/blog/` matching the slug; `getStaticPaths` enumerates all known slugs at build time.
3. `TopLayoutBlog` (from `@stoked-ui/docs`) renders: post header (title, date, tags, authors), then the serialized MDX body.
4. Visitor reads the article; may click inline links.
5. Visitor navigates back to blog index or uses header navigation.

**Views used:**
- `Blog Post (MDX)` (`pages/.plan/[slug].tsx`)

**Products:** .plan

---

### Flow 13 — Email Newsletter Subscribe

**Actor:** Visitor (anonymous)

**Goal:** Subscribe to email updates from Brian Stoker.

**Entry points:**
- `EmailSubscribe` form in `AppFooter` (`src/components/footer/EmailSubscribe.tsx`) — present on all pages
- `NewsletterToast` client-side toast on the home page (`src/components/home/NewsletterToast.tsx`)

**Steps:**
1. Visitor sees the `EmailSubscribe` form in the footer (or `NewsletterToast` on home).
2. Visitor types their email address into the `InputBase` field.
3. Visitor clicks "Subscribe" button (or presses Enter).
4. Form sets status to `loading`; button disables.
5. `POST https://api.<host>/subscribe` is called with `{ email }` (no-cors mode — external subscription API endpoint).
6. On success: form status sets to `sent`; the form replaces with a success `Alert` — "Go to your email and open the confirmation email to confirm your subscription."
7. On failure: `FormHelperText` error shown — "Oops! Something went wrong, please try again later."
8. Visitor opens their email and clicks the confirmation link (leads to Flow 14).

**Views used:**
- `AppFooter` (shared shell, `src/layouts/AppFooter.tsx`)
- `NewsletterToast` (home page only)

---

### Flow 14 — Email Verification (Subscription Confirm)

**Actor:** Visitor (anonymous, arrived from email link)

**Goal:** Confirm email subscription via a tokenized link from the confirmation email.

**Entry points:**
- Email link: `/subscription?code=<code>&token=<token>&email=<email>`

**Steps:**
1. Visitor clicks the confirmation link in the subscription email.
2. `/subscription` page (`pages/subscription.tsx`) loads; `useSearchParams` reads `code`, `token`, `email` from query string.
3. `useEffect` evaluates the `code` param:
   - **No `code`:** redirects to `/404`.
   - **`200`:** success Alert — "Email verified: {email}"
   - **`201`:** success Alert — "Email already verified: {email}"
   - **`401`:** error Alert — "Invalid token or Email"
   - **`404`:** error Alert — "Email not found: {email}"
   - **`402` / `500`:** error Alert — "System error occurred staff has been notified."
4. Alert renders with appropriate severity (`success` or `error`).

**Views used:**
- `Email Verification` (`pages/subscription.tsx`)

---

### Flow 15 — HAL Admin Sign-In

**Actor:** Owner (Brian Stoker — email allowlist enforced)

**Goal:** Authenticate to access the HAL log viewer.

**Entry points:**
- Direct URL: `/hal`
- Unauthenticated state of `/hal` shows a "Sign In" button

**Steps:**
1. Owner navigates to `/hal` (`pages/hal.js`).
2. `useSession` (next-auth) returns no session — unauthenticated state renders: "Access Restricted" + "Sign In" button.
3. Owner clicks "Sign In" — `signIn()` from next-auth initiates the Google OAuth flow via `/api/auth/[...nextauth].js`.
4. Owner authenticates with their Google account.
5. NextAuth `signIn` callback checks `profile.email` against allowlist (`["brianstoker@gmail.com", "b@stokedconsulting.com", "b@brianstoker.com"]`).
   - **Allowed:** session created; redirected back to `/hal`.
   - **Denied:** sign-in rejected; error page shown by NextAuth.
6. With active session, the authenticated state of `/hal` renders (see Flow 16).

**Views used:**
- `HAL Logs (Admin)` (`pages/hal.js`) — unauthenticated state

**API routes:** `GET/POST /api/auth/[...nextauth]` (NextAuth Google OAuth)

---

### Flow 16 — HAL Log Inspection

**Actor:** Owner (authenticated)

**Goal:** View application logs and errors stored in S3.

**Entry points:**
- `/hal` after successful authentication (Flow 15)
- `/hal` with an active next-auth session

**Steps:**
1. Owner arrives at `/hal` with an active session.
2. Authenticated view renders: "HAL Logs" header + "Sign Out" button.
3. `useEffect` fires on session presence — `GET /api/hal/logs` is called.
4. API handler (`pages/api/hal/logs.js`) verifies the session via `getServerSession`; fetches `logs.txt` and `errors.txt` from S3 (`S3_BUCKET_NAME` env var).
5. Response populates `logs` and `errors` state.
6. `Tabs` render: "Logs" (tab 0) and "Errors" (tab 1). If errors are non-empty, "Errors" tab label turns `error.main` red.
7. `LogPanel` (dark monospace `<pre>`, maxHeight 70vh, scrollable) displays the active tab's content.
8. Owner switches to "Errors" tab — errors content renders in `LogPanel`.
9. Owner clicks "Sign Out" — `signOut()` called; redirected to unauthenticated state.

**Views used:**
- `HAL Logs (Admin)` (`pages/hal.js`) — authenticated state

**API routes:** `GET /api/hal/logs` (server-side session check + S3 fetch)

---

### Flow 17 — GitHub Events Sync (Scheduled / Automated)

**Actor:** System (AWS EventBridge cron)

**Goal:** Keep the MongoDB `github_events` collection current by syncing from the GitHub Events API hourly.

**Entry points:**
- AWS EventBridge `rate(1 hour)` schedule (configured in `stacks/cron.ts` via `sst.aws.Cron`)
- Local dev: `scripts/local-sync-cron.cjs` polls hourly via `setInterval`

**Steps:**
1. EventBridge triggers the Lambda function defined in `cron/github-sync.ts:handler` on the `rate(1 hour)` schedule.
2. Handler calls `syncGitHubEvents()` from `lib/github-sync.ts`.
3. `syncGitHubEvents` reads `GITHUB_TOKEN` and `GITHUB_USERNAME` from env; connects to MongoDB via `getDatabase()`.
4. **Incremental mode (default):** checks `sync_metadata` collection for last sync timestamp; fetches only pages of events newer than the last sync using the GitHub Events API (paginated, up to 10 pages).
5. **Full refresh mode (`fullRefresh=true`):** clears existing events; fetches all available pages from GitHub.
6. New events are upserted into `github_events` collection (duplicates skipped by GitHub event ID).
7. `sync_metadata` document updated with `lastSync`, `eventCount`, `success=true`.
8. Handler returns `{ statusCode: 200, newEventCount, duplicatesSkipped, totalEventsInDb, pagesChecked, lastSync }`.
9. On error: handler catches `SyncGitHubEventsError`; returns error status code and message; `sync_metadata` records `success=false`.

**API routes:** (internal) `lib/github-sync.ts` calls GitHub API directly; no Next.js HTTP hop in Lambda mode

---

### Flow 18 — GitHub Events Sync (Manual)

**Actor:** Developer or Owner

**Goal:** Manually trigger a GitHub event sync — incremental or full refresh.

**Entry points (dev):**
- `pnpm sync-cron` (`scripts/local-sync-cron.cjs` runs once immediately)
- Direct HTTP: `POST /api/github/sync-events` with `Authorization: Bearer <SYNC_SECRET>` header

**Entry points (production):**
- `POST /api/github/sync-events?fullRefresh=true` with `Authorization: Bearer <SYNC_SECRET>` header

**Steps:**
1. Developer/owner sends `POST /api/github/sync-events` with the correct `Authorization` header.
2. API handler (`pages/api/github/sync-events.ts`) verifies `Authorization: Bearer <SYNC_SECRET>` — returns 401 if missing/wrong.
3. Calls `syncGitHubEvents({ fullRefresh: req.query.fullRefresh === 'true' })`.
4. Same sync logic as Flow 17 executes.
5. Returns `200` JSON result on success; `4xx/5xx` with error details on failure.

**API routes:** `POST /api/github/sync-events`

---

## Cross-Flow Notes

### Client-side Event Cache
`GithubEvents` (`src/components/GithubEvents/GithubEvents.tsx`) uses a two-tier localStorage cache (`src/utils/eventCacheManager`):
- **Index cache:** up to 1000 lightweight entries (~200KB) for list display
- **Details cache:** up to 150 full events with LRU eviction (~300KB)

This cache is populated during Flows 4, 5, and 6 and reduces redundant API calls across page visits.

### Static Generation
`pages/bstoked.plan.tsx` and `pages/.plan/[slug].tsx` use `getStaticProps` / `getStaticPaths`. Blog content is baked at build time. The RSS feed (`/feed/.plan/rss.xml`) is regenerated at each build via `scripts/generateRSSFeed`.

### `HomeView` wrapper
All page-level views (except `pages/bstoked.plan.tsx`) delegate to the `HomeView` component (`pages/index.tsx:15`), which injects the shared `AppHeader` / `AppFooter` shell and accepts a `HomeMain` prop for the page body. This is not itself a user flow but is the structural entry point for every view.
