<!-- stokd-meta-version: 0.4.0 -->
# SC_MODULE — api

Module classification for the standalone Lambda-handler package at `api/`.
Generated: 2026-05-26

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

Currently the handlers are **dormant**: `stacks/api.ts` constructs the API Gateway resource but the per-route `sst.aws.Function` declarations and `api.route(...)` bindings are commented out (`stacks/api.ts:52-101`). The package compiles and is published with the SST app, but no route currently invokes its exports in production.

Design intent (from the surviving code):
- Keep stateful, side-effecting Lambdas (SES sends, SNS publishes, Mongo writes) outside the Next.js render path.
- Share a single Mongo client across the package via `api/lib/mongodb.ts` (one connection per cold start) using `sst.Resource.MONGODB_URI`.
- Front origin/method/payload validation in each handler so it can stand alone behind API Gateway without a Next.js middleware layer.

---

## Public Interfaces / Entry Points

| Export | File | Trigger (when wired) | Purpose |
|--------|------|----------------------|---------|
| `subscribe(event)` | `api/subscribe.ts:50` | `POST /subscribe` (API Gateway v2 HTTP) | Insert/refresh a `subscribers` Mongo doc, send SES verification email |
| `verify(event)` | `api/subscribe.ts:141` | `GET /verify?token&email` | Validate token, mark subscriber verified, 301-redirect to a `/subscription?code=*` page |
| `handler(event)` | `api/sms.ts:5` | `POST /sms` | Validate E.164 phone, publish SNS SMS |
| `dbClient` (default export) | `api/lib/mongodb.ts:20` | imported by every handler | Singleton `MongoClient` connected via `Resource.MONGODB_URI` |

All handlers return `APIGatewayProxyResult` (or a plain `{statusCode, headers, body}` equivalent for `sms.handler`). They do not throw; failures are converted to JSON error envelopes with appropriate HTTP statuses.

Validated guard set (consistent across handlers):
- `ROOT_DOMAIN` env present (otherwise `400`).
- `event.headers.origin` must be contained in `ROOT_DOMAIN` (otherwise `403`).
- HTTP method gating (`POST` for `subscribe`/`sms`, `GET` for `verify`).
- `subscribe` additionally requires `DB_NAME`; `sms.handler` requires E.164 phone format.

---

## Products

- **SC_PRODUCT_BRIANSTOKER_COM.md** — this is the only product. The `api/` package is one of two listed packages for that product (the other being `scripts`). When the subscribe/verify/sms routes are re-enabled they will back the newsletter and notification surfaces of brianstoker.com.

---

## Views

The `api/` package does not render any UI directly. The views it would feed once the routes are re-enabled (per `SC_VIEWS.md`):

- **AppFooter → `EmailSubscribe`** (`src/components/footer/EmailSubscribe.tsx`) — newsletter signup form on every page; would POST to `subscribe`.
- **`/subscription` page** (linked from the 301 redirects in `api/subscribe.ts:141-223`) — receives `code=200|201|401|402|404|500` query params from `verify` and renders the corresponding status message.

No view in the current `SC_VIEWS.md` depends on a live route from this package today, because the gateway bindings are commented out.

---

## Integration Points

### Upstream (callers)
- API Gateway v2 (`stacks/api.ts:26-50`) — would route HTTP requests to the handlers when uncommented. CORS is locked to `NEXTAUTH_URL`, `NEXT_PUBLIC_ISSUER`, `NEXT_PUBLIC_CHAT_API` outside `$dev`.
- Browser form in `EmailSubscribe` (footer) — historical caller of `subscribe`.

