<!-- stokd-meta-version: 0.4.0 -->
# SC_AXIOMS — v2.brianstoker.com (repo-wide)

Repo-global invariants for the `v2.brianstoker.com` codebase. Module- and
product-scoped axioms continue to live in their own files:

- Product: `.stokd/meta/SC_PRODUCT_BRIANSTOKER_COM.md` (§ Product Axioms)
- Module: `api/.axioms.md`, `scripts/.axioms.md` and `.stokd/meta/<package>/SC_MODULE.md`

Only invariants that span the entire repository (every package, every entry
point, every flow) belong in this file. Promotion from a module/product axiom
to a repo-wide axiom requires concrete cross-cutting evidence in the metadata.

---

## AX-REPO-AWS-PROFILE-DISCIPLINE: AWS access goes through the `stokd-cloud` profile or `senvn`
Any code path or operator command that touches AWS APIs in this repo MUST acquire credentials through `AWS_PROFILE=stokd-cloud` (account `167217327520`, explicitly exported) or through `senvn -f <stage>` loading `.deploy.json`; ambient default-profile credentials MUST NOT be used because they may resolve to an unrelated customer account. (Refreshed 2026-06-09: corrected from the pre-migration `stoked` profile following the `stoked → stokd-cloud` account migration in commit `f1bd28b`; the invariant — never use ambient creds — is unchanged.)

### Acceptance Checks
- `rg -n "AWS_PROFILE" scripts/ stacks/ .github/workflows/` shows every direct AWS invocation either sets `AWS_PROFILE=stokd-cloud` or is wrapped by `senvn -f production` / `senvn -f <stage>`.
- `rg -n "AWS_PROFILE=stoked\b" scripts/ stacks/ .github/ package.json` returns no matches (the pre-migration profile name must not reappear).
- `rg -n "senvn -f " scripts/aws-deploy.sh package.json` shows production SST commands are gated by `senvn`.
- manual: a deploy attempted without `AWS_PROFILE=stokd-cloud` (and without `senvn`) is stopped before it reaches `sst deploy`.

---

## AX-REPO-NO-GIT-STASH-OR-CHECKOUT: Never stash, never switch branches in this worktree
No tooling, script, hook, or agent action in this repo may execute `git stash`, `git stash push`, `git checkout <branch>`, `git reset --hard`, or `git restore .` on a dirty working tree. Branch-switching MUST go through `git worktree add`. Preservation of uncommitted work MUST happen via a real commit on the current branch.

### Acceptance Checks
- `rg -n "git stash" scripts/ .github/ stacks/ governance-harness/ 2>/dev/null` returns no matches (the directory may be absent, in which case `rg` reports nothing, which still satisfies the check).
- `rg -n "git checkout " scripts/ .github/workflows/` shows only `actions/checkout` references or worktree-related uses, never an interactive branch switch on the active worktree.
- manual: see global rule in `~/.stokd/meta/SC_CONTEXT.md` and the "Git Safety — MANDATORY" section; any new automation that needs a different branch creates a worktree instead.

---

## AX-REPO-MONGO-ATLAS-APPNAME: Every MongoClient is tagged with a `brianstoker-*` appName
Every place this repo opens a MongoDB Atlas connection MUST construct its `MongoClient` with an `appName` that begins with `brianstoker-` so the connection is attributable in Atlas. The three current taggings are `api/lib/mongodb.ts` → `brianstoker-api`, `lib/mongodb.ts` → `brianstoker-site` (cron + site), and `pages/api/lib/mongodb.ts` → `brianstoker-pages-api`. New Mongo entry points MUST add their own distinct `brianstoker-*` tag rather than reuse an existing one.

### Acceptance Checks
- `rg -n "appName" api/lib/mongodb.ts lib/mongodb.ts pages/api/lib/mongodb.ts` shows all three `brianstoker-*` values present.
- `rg -n "new MongoClient" --type ts --type js` shows every instantiation either lives in one of the three singleton modules above, or is a short-lived script that still passes an explicit `appName`.
- manual: an Atlas connection list snapshot shows only `brianstoker-*` app names originating from this repo.

---

## AX-REPO-PAGES-ROUTER-ONLY: Next.js routes use the Pages Router
This repository uses the Next.js **Pages Router** (`pages/`) exclusively. No `app/` directory may be introduced and no route may be authored under App-Router conventions without a governed project. API routes belong under `pages/api/**` (Next.js Lambda) or the standalone `api/` package (dormant ApiGatewayV2 Lambdas) — never both.

