# SC_VIEWS.md

View classification for the v2.brianstoker.com portfolio site.
Meta version: 0.4.0 | Generated: 2026-05-26

---

## Overview

This is a Next.js 15 Pages Router app. All page-level views live under `pages/`. Every page view shares a common shell composed of `AppHeader` + `AppFooter` from `src/layouts/`. The `HomeView` wrapper (`pages/index.tsx:15`) injects the shared shell and accepts a `HomeMain` prop that swaps the body content; many pages re-use it.

Product reference: `SC_PRODUCT_BRIANSTOKER_COM.md` (the only product doc). All views below belong to that product unless otherwise noted.

---

## Shared Shell

### AppHeader
- **Location:** `src/layouts/AppHeader.tsx`
- **Regions:**
  - Logo / home link (`SvgBsLogomark`)
  - `HeaderNavBar` — horizontal nav (desktop, md+), dynamically imported (`src/components/header/HeaderNavBar.tsx`)
  - `HeaderNavDropdown` — hamburger/drawer nav (mobile, <md), dynamically imported (`src/components/header/HeaderNavDropdown.tsx`)
  - GitHub icon link (desktop only)
  - `ThemeModeToggle` — light/dark toggle (`src/components/header/ThemeModeToggle.tsx`)
- **States:**
  - Desktop (md+): full nav bar + icon row visible
  - Mobile (<md): dropdown drawer only; nav bar hidden

### AppFooter
- **Location:** `src/layouts/AppFooter.tsx`
- **Regions:**
  - Left column: `SvgBsLogotype` + `EmailSubscribe` newsletter form (`src/components/footer/EmailSubscribe.tsx`)
  - Right columns: two navigation columns — site links (Art, Photography, Drums, .plan, Work, Resume) and external links (Stoked Consulting, Stoked UI, LinkedIn, Discord, Slack)
  - Bottom bar: copyright + social icon strip (GitHub, RSS, Slack, LinkedIn, Discord, optional Stack Overflow)
- **States:**
  - Desktop (md+): two-column grid layout
  - Mobile (<md): single-column stacked

### AppHeaderBanner
- **Location:** `src/components/banner/AppHeaderBanner.tsx`
- **Usage:** Rendered only on the home page (`pages/index.tsx`), above the `AppHeader`.

### NewsletterToast
- **Location:** `src/components/home/NewsletterToast.tsx`
- **Usage:** Bottom-left client-only toast wrapped in `NoSsr`; rendered on the home page.
- **States:** Hidden by default; shown on mount with delay; dismissed via close button or after timeout.

---

## Page Views

---

### 1. Home — Portfolio Showcase

- **Route:** `/`
- **Location:** `pages/index.tsx`, `src/components/home/HeroMain.tsx`, `src/products.tsx`
- **Products:** SC_PRODUCT_BRIANSTOKER_COM.md (all 6 live products in `PRODUCTS`: work, art, photography, drums, resume, .plan)

**Regions:**
- `AppHeaderBanner` — top banner strip
- `AppHeader` — sticky header
- `NewsletterToast` — client-only toast (NoSsr), bottom-left
- **Hero body** (`src/products.tsx` `ProductsPreviews`):
  - Left panel: `BRIAN STOKER` headline + `ProductSwitcher` / `ProductCarousel` — vertical list of product items (desktop) or swipeable `MobileStepper` carousel (mobile); each item is a `Highlighter` button with product icon, name, description
  - Right panel: product showcase pane — renders the active product's `showcaseType` component inside a `Link` wrapper; width 726px on lg, flex-grow on md
- `AppFooter`

**Product Showcase Components (right pane):**

| Product | `showcaseType` | Location |
|---------|---------------|----------|
| Work | `GithubEventsShowcase` | `src/components/home/GithubEventsShowcase.tsx` |
| Art | `ImageShowcase` | `src/components/home/ImageShowcase.tsx` |
| Photography | `ImageShowcase` | `src/components/home/ImageShowcase.tsx` |
| Drums | `VideoShowcase` | `src/components/home/VideoShowcase.tsx` |
| Resume | `PdfShowcase` | `src/components/home/PdfShowcase.tsx` |
| .plan | `BlogShowcase` | `src/components/home/BlogShowcase.tsx` |

