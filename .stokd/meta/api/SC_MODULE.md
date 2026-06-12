<!-- stokd-meta-version: 0.4.0 -->
# SC_MODULE — api

Module classification for the standalone Lambda-handler package at `api/`.
Generated: 2026-05-26 · Last refreshed: 2026-06-09 (timed refresh)

---

## Module Identity

- **Module name:** `api`
- **Package name:** `@brian-stoker/api` (`api/package.json:2`)
- **Package location:** `api/` (workspace package, not the Next.js `pages/api/` route directory)
- **Runtime:** AWS Lambda (Node), invoked through `sst.aws.ApiGatewayV2`
- **Language:** TypeScript

> Naming caveat: this module shares its name with `pages/api/` (the Next.js Pages Router API surface). They are **different code**. `pages/api/**` runs inside the OpenNext Lambda for the Next.js site (`stacks/site.ts`) and is documented under the brianstoker-com Next.js application surface; the `api/` package documented here exists to host standalone Lambda handlers wired through `stacks/api.ts`.

---

## Responsibility

The `api/` package is the **dedicated Lambda handler package** for non-Next.js HTTP entry points: email subscription / verification, transactional SES delivery, and SNS-based SMS dispatch. It exists so that low-frequency, single-purpose endpoints can be deployed as plain Lambda functions on a shared `ApiGatewayV2`, independent of the OpenNext Lambda that backs the Next.js site.

Currently the handlers are **dormant**: `stacks/api.ts` constructs the API Gateway resource (`stacks/api.ts:26-50`) but the per-route `sst.aws.Function` declarations and `api.route(...)` bindings are commented out (`stacks/api.ts:52-101`). The package compiles and is published with the SST app, but no route currently invokes its exports in production. Notably, the footer's `EmailSubscribe` form (`src/components/footer/EmailSubscribe.tsx:35`) already POSTs to `https://api.${window.location.host}/subscribe` using `mode: 'no-cors'`, so it resolves optimistically (always shows the "sent" success state) even while the route is dormant — no error surfaces to the user.

Design intent (from the surviving code):
- Keep stateful, side-effecting Lambdas (SES sends, SNS publishes, Mongo writes) outside the Next.js render path.
- Share a single Mongo client across the package via `api/lib/mongodb.ts` (one connection per cold start) using `sst.Resource.MONGODB_URI`.
- Front origin/payload validation in each handler so it can stand alone behind API Gateway without a Next.js middleware layer.

---

## Public Interfaces / Entry Points

| Export | File | Trigger (when wired) | Purpose |
|--------|------|----------------------|---------|
| `subscribe(event)` | `api/subscribe.ts:50` | `POST /subscribe` (API Gateway v2 HTTP) | Insert/refresh a `subscribers` Mongo doc, send SES verification email |
| `verify(event)` | `api/subscribe.ts:141` | `GET /verify?token&email` | Validate token, mark subscriber verified, 301-redirect to `/subscription?code=*` |
| `handler(event)` | `api/sms.ts:5` | `POST /sms` | Validate E.164 phone, publish SNS SMS |
| `dbClient` (default export) | `api/lib/mongodb.ts:20` | imported by every handler | Singleton `MongoClient` connected via `Resource.MONGODB_URI` |

All handlers return `APIGatewayProxyResult` (or a plain `{statusCode, headers?, body}` equivalent for `sms.handler`). They do not throw; failures are converted to JSON error envelopes (or, for `verify`, to a `301` redirect carrying an error `code=`) with appropriate HTTP statuses.

Validated guard set:
- `ROOT_DOMAIN` env present (otherwise `400` for `subscribe`/`sms`; `verify` skips this check and instead emits redirects whose `Location` would be malformed if `ROOT_DOMAIN` were absent).
- `event.headers.origin` (with `https://` stripped) must be contained in `ROOT_DOMAIN` (otherwise `403`) — enforced by `subscribe` and `sms.handler`. `verify` does **not** perform the origin check (it is a redirect-on-GET link target).
- `DB_NAME` present — required by `subscribe` (`400`) and `verify` (`301` with `code=402`).
- **Method gating is NOT uniform:** only `subscribe` rejects non-`POST` with `405` (`api/subscribe.ts:72`, via `event.requestContext.http.method`). `verify` and `sms.handler` do not gate the HTTP method themselves and rely on the API Gateway route definition (`GET /verify`, `POST /sms`) to constrain it.
- `subscribe` additionally requires a non-empty `email` in the JSON body (`400`); `sms.handler` requires both `phoneNumber` and `message`, with `phoneNumber` matching E.164 `/^\+\d{11,15}$/` (`400`).

