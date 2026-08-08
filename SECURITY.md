# Security Policy — Clothes Marina

## Scope

This document describes the current security controls for the Clothes Marina production catalog at `https://clothes-marina.vercel.app/`.

## Principles

1. **Defense in depth** — CSP + React escaping + RLS + server validation
2. **Zero trust for client input** — validate on client and enforce in database/API
3. **Least privilege** — anon key in browser; admin via JWT role + RLS
4. **Minimum third-party JavaScript** — no ad/analytics SDKs in the bundle
5. **Fail securely** — API errors do not expose stack traces to users

## Authentication & Authorization

- Admin access uses Supabase Auth email/password.
- Admin role is stored in JWT `app_metadata.role = admin` (set only via `review_admin_access_request` RPC).
- Admin UI routes are gated client-side (`ProtectedRoute`) and server-side (Supabase RLS).
- Public users do not self-register products or access admin tables.

## Content Security Policy

Production CSP is configured in `vercel.json`:

- `script-src 'self'` — only same-origin application bundle
- `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`
- `style-src` allows `'unsafe-inline'` (Tailwind) + `fonts.googleapis.com`
- `font-src` allows `fonts.gstatic.com`
- `connect-src` limited to Supabase
- `frame-src` limited to Google Maps
- `Content-Security-Policy-Report-Only` monitors stricter `img-src` policy

## Security Headers

Configured via `vercel.json`:

- `Strict-Transport-Security` (1 year, includeSubDomains, preload)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (restricts sensors/payment/USB)
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-site`

## Secrets Management

- Never commit `.env` files (see `.gitignore`).
- Use `.env.example` for non-secret placeholders.
- **Do not** set `SUPABASE_SERVICE_ROLE_KEY` in any `VITE_` variable.
- Rotate credentials if they ever appear in Git history.

## Dependency Management

- Lockfile: `package-lock.json` (required)
- Dependabot: `.github/dependabot.yml` (weekly)
- CI audit: `.github/workflows/security-ci.yml`
- SBOM: `npm run sbom` → `sbom.cdx.json`

## Reporting Vulnerabilities

If you discover a security issue in production:

1. Do not exploit it against live customers.
2. Document steps to reproduce locally or in staging.
3. Follow `INCIDENT-RESPONSE.md` if production may already be affected.

## Safe Deployment Process

1. Run `npm run verify:security`, `npm run test:security`, `npm run lint`, `npm run build`
2. Review diff — especially `vercel.json`, `api/`, `supabase/migrations/`
3. Apply SQL migrations in Supabase before/with frontend deploy
4. Deploy to Vercel preview first; verify CSP, maps, fonts, product pages
5. Promote to production manually

## Out of Scope (Current)

- Public user registration (not implemented)
- Checkout/payments (not implemented — WhatsApp handoff only)
- Ad networks (future — must not use `script-src *`)
