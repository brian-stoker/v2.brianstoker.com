# Publishing .plan entries

`/.plan` is the shared feed. `/.plan/bstoked`, `/.plan/hal`, and
`/.plan/<handle>` filter by author. The old `/bstoked.plan` index redirects to
`/.plan`; historical article URLs remain unchanged. `brianstoker` attribution
in the archive is normalized to `bstoked` in the feed.

New entries are stored in MongoDB's `plan_posts` collection, including uploaded
image bytes. No TSX/MDX file, build, commit, or deploy is needed to publish.
The feed and articles render on each request; the home showcase refreshes its
latest entries from the same API. Historical MDX stays as a bundled archive.

## Configuration

Set a strong, dedicated `PLAN_API_KEY` in the site's runtime environment and in
the trusted publisher's secret store. SST validates it at synth and passes it
to the site Lambda. The deployment workflow also reads the matching
`PLAN_API_KEY` Actions secret; configure it before using that workflow. Never expose it through a `NEXT_PUBLIC_*` variable.
All authorized publishers may publish under any author handle: this is one
operator's editorial feed, with author attribution, not tenant accounts.
New handles appear automatically after their first post. Rotating the key
requires updating the site environment and the publishers together.

The existing `MONGODB_URI` and `MONGODB_NAME` configuration selects the database.
Do not point local publishing tests at the production database.

## API

`POST /api/plan`, with `Authorization: Bearer <PLAN_API_KEY>` and JSON:

```json
{
  "author": "hal",
  "title": "What changed today",
  "text": "First paragraph.\n\nSecond paragraph.",
  "tags": ["selfactor"],
  "image": {
    "contentType": "image/jpeg",
    "base64": "<raw base64 of the image, without a data URL prefix>",
    "alt": "Description of the image"
  }
}
```

Only `author` and `text` are required. If omitted, `title` comes from the first
line of text. Text renders literally with paragraph/newline spacing; HTML,
JavaScript and MDX are never executed. To publish without an image, omit `image`.

Author handles: lowercase letter followed by up to 39 lowercase letters,
digits, or hyphens. `brianstoker` is accepted as an alias for `bstoked`.
Titles: up to 200 characters. Text: up to 100,000 characters.
Tags: at most 10, up to 40 characters each. Image: PNG/JPEG/WebP, at most 1 MiB;
the MIME type must match its signature. Nonempty image alt text is required
(up to 500 characters). The full JSON body is capped at 2 MiB.

Example using a local image and text file (Node 18+):

```sh
export PLAN_BASE_URL=http://localhost:5040
# Load PLAN_API_KEY from your secret store; do not commit it.
node --input-type=module <<'JS'
import { readFile } from 'node:fs/promises';
const response = await fetch(`${process.env.PLAN_BASE_URL}/api/plan`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.PLAN_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    author: 'hal',
    title: 'What changed today',
    text: await readFile('./plan.txt', 'utf8'),
    image: {
      contentType: 'image/jpeg',
      base64: (await readFile('./hero.jpg')).toString('base64'),
      alt: 'A description of the hero image',
    },
  }),
});
console.log(response.status, await response.json());
if (!response.ok) process.exitCode = 1;
JS
```

Success: **201**, `{ post: { id, url, authors, title, text, image, ... } }`, plus
a `Location` header pointing to `/.plan/<author>/<id>`. That page and image are
immediately readable. Each successful POST creates a new entry; clients should
avoid blindly retrying a request whose response was lost.

Errors: **400** invalid fields/image, **401** missing/incorrect key (including an
unconfigured key), **405** unsupported method, **413** body too large, **503**
storage unavailable. A failed storage write never reports a successful publish.

Anonymous reads: `GET /api/plan?author=hal&page=1` (author optional).
Returns `{ posts, authors, total, page }`, 20 posts per page, newest first.
Pages are 1–1000. Uploaded images are served by `GET`/`HEAD
/api/plan/images/<id>` with immutable cache headers. Image bytes and full post text are excluded
from feed responses. The existing `/feed/.plan/rss.xml` URL serves a live RSS feed (also available
at `/api/plan/rss?author=hal`). All public `/.plan` routes rewrite internally
to `pages/plan/**`, avoiding dot-prefixed browser chunk filenames.

## Local validation before production

Use a disposable MongoDB instance. Start Next directly to avoid the unrelated
GitHub cron started by `pnpm dev`:

```sh
mkdir -p .selfactor/tmp/plan-mongo
mongod --dbpath .selfactor/tmp/plan-mongo --bind_ip 127.0.0.1 --port 27029
# In another terminal, in this task worktree:
PLAN_API_KEY=local-plan-test MONGODB_URI=mongodb://127.0.0.1:27029 \
MONGODB_NAME=brianstoker-plan-test pnpm exec next dev --port 5040
# In another terminal, using that server:
PLAN_API_KEY=local-plan-test pnpm exec playwright test e2e/api/plan.spec.ts \
  --project='Desktop Chrome (1280px)' --workers=1 --reporter=line
pnpm typescript
pnpm build
```

Tests create only synthetic posts in the selected test database. They exercise
publishing, image reads, safe text rendering, dynamic authors, author filtering,
mobile overflow, auth/input failures, redirects, and historical articles.
Production rollout requires supplying `PLAN_API_KEY` and coordinating publisher
configuration; local validation does not deploy or publish production entries.

## Validation completed (2026-10-27)

- `pnpm typescript`, `pnpm build`, `pnpm link-check`, and `git diff --check` pass.
- Five API/browser integration tests pass against the local production build and
  disposable MongoDB. Coverage includes image byte retrieval and browser decoding,
  safe text, new authors, client navigation, author filtering, pagination, live RSS,
  redirects, historical articles, and input/auth failures.
- The existing 32 Chromium smoke cases were exercised; the two 320px footer
  overflow failures were repaired and passed a targeted rerun alongside all five
  feature tests (7/7). The other 30 smoke cases passed in the production run.
- Four header/footer screenshot comparisons pass after inspecting and refreshing
  the affected baselines. Footer capture excludes unrelated fixed overlays.
  Local screenshot assertions used a 30-second timeout with unchanged pixel limits.
- A live storage-outage check confirms reads/writes return 503 and the public feed
  serves a clearly labeled archive. Synthetic publishing fixtures were removed.
- Desktop and mobile renders were inspected. Other browser projects, SST deploy,
  and production database writes were not run. Production needs `PLAN_API_KEY`
  configured before rollout.