---

## Products

- **SC_PRODUCT_BRIANSTOKER_COM.md** — this is the only product. The `api/` package is one of two listed constituent packages for that product (the other being `scripts`). When the subscribe/verify/sms routes are re-enabled they will back the newsletter and notification surfaces of brianstoker.com. The product doc's "Dormant Lambda surfaces" section (`SC_PRODUCT_BRIANSTOKER_COM.md`) cross-references these same three entry points.

---

## Views

The `api/` package renders no UI directly. The views it shapes (per `SC_VIEWS.md`):

- **AppFooter → `EmailSubscribe`** (`src/components/footer/EmailSubscribe.tsx`; `SC_VIEWS.md:33`) — newsletter signup form on every page. POSTs `{ email }` to `https://api.<host>/subscribe` (`mode: 'no-cors'`). It is the producer side of the `subscribe` handler's `subscribers` write.
- **`/subscription` view** (`pages/subscription.tsx`; **SC_VIEWS.md §12**) — **now live** (it did not exist at first generation). It consumes the `301`-redirect contract from `verify`: it reads the `?code=` query param and renders an `Alert`. Mapping in `pages/subscription.tsx:75-109`: `200`→success "Email verified", `201`→success "Email already verified", `401`→error "Invalid token or Email", `404`→error "Email not found", `402` and `500` (default)→error "System error occurred staff has been notified." No `code` ⇒ redirect to `/404`. This page is the binding consumer referenced by **AX-MOD-API-004** — the redirect code set in `api/subscribe.ts` and the switch in `pages/subscription.tsx` must move together.

No view depends on a *live* route from this package today, because the gateway bindings in `stacks/api.ts` are commented out; the `EmailSubscribe` POST and `verify` redirect are wired but currently dormant end-to-end.

---

## Integration Points

### Upstream (callers)
- **API Gateway v2** (`stacks/api.ts:26-50`) — would route HTTP requests to the handlers when the function/route block is uncommented. CORS is `["*"]` under `$dev`; in production it is locked to `NEXTAUTH_URL`, `NEXT_PUBLIC_ISSUER`, `NEXT_PUBLIC_CHAT_API` (`stacks/api.ts:40-44`). `createApi()` throws at synth if any of `GITHUB_TOKEN`, `GITHUB_USERNAME`, `SYNC_SECRET`, `MONGODB_QUERY_PARAMS`, `NEXT_PUBLIC_NEXT_API`, `NEXT_PUBLIC_WEB_URL`, `COINBASE_COMMERCE_API_KEY`, `MONGODB_URI` is unset (`stacks/api.ts:5-24`).
- **Browser form `EmailSubscribe`** (footer) — active caller of `subscribe` via the `api.` subdomain.

### Downstream
- **MongoDB Atlas** — `subscribers` collection inside the per-stage database named by `DB_NAME`. `ensureDatabaseAndCollectionExists()` (`api/subscribe.ts:14`) lazily creates the collection on first call. Connection is the shared singleton from `api/lib/mongodb.ts`, tagged `appName: "brianstoker-api"` for Atlas attribution.
- **AWS SES (`us-east-1`)** — `sendVerificationEmail()` (`api/subscribe.ts:126`) sends from `no-reply@${ROOT_DOMAIN}` with a hardcoded subject `"Subscribed to brian.stokd.cloud"` (`api/subscribe.ts:132`). Requires the SES domain identity for `ROOT_DOMAIN` to be verified. The (commented-out) IAM grant is `ses:SendEmail` on `arn:aws:ses:us-east-1:167217327520:identity/*` — account **167217327520** (the `stokd-cloud` account post-migration; the earlier `883859713095` account no longer applies).
- **AWS SNS (`us-east-1`)** — `sms.handler` publishes to a phone number via `PublishCommand` (`api/sms.ts:41-47`); requires `sns:Publish` IAM (granted in the commented-out `SendSms` function definition, `stacks/api.ts:85-97`).
- **SST `Resource.MONGODB_URI`** — `api/lib/mongodb.ts:4` reads the connection string at module load. The SST link binding (`link: [mongoDbUri]` in the commented function defs) must be present for the handler to boot.

