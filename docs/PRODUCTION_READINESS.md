# JoFogo — Production Readiness

> **Branch:** `feature/fase6a-production-readiness-draft`
> **Date:** 2026-07-03
> **Phase:** 6A — Production readiness preparation
> **Status:** draft — for review before merge into `main`
> **Tag reference:** `v0.1.0-mvp`

---

## Purpose

This document prepares the JoFogo MVP for a **future** production deployment.
It defines what must be checked, configured, and verified **before** any real
deployment takes place. It does **not** deploy anything, does not configure
real providers, and does not change any runtime application behavior.

> **Separation principle:** this document covers *preparation*, not *execution*.
> Actual deployment steps are listed in the [Deployment Runbook](#12-deployment-runbook) section and
> must only be executed after every checklist item in this document is satisfied.

---

## Out of Scope for V1

The following features are **explicitly absent** from the MVP and must **not** be
added before the first production deployment:

| Feature | Status |
|---|---|
| WhatsApp integration / messaging | Out of V1 scope |
| Checkout online | Out of V1 scope |
| Shopping cart (persistent) | Out of V1 scope |
| Payment processing | Out of V1 scope |
| Shipping calculation | Out of V1 scope |
| Customer login / registration | Out of V1 scope |
| AI / algorithmic recommendations | Out of V1 scope |
| Personal data collection from customers | Out of V1 scope |

---

## 1. Deployment Assumptions

These assumptions must hold before deployment proceeds. Verify each one.

- [ ] The deployment target is a Node.js-compatible hosting platform
      (e.g., Vercel, Railway, Fly.io, or a VPS running Node.js >= 18).
- [ ] A managed PostgreSQL database instance is provisioned separately from
      the application runtime.
- [ ] The application is served exclusively over HTTPS. HTTP must redirect to
      HTTPS at the infrastructure level.
- [ ] The hosting environment supports environment variables set outside of
      source control (not in `.env` files committed to git).
- [ ] Only the `main` branch (tagged `v0.1.0-mvp` or later) is deployed to
      production. Feature branches are never deployed to production directly.
- [ ] A staging environment exists and has been fully validated before the
      production deployment begins.
- [ ] The team has write access to DNS records for the production domain.
- [ ] A TLS certificate is provisioned for the production domain (managed
      by the hosting provider or a dedicated certificate service).

---

## 2. Environment Variables Checklist

The following variables must be set in the production environment **before** the
first deploy. None of these values should appear in source control.

Reference file: `.env.example`

### 2.1 Required — Application will not start without these

| Variable | Description | Action required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string for the production database. | Set to the real production database URL. Use a dedicated application user with least-privilege access (no superuser). |
| `ADMIN_AUTH_SECRET` | Secret used to sign and verify the `admin_session` HMAC-SHA256 cookie. | Generate a cryptographically random string of at least 64 characters. Never reuse the development or seed value. |

### 2.2 Required — Product presentation

| Variable | Description | Action required |
|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | Display name shown in the UI. | Set to the real store name (e.g., `JoFogo`). |

### 2.3 Present in `.env.example` but intentionally deferred

| Variable | Description | Decision |
|---|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp contact number. | **Do not configure for V1.** WhatsApp integration is out of V1 scope. Leave unset or set to an empty string. Setting a real value here will have no visible effect in V1 because no WhatsApp UI exists, but it will be visible in the public client bundle. |

### 2.4 Generation guidance for `ADMIN_AUTH_SECRET`

Generate a strong secret using one of the following methods (do not use
the example value from `.env.example` or the seed):

```bash
# Option A — openssl (Linux/macOS/WSL)
openssl rand -hex 64

# Option B — Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Store the generated value in the hosting provider's secret/environment
variable manager, not in any file committed to git.

---

## 3. Production Database Checklist

- [ ] A dedicated PostgreSQL instance is provisioned (version >= 14 recommended).
- [ ] A dedicated application database user exists with only the permissions
      required by Prisma (`SELECT`, `INSERT`, `UPDATE`, `DELETE` on application
      tables; no `DROP`, `CREATE`, or superuser rights).
- [ ] `DATABASE_URL` uses SSL (`?sslmode=require` or equivalent) for the
      production connection.
- [ ] Database backups are configured with at least daily frequency and
      tested restore procedure.
- [ ] The database is not publicly accessible; it accepts connections only from
      the application runtime's IP range or VPC.
- [ ] Prisma migrations (`prisma migrate deploy`) have been applied to the
      production database in a dry-run-first approach before going live.
      **Do not run `prisma migrate dev` in production.**
- [ ] The seed script (`prisma/seed.ts`) has **not** been run in production.
      The production database must be populated manually or through a separate
      admin-only import process. The seed creates development-only credentials
      (`admin@jofogo.dev` / `Dev@2026!`) that must never exist in production.
- [ ] Connection pool limits are understood and configured to match the
      hosting platform's concurrency model (serverless functions vs.
      long-running server).

---

## 4. Admin Credentials / Secrets Checklist

- [ ] **Production admin password is unique and strong.** The seed password
      `Dev@2026!` (used only in development) must not exist in the production
      database. Create a new admin user directly via a secure, one-time script
      or migration run in a controlled environment.
- [ ] `ADMIN_AUTH_SECRET` is generated uniquely for production (see Section 2.4).
      It has never appeared in source control, logs, or any shared document.
- [ ] The production admin email address is known only to authorized personnel.
- [ ] `ADMIN_AUTH_SECRET` rotation procedure is documented: updating the secret
      invalidates all active `admin_session` cookies (sessions expire or require
      re-login). The team is aware of this side effect.
- [ ] Admin login page (`/admin/signin`) is functional and tested in staging with
      the real production `ADMIN_AUTH_SECRET` before production deployment.
- [ ] No admin credentials are hard-coded anywhere in the application source code.

---

## 5. Age Gate Validation Checklist

- [ ] Age gate modal appears on `GET /` for visitors without the `age_confirmed`
      cookie.
- [ ] Accepting the gate sets the `age_confirmed=1` cookie (30-day expiry) and
      `localStorage` entry; catalog is rendered immediately after acceptance.
- [ ] Rejecting the gate displays the blocking message; no products are rendered
      or fetched.
- [ ] Direct access to `/products/[slug]` without `age_confirmed` triggers the
      age gate before any product content is displayed.
- [ ] Clearing cookies and `localStorage` resets the gate correctly.
- [ ] The age gate copy does not use prohibited terms (`comprar`, `carrinho`,
      `checkout`, `pagamento`, `frete`, `whatsapp`, `finalizar pedido`,
      `pedido final`).
- [ ] Acknowledged limitation: the `age_confirmed` cookie is **not** cryptographically
      signed and can be forged client-side. This is acceptable for V1 (it is a
      preference gate, not a security-critical control). This must be disclosed
      to legal/compliance stakeholders before public launch.

---

## 6. Privacy / LGPD Checklist

> **LGPD** (Lei Geral de Protecao de Dados — Brazilian data protection law)
> applies to any processing of personal data of Brazilian residents.

- [ ] **Privacy policy page exists and is reachable.** A `/privacidade` (or
      equivalent) page must be created and linked from the footer before
      public launch. This is a **blocker** for public launch (carried from
      pre-release audit item B2).
- [ ] **Cookie notice is displayed** to first-time visitors, describing the
      `age_confirmed` and `admin_session` cookies. No consent management
      platform (CMP) is required for V1 given the minimal cookie usage, but a
      visible notice is required.
- [ ] `OrderDraft` records contain **no PII**: no customer name, email, phone,
      or CPF. Verify that the admin interests page does not display any such data.
- [ ] Analytics events (`POST /api/analytics/events`) reject metadata keys
      `email`, `phone`, `whatsapp`, `cpf`, `document`, `password`, `address`
      at the API level. Verify this rejection remains in production.
- [ ] `robots.txt` (or `app/robots.ts`) is configured to `Disallow: /admin`
      and `Disallow: /api/`. This is a **blocker** (pre-release audit item B1).
- [ ] Products with `noindex: true` generate `<meta name="robots" content="noindex">`
      on their PDP. Verify this metadata in the production build.
- [ ] No third-party tracking scripts (Google Analytics, Meta Pixel, etc.) are
      added to V1 without a corresponding cookie notice and LGPD consent flow.
- [ ] A data retention policy for `OrderDraft` records is defined (even if
      manual deletion). Records grow indefinitely without a TTL or cleanup job.
      This is a known V1 limitation to be addressed post-launch.

---

## 7. Security Checklist

- [ ] **HTTPS is enforced.** The `admin_session` cookie must be served only
      over HTTPS to ensure its `HttpOnly` flag is effective. Verify that the
      hosting platform redirects all HTTP traffic to HTTPS. (Pre-release audit
      item B7.)
- [ ] **HTTP security headers are configured** in `next.config.mjs` or at the
      reverse proxy / CDN level before production deployment. Required headers
      (pre-release audit item B3):
      - `X-Frame-Options: DENY`
      - `X-Content-Type-Options: nosniff`
      - `Referrer-Policy: strict-origin-when-cross-origin`
      - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
      - `Content-Security-Policy` (define a restrictive policy appropriate for
        the Next.js app; start with `default-src 'self'` and expand as needed).
- [ ] `ADMIN_AUTH_SECRET` does not appear in:
      - Application logs
      - Error tracking tools (Sentry, etc.)
      - The client-side JavaScript bundle (`NEXT_PUBLIC_` prefix must not be used)
      - Any git commit or pull request
- [ ] Admin routes (`/admin`, `/api/admin/*`) return 401 or redirect to
      `/admin/signin` for unauthenticated requests. Verify in the production build.
- [ ] Public catalog APIs (`/api/products`, `/api/categories`) do not expose
      products with `internal: true` or `status: INACTIVE`.
- [ ] **No rate limiting** on `POST /api/order-drafts` and
      `POST /api/analytics/events` is a known V1 limitation (pre-release audit
      item B4). Document this risk and have a mitigation plan (e.g., platform-level
      WAF rules) if abuse is expected at launch.
- [ ] Dependency audit: run `npm audit` before production build. Address any
      `high` or `critical` vulnerabilities.
- [ ] The production build (`npm run build`) completes without TypeScript errors
      or ESLint errors.

---

## 8. Domain / DNS Checklist

- [ ] Production domain is registered and DNS is managed by an authorized team
      member.
- [ ] DNS A or CNAME record points to the production hosting provider.
- [ ] TLS certificate is provisioned and auto-renews (Let's Encrypt or
      provider-managed).
- [ ] `www` and apex domain both resolve correctly and redirect to the canonical
      domain.
- [ ] SPF, DKIM, and DMARC records are configured if any transactional email is
      sent from the domain (not applicable for V1 but should be done before the
      domain is used for email).
- [ ] No admin or API subdomain is publicly exposed without authentication.

---

## 9. Post-Deploy Smoke Test Checklist

Run these checks **immediately after** deployment to production, before
announcing the launch. Each item maps to a critical user or admin flow.

### 9.1 Public — Age Gate

- [ ] `GET /` without cookies → age gate modal appears, no products visible.
- [ ] Accept age gate → catalog renders, `age_confirmed=1` cookie set.
- [ ] Reject age gate → blocking message shown, no products rendered.
- [ ] `GET /products/[any-valid-slug]` without cookies → age gate appears first.

### 9.2 Public — Catalog

- [ ] Products with `ACTIVE` status appear in the catalog.
- [ ] Products with `OUT_OF_STOCK` show the unavailability badge; interest button
      is absent.
- [ ] Products with `INACTIVE` or `internal: true` do not appear in any catalog
      or search result.
- [ ] Pagination ("Carregar mais") loads additional products correctly.
- [ ] Category filter works without a full page reload.
- [ ] Search by product name returns relevant results.

### 9.3 Public — Product Detail Page (PDP)

- [ ] `GET /products/[active-slug]` shows name, price, and "Tenho interesse" button.
- [ ] Clicking "Tenho interesse" creates an `OrderDraft` and shows the
      confirmation state.
- [ ] `GET /products/[nonexistent-slug]` shows the "Produto nao encontrado" state.
- [ ] `GET /products/[out-of-stock-slug]` shows unavailability, no interest button.

### 9.4 Admin

- [ ] `GET /admin` without cookie → redirects to `/admin/signin`.
- [ ] Login with invalid credentials → error displayed, no cookie set.
- [ ] Login with valid production credentials → redirects to `/admin` dashboard.
- [ ] `GET /admin/interests` → interests list or empty state renders correctly.
- [ ] Admin interests page on mobile viewport (390 x 844) → no horizontal overflow.
- [ ] `POST /api/admin/auth/signout` → cookie cleared, redirect to `/admin/signin`.
- [ ] After logout, `GET /admin` → redirects to `/admin/signin`.

### 9.5 Security Headers

- [ ] Response headers for `GET /` include `X-Frame-Options`, `X-Content-Type-Options`,
      `Referrer-Policy`. (Verify with browser DevTools -> Network -> Response Headers,
      or `curl -I https://<domain>/`.)
- [ ] `GET /api/admin/interests` without cookie returns `401 {"error":"Unauthorized"}`.
- [ ] `GET /robots.txt` returns a valid response disallowing `/admin` and `/api/`.

### 9.6 Prohibited Terms

Verify the following terms do **not** appear on any public-facing page:
`comprar`, `carrinho`, `checkout`, `pagamento`, `frete`, `whatsapp`,
`finalizar pedido`, `pedido final`.

---

## 10. Rollback Plan

### Rollback trigger

Execute a rollback if any of the following occur after deployment:

- Production smoke tests (Section 9) fail on more than one critical item.
- Age gate is bypassed or products are rendered without acceptance.
- Admin panel is publicly accessible without authentication.
- Application returns 500 errors on `GET /` for more than 5% of requests.
- Database connection errors prevent catalog from loading.

### Rollback procedure using tag `v0.1.0-mvp`

The `v0.1.0-mvp` tag on `main` is the known-good baseline for rollback.

```bash
# 1. Checkout the known-good tag locally
git fetch --tags
git checkout v0.1.0-mvp

# 2. Deploy the checked-out code to production
#    (exact command depends on your hosting provider)
#    Example for Vercel CLI:
#    vercel --prod

# 3. Verify the rollback by re-running the smoke tests in Section 9
```

**Database note:** The `v0.1.0-mvp` tag does not introduce schema changes
relative to the last stable migration. A rollback of the application code
does **not** require a database schema rollback. Existing `OrderDraft`
records remain intact.

**Environment variables note:** If the rollback is caused by a secret
rotation gone wrong, restore the previous `ADMIN_AUTH_SECRET` value in the
hosting provider's environment settings and trigger a redeployment of the
`v0.1.0-mvp` tag.

### Post-rollback steps

- [ ] Notify the team that a rollback was executed.
- [ ] Document the root cause in a post-mortem before the next deployment attempt.
- [ ] Open a blocking issue tracking the root cause fix before re-deploying.

---

## 11. Release Decision Checklist

All items below must be confirmed before the production deployment begins.
This checklist consolidates the blockers from the pre-release audit
(`docs/pre-release-audit.md`) and the new requirements identified in Phase 6A.

### 11.1 Hard blockers — deployment must not proceed if any item is unchecked

| ID | Item | Status |
|---|---|---|
| HB1 | Privacy policy page (`/privacidade` or equivalent) exists and is linked. | [ ] |
| HB2 | Cookie notice is displayed to first-time visitors. | [ ] |
| HB3 | `robots.txt` disallows `/admin` and `/api/`. | [ ] |
| HB4 | HTTP security headers are configured (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`). | [ ] |
| HB5 | HTTPS is enforced at the infrastructure level; `admin_session` cookie is only issued over HTTPS. | [ ] |
| HB6 | `ADMIN_AUTH_SECRET` is a production-unique random value, not the seed/dev value. | [ ] |
| HB7 | Seed credentials (`admin@jofogo.dev` / `Dev@2026!`) do not exist in the production database. | [ ] |
| HB8 | Production database has daily backups with a tested restore procedure. | [ ] |
| HB9 | All post-deploy smoke tests in Section 9 passed in staging. | [ ] |
| HB10 | `npm audit` shows no `high` or `critical` vulnerabilities in production dependencies. | [ ] |

### 11.2 Soft blockers — strongly recommended before launch, not strictly blocking

| ID | Item | Status |
|---|---|---|
| SB1 | Rate limiting on `POST /api/order-drafts` and `POST /api/analytics/events` (or WAF rules). | [ ] |
| SB2 | `OrderDraft` data retention policy defined (even if manual). | [ ] |
| SB3 | `Product.noindex` generates correct `<meta name="robots" content="noindex">` on PDP (verified in production build). | [ ] |
| SB4 | `PRODUCT_SCOPE.md` and `UX_FLOW.md` updated to mark WhatsApp as future scope, not V1. | [ ] |
| SB5 | Admin CRUD for products assessed: decision made on whether direct DB access is acceptable for initial launch or whether a basic UI is required. | [ ] |
| SB6 | Error boundary added to catalog to prevent blank screens on network failures. | [ ] |

### 11.3 Sign-off

| Role | Name | Date | Signature |
|---|---|---|---|
| Developer | | | |
| Product owner | | | |
| Legal / compliance | | | |

---

## 12. Deployment Runbook

> This section describes the sequence of steps for a production deployment.
> Do not execute any step until every hard blocker in Section 11.1 is resolved.

### Pre-deployment (T-48h)

1. Confirm that the release branch or tag (`v0.1.0-mvp` or a newer patch tag)
   has been code-reviewed and approved.
2. Run the full test suite in the staging environment:
   ```bash
   npm run test
   ```
   All 45 tests must pass. No new failures are acceptable.
3. Run the production build locally or in CI:
   ```bash
   npm run build
   ```
   Build must complete with zero TypeScript or ESLint errors.
4. Run dependency audit:
   ```bash
   npm audit --audit-level=high
   ```
   No `high` or `critical` issues must be present.
5. Complete the full smoke test checklist (Section 9) against staging.
6. Confirm all hard blockers in Section 11.1 are checked.

### Deployment (T-0)

7. Set all required environment variables in the hosting provider's dashboard
   (Section 2). Double-check `DATABASE_URL` and `ADMIN_AUTH_SECRET`.
8. Apply Prisma migrations to the production database:
   ```bash
   npx prisma migrate deploy
   ```
   Verify the command exits with status 0 before proceeding.
9. Deploy the application to the production hosting provider.
   *(Exact command depends on provider; use the provider's official CLI or
   dashboard deploy trigger.)*
10. Wait for the deployment to be marked healthy by the hosting provider.

### Post-deployment (T+0 to T+15min)

11. Execute every item in the post-deploy smoke test checklist (Section 9).
12. Verify security headers using browser DevTools or `curl -I https://<domain>/`.
13. Confirm `robots.txt` is reachable and correct at `https://<domain>/robots.txt`.
14. Log the deployment in the team's release log (date, tag deployed, deployer name).

### Rollback (if needed)

15. If any critical smoke test fails, follow the rollback procedure in Section 10.

---

## 13. Known Limitations Carried into Production (V1)

These limitations are **accepted** for the initial production launch of V1.
They are not blockers but must be tracked for post-launch resolution.

| # | Limitation | Mitigation / Next step |
|---|---|---|
| L1 | No rate limiting on `POST /api/order-drafts` and `POST /api/analytics/events`. | Monitor for abuse; add WAF rules at infrastructure level if needed. Add application-level rate limiting in V1.x. |
| L2 | `age_confirmed` cookie is unsigned and can be client-forged. | Accepted for V1 (preference gate, not security-critical). Disclose to legal team. |
| L3 | `admin_session` has no revocation mechanism; valid for 8 hours after issuance. | If credentials are suspected compromised, rotate `ADMIN_AUTH_SECRET` immediately (invalidates all sessions). |
| L4 | `OrderDraft` records have no TTL or automatic cleanup. | Define manual purge schedule; automate in V1.x. |
| L5 | No UI for admin product CRUD; catalog management requires direct database access. | Assess whether acceptable for initial launch. Plan admin CRUD as V1.x feature. |
| L6 | No automated UI tests for `CategoryFilter` and `ProductSearch`. | Covered by manual QA checklist. Add Playwright UI tests in V1.x. |
| L7 | `Product.noindex` metadata not yet verified in production build. | Verify during post-deploy smoke test (SB3). |

---

## References

| Document | Path |
|---|---|
| Pre-release audit | `docs/pre-release-audit.md` |
| Architecture | `docs/ARCHITECTURE.md` |
| Compliance notes | `docs/COMPLIANCE_NOTES.md` |
| Product scope | `docs/PRODUCT_SCOPE.md` |
| Data model | `docs/DATA_MODEL.md` |
| Environment example | `.env.example` |
| MVP tag | `v0.1.0-mvp` (git tag on `main`) |

---

*Prepared by: Antigravity (AI coding assistant) · Phase 6A · 2026-07-03*
*Awaiting human review before merge into `main`.*