### Acceptance Checks
- `find . -type d -name "app" -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*" -not -path "*/.open-next/*"` returns no Next.js App-Router root (an `app/` directory containing `layout.tsx`/`page.tsx` is forbidden).
- `rg -n "from 'next/app'|export default function App" pages/_app.* ` confirms the Pages Router `_app` wrapper is still the global entry point.
- `pnpm typescript` passes.

---

## AX-REPO-SYNC-SECRET-CONTRACT: All GitHub-sync callers share one bearer-token contract
The HTTP contract for `pages/api/github/sync-events.ts` is `POST` with `Authorization: Bearer ${SYNC_SECRET}` and an optional `?fullRefresh=true` query parameter. Every caller of that endpoint — the EventBridge cron handler (`cron/github-sync.ts`), the local cron driver (`scripts/local-sync-cron.cjs`), and any future caller — MUST use the exact same secret, header shape, and method. Rotating or renaming the secret on one side without the other is a breaking change that MUST be done in a single coordinated task.

### Acceptance Checks
- `rg -n "Authorization.*Bearer.*SYNC_SECRET" cron/ scripts/ pages/api/github/` shows the bearer header in every caller and the matching check in the endpoint.
- `rg -n "SYNC_SECRET" stacks/site.ts stacks/cron.ts` shows the secret is linked to both the site Lambda (so the endpoint can validate it) and the cron Lambda (so the cron can send it).
- manual: rotating `SYNC_SECRET` in `.env.production` is followed by `pnpm deploy:prod` so both Lambdas pick up the new value before the next cron tick.

---

