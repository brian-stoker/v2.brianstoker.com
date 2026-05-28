<!-- stokd-meta-version: 0.4.0 -->
# SC_MODULE — scripts

## Module Name & Location

- **Module name:** `scripts`
- **Package location:** `scripts/` (repo-relative)
- **Inner package marker:** `scripts/package.json` declares a nested ES-module package `github-activity-scripts@1.0.0` with its own dependency tree (`@aws-sdk/client-s3`, `date-fns-tz`, `dotenv`, `node-fetch`). All other scripts execute under the parent `brianstoker-com` package's dependencies and are invoked from the root `package.json` `scripts` block.
- **Local tsconfig:** `scripts/tsconfig.json` extends `../tsconfig.json` with `noEmit: true`, `allowJs: true`, `isolatedModules: true` and is type-checked as part of `pnpm typescript` (`tsc -p tsconfig.json && tsc -p scripts/tsconfig.json`).

## Responsibility

`scripts/` is the **out-of-band operations module** for the `brianstoker-com` application. It contains build wrappers, deployment drivers, local development helpers, data-backfill jobs, and infrastructure plumbing that run outside the Next.js request/response path. The directory has three coherent concerns:

1. **Build pipeline glue** — wrapping `@opennextjs/aws build`, patching the resulting Lambda artifact for `caniuse-lite` and `browserslist`, regenerating PWA icons, and producing the service worker.
2. **Deployment & infrastructure ops** — bash drivers that wrap `senvn` + `sst` commands and shell scripts that configure GitHub Actions secrets from the local `.env.production`.
3. **GitHub activity / MongoDB data jobs** — the local-only cron driver that fans calls to `/api/github/sync-events`, plus one-shot S3 backfill scripts that publish a public activity JSON to `s3://cenv-public/brian-stoker-github-activity.json`. MongoDB schema mirroring and inspection (`copy-db-schema.ts`, `list-db-info.ts`) sit alongside.

There is no shared library or runtime exported from `scripts/`. Each file is an independent entry point invoked from `package.json` (or directly from a shell).

## Public Interfaces / Entry Points

All entry points are scripts (`node`, `tsx`, or `bash`) invoked from `package.json` at the repo root or directly from the shell. There is no programmatic surface area consumed by other TypeScript modules; the only `module.exports` is the diagnostic helper pair `parseDocFolder` / `getAnchor` in `reportBrokenLinks.js` (used only when the script is imported elsewhere).