### Downstream
- **MongoDB Atlas** — `subscribers` collection inside the per-stage database named by `DB_NAME` env var. `ensureDatabaseAndCollectionExists()` (`api/subscribe.ts:14`) creates the collection on first call.
- **AWS SES (`us-east-1`)** — `sendVerificationEmail()` (`api/subscribe.ts:126`) sends from `no-reply@${ROOT_DOMAIN}`; requires SES domain identity for `ROOT_DOMAIN` to be verified. The (commented-out) IAM grant is `ses:SendEmail` on `arn:aws:ses:us-east-1:883859713095:identity/*`.
- **AWS SNS (`us-east-1`)** — `sms.handler` publishes to a phone number via `PublishCommand`; requires `sns:Publish` IAM (granted in the commented-out `SendSms` function definition).
- **SST `Resource.MONGODB_URI`** — `api/lib/mongodb.ts:4` reads the connection string at module load. SST link binding must include `mongoDbUri` for the handler to start.

### Environment contract
| Env var | Required by | Failure mode |
|---------|-------------|--------------|
| `MONGODB_URI` (via `Resource.MONGODB_URI.value`) | all handlers (loaded by `api/lib/mongodb.ts`) | Throws `MONGODB_URI is not defined` at cold start |
| `ROOT_DOMAIN` | `subscribe`, `verify`, `sms.handler` | `400` JSON error or unsafe redirect target |
| `DB_NAME` | `subscribe`, `verify` | `400` JSON error |

---

## Key Source Files

| File | Why it matters |
|------|----------------|
| `api/subscribe.ts` | Implements `subscribe` and `verify`; encodes the verification-link contract (`/verify?token=<uuid>&email=<email>`) and the post-verify redirect codes (`/subscription?code=200\|201\|401\|402\|404\|500`). Also owns `ensureDatabaseAndCollectionExists` and `sendVerificationEmail`. |
| `api/sms.ts` | Sole SMS entry point; defines the E.164 input contract (`/^\+\d{11,15}$/`) and bridges to `@aws-sdk/client-sns`. |
| `api/lib/mongodb.ts` | Single source for the Mongo client used by every handler. Uses `global._mongoClientPromise` to survive Lambda warm-invoke reuse; tags the connection with `appName: "brianstoker-api"` for Atlas attribution. |
| `api/package.json` | Declares dependencies (`aws-lambda`, `mongodb`, `uuid`) and isolates them from the Next.js app's `node_modules`. |
| `api/.eslintrc.js` | Local lint overrides (notably `import/no-cycle: error` and `import/order: error`) — keep these passing when modifying handlers. |
| `api/sst-env.d.ts` | Auto-generated SST type augmentation; do not edit by hand. |
| `stacks/api.ts` | The (mostly-commented) wiring that turns these handlers into deployed routes. Editing the handlers without re-enabling the corresponding `sst.aws.Function` + `api.route(...)` here will not change runtime behavior. |

---

## Change Impact

When you change code in `api/`, validate the following:

1. **SST build** — `pnpx @opennextjs/aws@latest build` and `npx sst deploy` must still synthesize. A typo in a handler signature surfaces only when SST tries to bundle the Lambda.
2. **Type compile** — `pnpm typescript` covers both the app and the scripts tsconfigs; `api/` shares dependencies with the root project, so unmet types here will fail the root `tsc` pass.
3. **Cold-start safety** — anything imported at module top-level runs on every Lambda cold start. New top-level side effects (especially network or `Resource.*` lookups) can break boot if env wiring lags.
4. **Mongo collection contract** — `subscribers` documents have shape `{ email, subscribedAt, verificationToken, verified? }`. Adding/renaming fields requires a coordinated update to whatever consumer reads them (today: only `subscribe`/`verify` themselves).
5. **Origin allowlist** — handlers compare `event.headers.origin` against `ROOT_DOMAIN`. If you add a new permitted origin you must update both the handler check and the API Gateway CORS list in `stacks/api.ts:38-49`.
6. **Re-enabling routes** — uncommenting the function/route block in `stacks/api.ts` makes these handlers publicly reachable. Confirm SES domain verification, SNS spend caps, and Mongo connectivity from the Lambda VPC/security-group before deploying.
7. **Dormant code drift** — because no automated test or production traffic exercises these handlers today, refactors here are not validated by CI. Manual `sst dev` invocation or a deliberate sandbox deploy is the only way to verify behavior.