**States:**
- **SSR / pre-hydration:** shell renders, `main` body is empty string (client guard `isClient` at `pages/index.tsx:18`)
- **Client loaded, in-view=false:** product list visible, right showcase pane empty (intersection observer not triggered)
- **Client loaded, in-view=true:** full showcase renders for active product
- **Active product: Work** — `GithubEventsShowcase` with 10 events/page, `alwaysColumn` mode
- **Active product: Drums** — Plyr video autoplay (muted)
- **Active product: .plan** — `BlogShowcase` renders up to 5 most recent `BlogPost` cards
- **Mobile (<md):** swipeable carousel replaces vertical product list; `MobileStepper` dot nav shown

---

### 2. Work — GitHub Activity Dashboard

- **Route:** `/work`
- **Location:** `pages/work.tsx`, `src/components/GithubCalendar/GithubCalendar.tsx`, `src/components/GithubEvents/GithubEvents.tsx`
- **Products:** SC_PRODUCT_BRIANSTOKER_COM.md (Work product)

**Regions:**
- `AppHeader`
- `GithubCalendar` — full-width contribution heatmap (fx=`punch` animation mode)
- `GithubEvents` — paginated event list with filter controls + event detail panel
- `AppFooter`

**`GithubCalendar` sub-regions:**
- `ActivityCalendar` (react-activity-calendar) — SVG heatmap grid scrolled to most-recent week
- `hbngha-overlay` — decorative image injected at the left of the scroll container
- Month legend with year labels (`'21`, `'22`, etc.) replacing January ticks

**`GithubCalendar` states:**
- **Loading:** skeleton placeholder shown via `loading` prop on `ActivityCalendar`
- **Loaded, hidden:** scrolled to far right off-screen, `activityReady=false`
- **Ready:** scroll snapped to latest week, revealed
- **Hover:** month/day labels fade in after 200ms delay; `punch` fx triggers rect fly-out animations on hover
- **Error:** falls back to `defaultActivityData` (empty contributions)

**`GithubEvents` sub-regions:**
- Filter bar: repo `Autocomplete`, action type `Select`, date `TextField`, description `TextField`
- Event list: paginated 20/page; each row shows event type chip (color-coded), repo, date, message snippet
- Metadata panel: sticky detail view for selected event (desktop side-by-side; mobile stacked)
  - `PullRequestEvent` → `PullRequestView` with Commits / Files-changed tabs (`src/components/PullRequest/PullRequestView.tsx`)
  - `PushEvent` → commit list via `PushEvent` component (`src/components/GithubEvents/PushEvent.tsx`)
  - Other types: `CreateEvent`, `DeleteEvent`, `IssuesEvent`, `IssueCommentEvent`, `ForkEvent`, `ProjectsV2*` variants
- Mobile repo strip: horizontal scroll strip of repo chips sorted by most-recent event
- `Pagination` control

**`GithubEvents` states:**
- **Loading:** `CircularProgress` shown, list empty
- **Error:** error string displayed
- **Populated (desktop, ≥900px):** two-column layout — event list left, metadata panel right (sticky)
- **Populated (mobile, <900px):** single column — repo strip header, event list below; metadata panel stacked
- **Filtered:** one or more of repo/action/date/description filters active; pagination resets to page 1
- **Event selected:** metadata panel populates with full event JSON / PR tabs / commit info
- **`alwaysColumn` mode:** forces single-column regardless of viewport (used in home showcase)

---

### 3. Resume (Primary PDF Viewer)

- **Route:** `/resume`
- **Location:** `pages/resume.tsx`, `pages/resume-new.tsx` (shared `PdfDoc` component), `src/components/home/PdfShowcase.tsx`
- **Products:** SC_PRODUCT_BRIANSTOKER_COM.md (Resume product)

**Regions:**
- `AppHeader`
- Centered flex container with optional side icon column (visible ≥900px)
- `PdfDoc` — responsive PDF viewer (`pages/resume-new.tsx:95`)
  - `StyledDoc` (react-pdf `Document`) with hover-reveal `ButtonGroup` page controls
  - `Page` — single rendered PDF page canvas (`AnnotationLayer` + `TextLayer`)
  - Page controls: Prev `Fab`, `Page X of N` label, Next `Fab` (hover-only, bottom-center overlay)
- `AppFooter`

**States:**
- **Loading:** `containerWidth` is null; PDF not rendered until container measured
- **Loaded:** PDF renders at computed width (max 850px, minus 64px padding)
- **Multi-page:** prev/next Fabs enabled/disabled by `pageNumber` vs `numPages`
- **Narrow viewport (<900px):** icon column hidden, layout stacks vertically

---

### 4. Resume Scale (Experimental)