## AX-REPO-DEPLOY-ENV-VALIDATION: Required runtime env is enforced at deploy synth, not at request time
The deploy-time abort contract in `stacks/site.ts` (`createSite` throws on missing `NEXT_PUBLIC_WEB_URL`, `GITHUB_TOKEN`, `MONGODB_URI`, `MONGODB_USER`, `MONGODB_PASS`, `SST_STAGE`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SYNC_SECRET`) is the canonical guard. Any new env var required by the site Lambda at runtime MUST be added to this validation set; handlers MUST NOT paper over a missing required env var with a silent default at runtime.

### Acceptance Checks
- `rg -n "throw new Error" stacks/site.ts` shows the missing-env guard for each variable.
- `rg -n "process\\.env\\.(MONGODB_URI|GITHUB_TOKEN|NEXTAUTH_SECRET|GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|SYNC_SECRET)" pages/api/ lib/ cron/` shows consumers reading the env vars without inventing fallback defaults.
- manual: a deploy with one of the listed env vars unset fails at `sst deploy` synth time, not at first request.

---

## AX-REPO-DEPLOY-SINGLE-INGRESS: Production deploys go through `scripts/aws-deploy.sh`
Production deploys and removals MUST go through `pnpm deploy:prod` / `pnpm remove:prod`, which call `scripts/aws-deploy.sh`. That script is the only sanctioned wrapper around `senvn -f production npx sst {deploy,remove} --stage production` and the post-deploy `setupLogShipping.cjs` step. Direct invocation of `sst deploy` from a developer shell — bypassing `senvn` and the log-shipping step — is forbidden.

### Acceptance Checks
- `rg -n "deploy:prod|remove:prod" package.json` shows both recipes point at `scripts/aws-deploy.sh`.
- `rg -n "senvn -f production npx sst" scripts/aws-deploy.sh` shows the wrapped commands.
- `rg -n "sst deploy" .github/workflows/ scripts/ docs/` shows no direct unwrapped `sst deploy` invocation outside `aws-deploy.sh` (CI workflows that orchestrate the same sanctioned path are acceptable).
- manual: a developer runs `pnpm deploy:prod` and observes `setupLogShipping.cjs` executes after `sst deploy` completes.

---

## AX-REPO-DEV-PORT-5040: Local dev server runs on port 5040
The local Next.js dev server for this repo runs on port **5040**, not the Next.js default (3000). `pnpm dev` and `pnpm dev:nextjs` kill that port before starting. Tooling, Playwright base URLs, and operator docs that hard-code a dev port MUST use 5040.

### Acceptance Checks
- `rg -n "5040" package.json playwright.config.* e2e/ docs/ scripts/` shows 5040 as the dev port wherever a dev URL is referenced.
- `rg -n "kill-port" package.json` shows the port is freed before `next dev` starts.
- manual: `pnpm dev` boots and serves at `http://localhost:5040`.

---

## AX-REPO-SINGLE-TENANT: This repo has no per-user data partitioning
The product is a single-operator site. No MongoDB collection in this repo may be scoped to a per-end-user identity, and no flow may introduce multi-tenant data partitioning, without a governed project that explicitly redefines this invariant. `/hal` (NextAuth + Google OAuth) is the only authenticated surface and gates only a single admin identity.

### Acceptance Checks
- `rg -n "userId|tenantId|orgId" pages/api/ lib/ api/ cron/` shows no per-user/tenant scoping in Mongo queries.
- `rg -n "getServerSession|NextAuth" pages/ pages/api/` shows auth gating limited to `/hal` and `pages/api/hal/**`.
- manual: a new collection introduced without a tenant key passes review; one with a `userId` field is challenged.

---

## AX-REPO-CORRECTNESS-VIA-TYPESCRIPT-AND-PLAYWRIGHT: There is no unit-test harness; typecheck + e2e are the bar
The repo has no Jest/Vitest harness. Correctness is enforced by `pnpm typescript` (which runs both `tsc -p tsconfig.json` and `tsc -p scripts/tsconfig.json`) and by Playwright e2e (`pnpm test`, `pnpm test:smoke`, `pnpm test:mobile`, `pnpm test:visual`). Any task that introduces new business logic MUST be coverable by one of those two harnesses, or MUST add explicit `manual:` acceptance steps to its own task/axiom.

### Acceptance Checks
- `pnpm typescript` exits 0.
- `pnpm test:smoke` exits 0 against the dev server at port 5040.
- `rg -n '"jest"|"vitest"' package.json` returns no matches (no unit test runner has been introduced).

---

## AX-REPO-CENV-PUBLIC-NO-SECRETS: `s3://cenv-public` is treated as a public, externally-owned bucket
The `cenv-public` S3 bucket is owned outside this app and is publicly readable. The only sanctioned writers are `scripts/populate-github-activity.js` and `scripts/populate-github-activity-history.js`, both of which write the single key `brian-stoker-github-activity.json`. No other code path in this repo may write to `cenv-public`, and the existing writers MUST NOT add secrets, PII, or non-public data to the payload.

### Acceptance Checks
- `rg -n "cenv-public" --type ts --type js --type sh` shows only the two `populate-github-activity*` scripts as writers.
- `rg -n "S3_KEY\\s*=\\s*'brian-stoker-github-activity.json'" scripts/` matches both files (and only those files).
- manual: an HTTP `GET https://cenv-public.s3.amazonaws.com/brian-stoker-github-activity.json` returns only `{ data, lastUpdated }` with no embedded secrets.

---

## AX-REPO-GITHUB-FEED-FROM-MONGO: The GitHub activity feed is served from MongoDB, never from GitHub in the request path
The `/work` activity feed and its two feed read APIs (`pages/api/github/events.ts`, `pages/api/github/filters.ts`) MUST serve GitHub events exclusively from MongoDB via the `getDatabase()` singleton; `api.github.com` is contacted only by the sync path (`lib/github-sync.ts`, driven by the hourly cron `cron/github-sync.ts` or the secret-gated `pages/api/github/sync-events.ts` trigger). The on-demand PR/commit *detail* endpoints (`pages/api/github/pull-request*.ts`, `pages/api/github/commit-files.ts`) are the only sanctioned request-path callers of GitHub and MUST stay off the feed/page-render path, so a `/work` render never depends on GitHub's rate limit or uptime.

### Acceptance Checks
- `grep -RIlF "api.github.com" pages/api/github/events.ts pages/api/github/filters.ts` returns no matches (use `-F`: a regex dot otherwise false-matches the `/api/github/com…` path string that appears in comments).
- `rg -n "getDatabase" pages/api/github/events.ts pages/api/github/filters.ts` shows both feed handlers read through the Mongo singleton.
- manual: `pages/work.tsx` and the events feed render purely from the `github_events`/`sync_metadata` collections; only `pull-request*.ts` and `commit-files.ts` fetch `api.github.com` live, and only on explicit detail expansion.

---

## AX-REPO-CLOUDFRONT-APIGW-RECONVERGENCE: Every production deploy repoints CloudFront onto API Gateway
Because Lambda Function URLs return 403 in AWS account `167217327520`, every production deploy MUST run `scripts/update-cloudfront-origins.cjs` after `sst deploy` to repoint CloudFront distribution `E1JN9JWBQ37JT2` (the `default` and `imageOptimizer` origins) off the broken Function URLs and onto the API Gateway HTTP APIs that proxy the OpenNext Lambdas. These origin overrides and HTTP APIs are NOT in SST state, so they MUST be reapplied on every deploy; skipping or reordering this step returns 403 site-wide for every view.

### Acceptance Checks
- `rg -n "update-cloudfront-origins.cjs" scripts/aws-deploy.sh` shows the reconvergence runs as step (b), after `senvn -f production npx sst deploy`.
- `rg -n "E1JN9JWBQ37JT2" scripts/update-cloudfront-origins.cjs` shows the pinned distribution id, and `rg -n "default:|imageOptimizer:" scripts/update-cloudfront-origins.cjs` shows the two managed origins.
- manual: after `pnpm deploy:prod`, `https://brian.stokd.cloud` returns 200 (not 403) once the `/*` invalidation propagates.

---

## AX-REPO-MONGO-DB-NAME-OVERRIDE: The live database name stays `brianstoker-{stage}` via MONGODB_NAME
The effective MongoDB database name MUST remain `brianstoker-production` (prod) / `brianstoker-local` (dev), preserved across the `brian.stokd.cloud` migration by injecting the `MONGODB_NAME` env override in `stacks/site.ts` and `stacks/cron.ts`. The live connection singletons (`lib/mongodb.ts`, `pages/api/lib/mongodb.ts`) MUST read `process.env.MONGODB_NAME` first and only fall back to the `brianstoker-*` default; the domain-derived name produced by `stacks/domains.ts` (`brian-stokd-*`) MUST NOT silently become the live DB name. (The dormant `api/lib/mongodb.ts` selects its DB at the call site and is out of the live path.)

### Acceptance Checks
- `rg -n "MONGODB_NAME" lib/mongodb.ts pages/api/lib/mongodb.ts stacks/site.ts stacks/cron.ts` shows the override is read in the live singletons and injected by both stacks.
- `rg -n "brianstoker-production|brianstoker-local" lib/mongodb.ts pages/api/lib/mongodb.ts` shows the `brianstoker-*` fallback defaults (never `brian-stokd-*`).
- manual: in production `MONGODB_NAME=brianstoker-production` is set so the `stacks/domains.ts` domain-derived `brian-stokd-production` name is never the live DB.

---

<!--
stokd-axiom-candidate (RESOLVED 2026-06-09)
note: The `scripts/.axioms.md` AX-MOD-SCRIPTS-008 / AWS-profile reconciliation candidate ("reconcile to a single profile name and promote the global axiom") is now satisfied: AX-REPO-AWS-PROFILE-DISCIPLINE above was corrected from `stoked` to `stokd-cloud` (account 167217327520) in this refresh. Kept as a marker so future refreshes do not re-flag it.
-->

<!--
stokd-axiom-candidate
suggested_targets: .stokd/meta/SC_AXIOMS.md
confidence: medium
note: The `api/.axioms.md` AX-MOD-API-002 origin-allowlist invariant initially looked repo-wide, but `rg -n "ROOT_DOMAIN" pages/api/` shows the Next.js Pages-Router API routes do NOT enforce an origin allowlist against `ROOT_DOMAIN` today. Promote only after either (a) the dormant `api/` package is re-enabled AND a corresponding check is added uniformly to `pages/api/**`, or (b) a deliberate task lands repo-wide origin enforcement. Until then this stays a module-scoped axiom.
-->

<!--
stokd-axiom-candidate
suggested_targets: .stokd/meta/SC_AXIOMS.md
confidence: low
note: The `scripts/.axioms.md` `fix-next-lambda.cjs` candidate (locking the standalone build dirs list and the "patch each server entry exactly once" invariant) is currently not wired into the default build flow. Promote only after a task re-enables it in `package.json` so there is an executable check to anchor the acceptance criteria.
-->