| Entry point | Invoked as | Purpose |
|---|---|---|
| `build-prod.js` | `pnpm build:production` | Sets `NODE_ENV=production` and shells `pnpx @opennextjs/aws@latest build` from the repo root. |
| `buildServiceWorker.js` | `pnpm build-sw` | Copies `src/sw.js` to `export/sw.js` and prepends a build-time UUID comment. |
| `buildIcons.js` | `pnpm icons` | Uses GraphicsMagick (`gm`) to resize `public/static/logo.png` into seven PWA icon sizes under `public/static/icons/`. |
| `reportBrokenLinks.js` | `pnpm link-check` | Walks `pages/`, parses MDX imports tagged `?muiMarkdown`, and writes `.link-check-errors.txt` listing internal links with no resolving page or anchor. Also `module.exports` `{ parseDocFolder, getAnchor }`. |
| `fix-next-lambda.cjs` | invoked manually (legacy) | Reinstalls `caniuse-lite@latest`, copies it into each candidate standalone build dir, injects a `browserslist-loader` shim, and prepends a loader-require to `server.js`/`index.js`/`app.js`. Not wired into the current `package.json` flow but kept as a recovery tool. |
| `local-sync-cron.cjs` | `pnpm dev:cron`, `pnpm sync-cron` | Local-only cron driver. POSTs `${SYNC_ENDPOINT}/api/github/sync-events` with `Authorization: Bearer ${SYNC_SECRET}` immediately and then every `INTERVAL_HOURS=1`. Supports `FULL_REFRESH=true` to append `?fullRefresh=true`. Stays alive on missing `SYNC_SECRET` so `turbo watch` does not treat it as a crash; ignores `SIGHUP` for the same reason. |
| `populate-github-activity.js` | manual (`node scripts/populate-github-activity.js`) | One-shot. Pages `GET https://api.github.com/users/${GITHUB_USERNAME}/events`, aggregates per day, computes `level ∈ 0..4`, and puts the JSON to `s3://cenv-public/brian-stoker-github-activity.json`. Throttles when `x-ratelimit-remaining < 5`. |
| `populate-github-activity-history.js` | `pnpm populate-history` (inside `scripts/` package) | One-shot, GraphQL-based. Queries `user.contributionsCollection.contributionCalendar` for the last 5 years (one year per request, 1 s spacing) and writes the same S3 object. Includes `includePrivateContributions: true`. |
| `copy-db-schema.ts` | `pnpm copy-db-schema` | Connects via `MONGODB_URI`, copies every collection definition and non-default index from `brianstoker-production` to `brianstoker-local`, and additionally creates `github_events`, `github_rate_limits`, and `sync_metadata` if missing. |
| `list-db-info.ts` | `pnpm list-db-info` | Lists every Mongo database, its size in MB, and the document count per collection. Connects with `MONGODB_URI`. |
| `generateRSSFeed.ts` | imported (not a CLI) | Exports `default function generateRssFeed(allBlogPosts)` that writes `public${ROUTES.rssFeed}` using the `feed` package. Hard-guards on `NODE_ENV !== 'production'` and exits silently otherwise. |
| `setupLogShipping.cjs` | `pnpm log:setup`, invoked at the end of `aws-deploy.sh deploy` | Uploads `~/.openclaw/logs/gateway.log` → `s3://${S3_BUCKET_NAME}/logs.txt` and `gateway.err.log` → `errors.txt`. Skips missing files; exits 1 if `S3_BUCKET_NAME` is unset. |
| `aws-deploy.sh` | `pnpm deploy:prod`, `pnpm remove:prod` | Bash driver. Accepts `deploy\|remove`; runs `senvn -f production npx sst {deploy,remove} --stage production`. On deploy, runs `setupLogShipping.cjs` with `AWS_PROFILE=stoked` (non-fatal if it fails). |
| `configure-github-secrets.sh` | manual | Reads `.env.production` + `aws configure` output and pushes 9–12 secrets into the `brian-stoker/v2.brianstoker.com` repo via `gh secret set`. Requires `workflow` and `admin:public_key` gh scopes; transforms `GITHUB_TOKEN` from `.env.production` into the `GH_TOKEN` repo secret. |
| `show-secrets-values.sh` | manual | Prints the same secret values to stdout for manual paste into the GitHub UI. Intentionally not safe to run in CI. |

## Products

This module supports a single product:

- **SC_PRODUCT_BRIANSTOKER_COM.md** (`brianstoker-com`) — every entry point above belongs to this product. Its sibling module `api/` is documented under `.stokd/meta/api/SC_MODULE.md`; `scripts/` complements `api/` by handling the build/deploy/data-ops surface that `api/` cannot.

## Views

`scripts/` renders no end-user views. Per `.stokd/meta/SC_VIEWS.md` §"CLI / Diagnostic Surfaces", the scripts emit progress/error messages to stdout/stderr via plain `console.log` / `console.error` and are explicitly excluded from the view inventory.

It does, however, **materially shape** the following data backings that views consume:

- The **GitHub activity calendar / events feed** views (`GithubEvents`, `GithubCalendar`) are populated by `local-sync-cron.cjs` (locally) and the SST-driven hourly Lambda (production). `populate-github-activity{,-history}.js` produce the public S3 JSON that powered the legacy contribution heat map.
- The **PWA install icons** referenced by the manifest are produced by `buildIcons.js`.
- The **service worker** loaded by the static export is built by `buildServiceWorker.js`.
- The **RSS feed** at `public${ROUTES.rssFeed}` is produced by `generateRSSFeed.ts` during production builds (when imported by the build pipeline).

## Integration Points

### Upstream (this module depends on)