- **Route:** `/resume-scale`
- **Location:** `pages/resume-scale.tsx`

Same shape as the Resume view but uses `useResizeObserver` from `@wojtekmaj/react-hooks` for container width instead of a manual `ResizeObserver`. Reuses the same `PdfDoc` component from `pages/resume-new.tsx:95`. Experimental/alternate implementation kept alongside the primary route.

**States:** identical to the Resume view.

---

### 5. Photography Gallery

- **Route:** `/photography`
- **Location:** `pages/photography.tsx`, `src/components/LightboxGallery/index.tsx`
- **Products:** SC_PRODUCT_BRIANSTOKER_COM.md (Photography product)

**Regions:**
- `AppHeader`
- `ImageList` — MUI masonry 3-column grid of 10 photos (lazy-loaded, rounded corners, scale-on-hover)
- `LightboxGallery` — full-screen modal overlay (closed by default)
- `AppFooter`

**States:**
- **Grid default:** masonry grid visible, no modal
- **Lightbox open:** modal visible; current item displayed; arrow buttons navigate; Escape key closes
- **Arrow hover (left/right):** focused arrow turns primary color
- **Background hover:** backdrop cursor becomes pointer; close icon tints primary

---

### 6. Art Gallery

- **Route:** `/art`
- **Location:** `pages/art.tsx`, `src/components/LightboxGallery/index.tsx`
- **Products:** SC_PRODUCT_BRIANSTOKER_COM.md (Art product)

Identical layout and behavior to the Photography Gallery. Displays 12 artwork images in a 3-column masonry grid. Uses the same `LightboxGallery` component.

**States:** identical to the Photography Gallery.

---

### 7. Drums — Video Gallery

- **Route:** `/drums`
- **Location:** `pages/drums.tsx`, `src/components/video/videos.tsx`
- **Products:** SC_PRODUCT_BRIANSTOKER_COM.md (Drums product)

**Regions:**
- `AppHeader`
- `VideoGallery` — container `Box` wrapping video player component(s)
  - Three video entries: "Normal Guy" (QuickTime), "Golden Stream" (MP4), "Tell Me Mister" (MP4)
  - Each video uses HTML `<video>` with `controls`, `playsInline`, `muted`, `preload="metadata"`, `disablePictureInPicture`
  - Poster image shown before play
- `AppFooter`

**States:**
- **Default:** poster image shown, video paused
- **Playing:** native video controls active
- **Mobile:** `playsInline` prevents fullscreen auto-trigger

---

### 8. Blog Index — `bstoked.plan`

- **Route:** `/bstoked.plan`
- **Location:** `pages/bstoked.plan.tsx`
- **Products:** SC_PRODUCT_BRIANSTOKER_COM.md (.plan product)

**Regions:**
- `AppHeader`
- **Hero section** (`Section bg="gradient"`): overline `.plan`, h1 "notes, musings, and useless anecdotes" (GradientText)
- **Featured posts overlay** (negative-margin container): grid of the 2 most-recent `PostPreviewBox` cards (image + tags + title + description + author avatars + Read more button)
- **Main content area** (2-column grid on md+):
  - Left: post list (`PostPreview` items) with border separators + `Pagination`
  - Right sticky sidebar:
    - Tag filter paper: `Chip` list for filtering (filled = active, outlined = inactive, deletable when active)
    - Social links paper: GitHub, Slack, Discord, LinkedIn links
- `AppFooter`

**States:**
- **Unfiltered:** all posts (excluding top 2 featured) shown, paginated by 7
- **Filtered by tag:** tag chip becomes filled + deletable; list narrows; `page` resets to 0; tag stored in URL query param `?tags=`
- **Paginated:** `Pagination` navigates pages; scrolls `postListRef` into view on page change
- **No posts:** empty list (no explicit empty-state component; list simply renders nothing)

---

### 9. Blog Post — `.plan/[slug]`

- **Route:** `/.plan/[slug]`
- **Location:** `pages/.plan/[slug].tsx`, `src/modules/components/TopLayoutBlog.tsx` (from `@stoked-ui/docs`)
- **Products:** SC_PRODUCT_BRIANSTOKER_COM.md (.plan product)

**Regions:**
- Rendered by `TopLayoutBlog` from the `@stoked-ui/docs` package
- Receives `docs.en` (title, description, headers with authors/tags/date) and serialized MDX `source`
- Typical blog-post layout: metadata header (title, date, authors, tags), rendered MDX body

**States:**
- **Populated:** full MDX content rendered
- **Not found:** `getStaticPaths` uses `fallback: false`; unknown slugs yield Next.js 404