### Environment contract
| Env var | Required by | Failure mode |
|---------|-------------|--------------|
| `MONGODB_URI` (via `Resource.MONGODB_URI.value`) | all handlers (loaded by `api/lib/mongodb.ts`) | Throws `MONGODB_URI is not defined` at cold start |
| `ROOT_DOMAIN` | `subscribe`, `sms.handler` (guard); `verify` (redirect target) | `400` JSON error (`subscribe`/`sms`) or malformed redirect `Location` (`verify`) |
| `DB_NAME` | `subscribe`, `verify` | `400` JSON (`subscribe`) / `301 code=402` (`verify`) |

---

## Key Source Files

| File | Why it matters |
|------|----------------|
| `api/subscribe.ts` | Implements `subscribe` and `verify`; encodes the verification-link contract (`/verify?token=<uuid>&email=<email>`) and the post-verify redirect codes (`/subscription?code=200\|201\|401\|402\|404\|500`, with `&token=` forwarded on `200`/`201`). Also owns `ensureDatabaseAndCollectionExists` and `sendVerificationEmail`. |
| `api/sms.ts` | Sole SMS entry point; defines the E.164 input contract (`/^\+\d{11,15}$/`) and bridges to `@aws-sdk/client-sns` (`SNSClient`, region `us-east-1`). |
| `api/lib/mongodb.ts` | Single source for the Mongo client used by every handler. Uses `global._mongoClientPromise` to survive Lambda warm-invoke reuse; tags the connection with `appName: "brianstoker-api"` for Atlas attribution; throws `MONGODB_URI is not defined` if the linked resource is empty. |
| `api/package.json` | Declares the isolated dependency set (`aws-lambda`, `mongodb`, `uuid`; `@types/aws-lambda` dev) separate from the Next.js app's `node_modules`. Its `test` script is a placeholder (`exit 1`) — there is no unit harness for this package. |
| `api/.eslintrc.js` | Local lint overrides (notably `import/no-cycle: error` and `import/order: error`) — keep these passing when modifying handlers. |
| `api/sst-env.d.ts` | Auto-generated SST type augmentation (`/* Do not edit */`); regenerated by SST, never hand-edited. |
| `stacks/api.ts` | The (mostly-commented) wiring that turns these handlers into deployed routes, plus the synth-time env-var guard. Editing the handlers without re-enabling the corresponding `sst.aws.Function` + `api.route(...)` here will not change runtime behavior. |

---

## Change Impact

When you change code in `api/`, validate the following:

1. **SST build** — `pnpx @opennextjs/aws@latest build` and `npx sst deploy` must still synthesize. A typo in a handler signature surfaces only when SST tries to bundle the Lambda.
2. **Type compile** — `pnpm typescript` covers both the app and the scripts tsconfigs; `api/` shares dependencies with the root project, so unmet types here will fail the root `tsc` pass.
3. **Cold-start safety** — anything imported at module top-level runs on every Lambda cold start. `api/lib/mongodb.ts` reads `Resource.MONGODB_URI.value` and throws on boot if unset; new top-level side effects (network, `Resource.*` lookups) can break boot if env wiring lags.
4. **Mongo collection contract** — `subscribers` documents have shape `{ email, subscribedAt, verificationToken, verified? }`. Adding/renaming fields requires a coordinated update to the consumers (today: only `subscribe`/`verify` themselves).
5. **Redirect-code ↔ view contract** — `verify`'s `code=200|201|401|402|404|500` set is consumed by the now-live `pages/subscription.tsx` switch. Changing the set without updating that switch (and `SC_VIEWS.md §12`) silently breaks the user-facing message. This is **AX-MOD-API-004**.
6. **Origin allowlist** — `subscribe`/`sms.handler` compare `event.headers.origin` against `ROOT_DOMAIN`. Adding a new permitted origin means updating both the handler check **and** the API Gateway CORS list in `stacks/api.ts:40-44`.
7. **Re-enabling routes** — uncommenting the function/route block in `stacks/api.ts` makes these handlers publicly reachable. Before deploying, confirm SES domain verification for `ROOT_DOMAIN` in account `167217327520`, SNS SMS spend caps, and Mongo connectivity from the Lambda.
8. **Dormant code drift** — no automated test or production traffic exercises these handlers today (the package `test` script is a placeholder and there is no Playwright coverage of these routes). Refactors here are not validated by CI; `sst dev` invocation or a deliberate sandbox deploy is the only behavioral verification.