| Dependency | Used by | Notes |
|---|---|---|
| `pnpx @opennextjs/aws@latest` | `build-prod.js` | Executed from repo root with `NODE_ENV=BABEL_ENV=production`. |
| `gm` (GraphicsMagick) | `buildIcons.js` | Native binary must be available on the host. |
| `@stoked-ui/docs-markdown`, `marked` | `reportBrokenLinks.js` | Markdown rendering for link extraction. |
| `feed` package | `generateRSSFeed.ts` | RSS2 serialization. |
| `mongodb` driver | `copy-db-schema.ts`, `list-db-info.ts` | Reads `MONGODB_URI` directly via `dotenv`. **No** dependency on `pages/api/lib/mongodb.ts` — scripts hold their own short-lived `MongoClient`. |
| `@aws-sdk/client-s3` | `populate-github-activity*.js`, `setupLogShipping.cjs` | Region pinned to `us-east-1`. Bucket targets are public (`cenv-public`) or environment-driven (`S3_BUCKET_NAME`). |
| `node-fetch` (CJS) / `fetch` (ESM) | `populate-github-activity*.js` | GitHub REST + GraphQL. |
| `dotenv` / `dotenvx` | every script + the surrounding `pnpm` recipes | Loads `.env` for local runs and `.env.production` for deploys. |
| `senvn` | `aws-deploy.sh` | Production-stage env loader, gates the AWS account check via `.deploy.json`. |
| `gh` CLI | `configure-github-secrets.sh` | Requires `workflow` and `admin:public_key` scopes. |

### Downstream (consumers of this module's outputs)

| Consumer | What it consumes |
|---|---|
| `pages/api/github/sync-events` | HTTP POSTs from `local-sync-cron.cjs` (and from the SST cron in production). The script is the only "client" of the local endpoint. |
| `public/static/icons/*.png` | Produced by `buildIcons.js`; referenced by the PWA manifest. |
| `export/sw.js` | Produced by `buildServiceWorker.js`; shipped with the static export. |
| `s3://cenv-public/brian-stoker-github-activity.json` | Populated by `populate-github-activity{,-history}.js`. Public, read by any front-end calendar component that fetches it directly. |
| `.link-check-errors.txt` | Written by `reportBrokenLinks.js`; read by developers / CI checks. |
| AWS deploy artifacts (`.next/standalone`, `open-next/standalone`) | Modified in-place by `fix-next-lambda.cjs` when invoked. |
| GitHub repo secrets (`AWS_ACCESS_KEY_ID`, `MONGODB_URI`, `GH_TOKEN`, …) | Created/overwritten by `configure-github-secrets.sh`. |
| MongoDB cluster (`brianstoker-local`) | Schema/index targets of `copy-db-schema.ts`. |

### Contracts worth flagging

- `local-sync-cron.cjs` requires the **exact bearer-token contract** of `pages/api/github/sync-events`: `Authorization: Bearer ${SYNC_SECRET}`, `POST`, optional `?fullRefresh=true`. Changing either side without the other will silently regress hourly sync.
- `copy-db-schema.ts` hard-codes source/target DB names (`brianstoker-production` → `brianstoker-local`). It also hard-codes the GitHub collections list (`github_events`, `github_rate_limits`, `sync_metadata`); if `api`/`pages/api` introduce new collections, this list must be updated.
- `populate-github-activity{,-history}.js` both write to **`cenv-public`**, which is *not* the SST-managed `HalBucket`. That bucket is owned outside this app and is implicitly public — never reuse it for sensitive data.
- `aws-deploy.sh` defers AWS-account verification entirely to `senvn` via `.deploy.json`. The script itself does not call `sts get-caller-identity`.

## Key Source Files