---

### 10. Plan Index — `/.plan`

- **Route:** `/.plan`
- **Location:** `pages/.plan/index.jsx`
- **Products:** SC_PRODUCT_BRIANSTOKER_COM.md (.plan product)

**Regions:**
- `AppHeader`
- Title block: "The Plan" h1 + subtitle
- `Grid` of `Card` components — one per blog post, sorted by date descending
  - Each card: date overline, title link, description, tag `Chip`s (first 3 + overflow chip)
  - Hover: `translateY(-4px)` lift + elevated shadow
- `AppFooter`

**States:**
- **Populated:** card grid rendered with all posts
- **Empty:** renders empty grid (no posts)

---

### 11. HAL Logs (Admin)

- **Route:** `/hal`
- **Location:** `pages/hal.js`

**Regions:**
- `AppHeader`
- **Unauthenticated state:** centered `Box` with "Access Restricted" heading, description, `Sign In` button (calls `signIn()` from next-auth)
- **Authenticated state:**
  - Header row: "HAL Logs" h4 + `Sign Out` button
  - Optional fetch-error message
  - `Tabs` — "Logs" / "Errors" (Errors tab text turns `error.main` if errors exist)
  - `LogPanel` — dark monospace `<pre>` container (maxHeight 70vh, overflow auto) showing log or error text
- `AppFooter`

**States:**
- **Unauthenticated:** sign-in prompt, no log content
- **Authenticated, loading:** `useEffect` fires fetch; logs empty string initially
- **Authenticated, logs loaded:** Logs tab shows output; Errors tab shows errors or "No errors."
- **Fetch error:** inline error Typography displayed above tabs
- **Tab: Logs (0):** `logs` string rendered in `LogPanel`
- **Tab: Errors (1):** `errors` string rendered in `LogPanel`; tab label turns red if non-empty errors exist

---

### 12. Subscription / Email Verification

- **Route:** `/subscription?code=<code>&token=<token>&email=<email>`
- **Location:** `pages/subscription.tsx`

**Regions:**
- `AppHeader`
- Section with "Subscription" h2
- `Alert` — severity + message derived from `?code=` query param
- `AppFooter`

**States:**
- **No `code` param:** immediate redirect to `/404`
- **code=200:** success alert — "Email verified: {email}"
- **code=201:** success alert — "Email already verified: {email}"
- **code=401:** error alert — "Invalid token or Email"
- **code=404:** error alert — "Email not found: {email}"
- **code=402 / 500:** error alert — "System error occurred staff has been notified."

---

### 13. Components Listing

- **Route:** `/components`
- **Location:** `pages/components.tsx`

**Regions:**
- `AppHeader`
- "All Components" h2
- Responsive grid (`repeat(auto-fill, minmax(200px, 1fr))`) of component categories
  - Each category: section heading + `List` of `ListItemButton` links with right-arrow icon
  - Nested categories render a sub-heading and sub-list
- `AppFooter`

**States:**
- **Populated:** all component pages from `data/pages` rendered
- No loading or empty state — data is statically provided

---

### 14. 404 Not Found

- **Route:** Next.js custom 404 (`pages/404.tsx`)
- **Location:** `pages/404.tsx`, `src/components/NotFoundHero.tsx`

**Regions:**
- `AppHeader` (via `HomeView`)
- `NotFoundHero` (`src/components/NotFoundHero.tsx`):
  - Decorative mock browser frame with `SearchOffRoundedIcon` (faded primary)
  - Mobile variant: bottom-bar handle element instead of top traffic-light dots
- `AppFooter`

**States:**
- Single state — no loading, no interaction

---

## Shared Sub-Views / Panels

### PullRequestView

- **Location:** `src/components/PullRequest/PullRequestView.tsx`
- **Usage:** Rendered inside the `GithubEvents` metadata panel when a `PullRequestEvent` is selected.

**Regions:**
- Optional title + PR number header
- `StyledTabs` — "Commits (N)" / "Files changed (N)" tabs
- **Commits tab:** `CommitsList` (`src/components/PullRequest/CommitsList.tsx`)
- **Files changed tab:**
  - `StatsBox` — "Showing N changed files with X additions and Y deletions"
  - `FileChanges` (`src/components/PullRequest/FileChanges.tsx`) — expandable file-diff list

**States:**
- **Tab 0 (Commits):** commit list rendered
- **Tab 1 (Files):** stats bar + file-diff view rendered

---

