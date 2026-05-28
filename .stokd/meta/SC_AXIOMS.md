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

## AX-REPO-AWS-PROFILE-DISCIPLINE: AWS access goes through the `stoked` profile or `senvn`
Any code path or operator command that touches AWS APIs in this repo MUST acquire credentials through `AWS_PROFILE=stoked` (explicitly exported) or through `senvn -f <stage>` loading `.deploy.json`; ambient default-profile credentials MUST NOT be used because they may resolve to an unrelated customer account.

### Acceptance Checks
- `rg -n "AWS_PROFILE" scripts/ stacks/ .github/workflows/` shows every direct AWS invocation either sets `AWS_PROFILE=stoked` or is wrapped by `senvn -f production` / `senvn -f <stage>`.
- `rg -n "senvn -f " scripts/aws-deploy.sh package.json` shows production SST commands are gated by `senvn`.
- manual: a deploy attempted without `AWS_PROFILE=stoked` (and without `senvn`) is stopped before it reaches `sst deploy`.

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