| File | Why it matters |
|---|---|
| `scripts/local-sync-cron.cjs` | Production parity for the hourly cron job. Bearer-auth + JSON response parsing tightly couples this file to `pages/api/github/sync-events`. The deliberate `setInterval(..., 1<<30)` no-op when `SYNC_SECRET` is missing keeps `turbo watch dev:cron` from flagging a crash; the `SIGHUP` handler keeps it alive across hot-reloads. |
| `scripts/build-prod.js` | The sole production-build entry point. If `pnpx @opennextjs/aws@latest` is unavailable, every production deploy breaks. |
| `scripts/fix-next-lambda.cjs` | Encodes the `caniuse-lite` / `browserslist` workaround for Next on Lambda. Even though it is not currently wired into the default build flow, it is the documented recovery path for the recurring "missing caniuse-lite" cold-start failures. |
| `scripts/aws-deploy.sh` | Single source of truth for production `sst deploy` and `sst remove`. Wraps `senvn` so the AWS account check cannot be bypassed accidentally. |
| `scripts/copy-db-schema.ts` | Encodes assumptions about which Mongo collections must exist locally. Drift between this list and the application's actual collections is the most common cause of "works in prod, fails locally" sync bugs. |
| `scripts/populate-github-activity-history.js` | The only script in the repo that uses the GitHub **GraphQL** API (everything else uses REST events). It carries `includePrivateContributions: true`, so the token's scope materially affects the output. |
| `scripts/setupLogShipping.cjs` | Final step of every production deploy. The hard-coded source paths (`~/.openclaw/logs/{gateway,gateway.err}.log`) and key names (`logs.txt`, `errors.txt`) are the contract with whatever consumes the shipped logs. |
| `scripts/reportBrokenLinks.js` | The only static-analysis pass against documentation routing. Its exported `parseDocFolder` / `getAnchor` are referenced by external link-check tooling per the inline comment. |
| `scripts/configure-github-secrets.sh` | The repo's only on-ramp for GitHub Actions deployment credentials. Renaming or removing any secret here without updating the workflow files will break CI. |

## Change Impact

When this module changes, validate the following — most failures are silent at the source and only surface downstream.

| If you change… | Validate |
|---|---|
| `local-sync-cron.cjs` | `pnpm dev:cron` boots without crashing under `turbo watch`; confirm POST succeeds against `/api/github/sync-events` (200 + JSON envelope `{ mode, newEventCount, totalEventsInDb, pagesChecked }`); confirm `FULL_REFRESH=true` appends the query param. |
| Anything that hits `pages/api/github/sync-events` | Re-verify the bearer-token contract; cross-check with `cron/github-sync.ts` (the production handler) so the Lambda and the local script stay in lockstep. |
| `build-prod.js` or `build:production` | Run `pnpm build:production` end-to-end against a clean `.next/`; confirm the OpenNext build emits `open-next/` and the standalone Lambda boots locally. |
| `buildIcons.js` | `pnpm icons` regenerates all seven sizes; check `public/static/icons/{48,96,180,192,256,384,512}x*.png` exist and PWA manifest references resolve. |
| `buildServiceWorker.js` | `pnpm build-sw`; verify `export/sw.js` exists and starts with a fresh `// uuid:` line. |
| `reportBrokenLinks.js` | `pnpm link-check`; `.link-check-errors.txt` is regenerated; confirm exported `{parseDocFolder, getAnchor}` shape is unchanged. |
| `fix-next-lambda.cjs` | Run after a build with a known-broken `caniuse-lite` cold start; verify `node_modules/caniuse-lite` appears under every detected standalone build dir and `browserslist-loader` is prepended exactly once. |
| `populate-github-activity*.js` | Run with a scoped `GITHUB_TOKEN`; verify the S3 object at `s3://cenv-public/brian-stoker-github-activity.json` contains `{ data: […], lastUpdated: ISOString }` and `level` values stay within `0..4`. |
| `copy-db-schema.ts` | `pnpm copy-db-schema` against a *separate* test cluster (never your shared dev cluster) and reconcile the GitHub collections list against `pages/api/lib/mongodb.ts` consumers. |
| `list-db-info.ts` | `pnpm list-db-info` prints DB sizes and collection document counts — pure read, but verify it never writes. |
| `aws-deploy.sh` | Dry-run `senvn -f production sst diff` first; only then `pnpm deploy:prod`. Confirm `setupLogShipping.cjs` runs (warning printed but exit 0 on failure). |
| `setupLogShipping.cjs` | `S3_BUCKET_NAME` must be present; missing log files should be warned, not fatal; uploaded keys must remain exactly `logs.txt` and `errors.txt`. |
| `configure-github-secrets.sh` | `gh secret list -R brian-stoker/v2.brianstoker.com` shows all required + optional secrets; CI workflow file references those exact secret names. |
| `generateRSSFeed.ts` | Production build emits `public${ROUTES.rssFeed}` with valid RSS2 XML; in non-production the function is a no-op. |
| `scripts/package.json` / `scripts/tsconfig.json` | `pnpm typescript` (which runs `tsc -p scripts/tsconfig.json`) must still pass; the nested dependency tree (e.g. `node-fetch@3`) must not be reintroduced to the parent app's dependency closure. |