### LightboxGallery (Modal Overlay)

- **Location:** `src/components/LightboxGallery/index.tsx`
- **Usage:** Photography (`pages/photography.tsx`) and Art (`pages/art.tsx`) pages.

**Regions:**
- `Backdrop` (dark, 90% opacity)
- Close `IconButton` (top-right)
- Left/right transparent click zones (50% width each) for prev/next navigation
- Left `ArrowBackIosNewIcon` button
- Media: `<img>` (image type) or `<video controls autoPlay>` (video type) — maxHeight 90vh, maxWidth 90vw
- Right `ArrowForwardIosIcon` button

**States:**
- **Closed:** `open={false}`, not rendered
- **Open:** modal visible, current item displayed
- **Left hover:** left arrow turns primary; cursor `w-resize` in left half
- **Right hover:** right arrow turns primary; cursor `e-resize` in right half
- **Background hover:** close icon tints primary; cursor pointer on backdrop

---

### GithubEventsShowcase (Inline Showcase)

- **Location:** `src/components/home/GithubEventsShowcase.tsx`
- **Usage:** Home showcase pane when the "Work" product is active; configured with `{eventsPerPage: 10, alwaysColumn: true}`.

**Regions:**
- Scrollable `Box` (maxHeight 970px, overflow-y auto)
- `GithubEvents` component with `fx='highlight'` and `alwaysColumn=true`

**States:** see `GithubEvents` states above; `highlight` fx adds a rect-highlight CSS class on hover.

---

### BlogShowcase (Inline Showcase)

- **Location:** `src/components/home/BlogShowcase.tsx`
- **Usage:** Home showcase pane when the ".plan" product is active; receives `mostRecentPosts` (up to 5 posts).

**Regions:**
- `Stack` of `PostPreviewBox` cards (defined in `pages/bstoked.plan.tsx`)

**States:**
- **Populated:** post cards rendered
- **Empty:** renders an empty `Stack` when no posts are passed

---

### PdfShowcase (Inline Showcase)

- **Location:** `src/components/home/PdfShowcase.tsx`
- **Usage:** Home showcase pane when the "Resume" product is active.

Wraps `PdfDoc` inside `MediaShowcase` with overflow hidden. Same interactive states as the full Resume view (PDF renders once `containerWidth` is measured; page navigation on hover).

---

### VideoShowcase (Inline Showcase)

- **Location:** `src/components/home/VideoShowcase.tsx`
- **Usage:** Home showcase pane when the "Drums" product is active.

Wraps a Plyr player (dynamically imported) inside `MediaShowcase`. Autoplay + muted. Shows poster until playback starts.

---

### ImageShowcase (Inline Showcase)

- **Location:** `src/components/home/ImageShowcase.tsx`
- **Usage:** Home showcase pane for the Art and Photography products.

Wraps a single `<img>` (objectFit cover, borderRadius 12px) inside `MediaShowcase`. No interaction.

---

## Terminal / CLI Output Views

This project has no end-user CLI. The `scripts/` directory contains build, deploy, and data-sync utilities (`local-sync-cron.cjs`, `populate-github-activity.js`, `list-db-info.ts`, `reportBrokenLinks.js`, etc.) that emit progress and error messages to stdout/stderr using plain `console.log` / `console.error`. They are not interactive views and do not have formatted output panels worth classifying as views.

---

## Route → View Map

| Route | View | Page File |
|-------|------|-----------|
| `/` | Home Portfolio Showcase | `pages/index.tsx` |
| `/work` | Work GitHub Dashboard | `pages/work.tsx` |
| `/resume` | Resume PDF Viewer | `pages/resume.tsx` |
| `/resume-scale` | Resume Scale (experimental) | `pages/resume-scale.tsx` |
| `/photography` | Photography Gallery | `pages/photography.tsx` |
| `/art` | Art Gallery | `pages/art.tsx` |
| `/drums` | Drums Video Gallery | `pages/drums.tsx` |
| `/bstoked.plan` | Blog Index | `pages/bstoked.plan.tsx` |
| `/.plan` | Plan Index (card grid) | `pages/.plan/index.jsx` |
| `/.plan/[slug]` | Blog Post (MDX) | `pages/.plan/[slug].tsx` |
| `/hal` | HAL Logs (admin) | `pages/hal.js` |
| `/subscription` | Email Verification | `pages/subscription.tsx` |
| `/components` | Components Listing | `pages/components.tsx` |
| `*` (404) | Not Found | `pages/404.tsx` |
