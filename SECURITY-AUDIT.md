# Security Audit Report — Clothes Marina

**Date:** 2026-08-08  
**Production URL:** https://clothes-marina.vercel.app/  
**Restore point:** branch `security-audit-checkpoint-2ba8c9a` @ commit `2ba8c9a`  
**Auditor scope:** Repository + frontend + backend + Supabase + Vercel + dependencies  
**Production testing:** Passive/non-destructive only

---

## Executive Summary

Clothes Marina has a **solid baseline** for a Supabase-backed SPA: RLS on writes, no XSS sinks found, CSP with `script-src 'self'`, and good social-share hardening. Critical gaps before this audit included **SSRF in the image proxy**, **OG tag poisoning via query params**, and **missing CI/supply-chain controls**.

This audit implemented safe fixes locally **without deploying to production**.

---

## Threat Model Summary

| Threat | Surface | Existing Protection | Needed / Implemented |
| --- | --- | --- | --- |
| External attacker | Public site, APIs | CSP, RLS, React escaping | SSRF fix, input validation, CI |
| Malicious user | Forms, search, ratings | RLS insert policies | Length constraints + client validation |
| Compromised admin | Admin panel | JWT role + RLS | MFA (manual), audit logging (partial) |
| Compromised dependency | npm packages | Lockfile | Dependabot + CI audit + SBOM |
| CI/CD compromise | GitHub → Vercel | None | New security workflow (manual branch protection) |
| Stolen token | Client bundle | Anon key public by design | RLS; never use service role client-side |
| Third-party script | CDN/analytics | None loaded | CSP blocks external scripts |
| Stored XSS | Product text in DB | React text nodes | Continue avoiding `dangerouslySetInnerHTML` |

---

## Production Observations (Passive)

| Check | Result |
| --- | --- |
| HTTPS | ✅ HTTP → 308 redirect to HTTPS |
| HSTS | ✅ `max-age=31536000; includeSubDomains; preload` |
| CSP | ✅ Present (pre-fix policy) |
| X-Content-Type-Options | ✅ `nosniff` |
| Referrer-Policy | ✅ `strict-origin-when-cross-origin` |
| Permissions-Policy | ✅ Restrictive |
| X-Frame-Options | ✅ `DENY` (pre-fix) |
| Access-Control-Allow-Origin | ⚠️ `*` on static responses (Vercel default for public assets) |
| Server header | ℹ️ `Vercel` (informational) |
| Service worker | ✅ None found |
| Public `.map` files | ✅ Not observed on main bundle (spot check) |

---

## Findings Before Remediation

### P0 — Critical

| ID | Finding | Location | Status |
| --- | --- | --- | --- |
| C-01 | SSRF via unvalidated `img` URL in image proxy | `api/share/image.ts` | **Fixed** — allowlist + DB trust |
| C-02 | OG poisoning bypassing DB for crawlers | `api/share/product.ts:151-159` | **Fixed** — DB-only metadata |

### P1 — High

| ID | Finding | Location | Status |
| --- | --- | --- | --- |
| H-01 | Open INSERT policies (spam/abuse) | `admin_security.sql` | **Partial** — validation + SQL constraints added; rate limit still needed |
| H-02 | Middleware dropped User-Agent | `middleware.ts` | **Fixed** |
| H-03 | npm high vulnerabilities (transitive) | `package-lock.json` | **Partial** — run `npm audit fix` |
| H-04 | No CI/CD security pipeline | repo root | **Fixed** — GitHub Actions added |

### P2 — Medium

| ID | Finding | Location | Status |
| --- | --- | --- | --- |
| M-01 | CSP/fonts mismatch | `index.css` vs `vercel.json` | **Fixed** — font domains added |
| M-02 | Permissive `img-src https:` | `vercel.json` | **Monitored** — Report-Only stricter policy |
| M-03 | Client-only admin route gate | `ProtectedRoute.tsx` | Documented — RLS is authoritative |
| M-04 | Missing input validation | contact/leads services | **Fixed** |
| M-05 | No SBOM / Dependabot | repo | **Fixed** |
| M-06 | Canonical OG URL pointed to API | `api/share/product.ts` | **Fixed** — `/product/:id` |

### P3 — Low

| ID | Finding | Location | Status |
| --- | --- | --- | --- |
| L-01 | `useSeo.ts` dead code | `src/hooks/useSeo.ts` | Documented |
| L-02 | Dev server `host: true` | `vite.config.ts` | Dev-only note |
| L-03 | Placeholder Supabase env fallbacks | `src/config/env.ts` | Documented |

---

## Secrets Scan

**Secrets found in repository code:** **0 live secrets**

| Type | File | Risk |
| --- | --- | --- |
| Placeholder anon key | `src/config/env.ts` | Low — dev fallback string, not real |
| Default WhatsApp phone | `src/config/env.ts`, `share.ts` | Info — public business number |
| `.env` | gitignored | ✅ Not tracked |

**Action:** Ensure real keys exist only in Vercel/Supabase dashboards. Rotate if `.env` was ever committed historically.

---

## OWASP Top 10 (2021) Assessment

| Category | Result | Evidence |
| --- | --- | --- |
| A01 Broken Access Control | **PARTIAL** | RLS strong; admin UI also client-gated |
| A02 Cryptographic Failures | **PASS** | HTTPS/HSTS; Supabase handles password hashing |
| A03 Injection | **PASS** | Supabase parameterized queries; no dynamic SQL in app |
| A04 Insecure Design | **PARTIAL** | Open public inserts by design — mitigated with validation |
| A05 Security Misconfiguration | **PARTIAL** | Good headers; CORS `*` on static assets |
| A06 Vulnerable Components | **PARTIAL** | 14 npm advisories pre-fix; CI audit added |
| A07 Auth Failures | **PARTIAL** | Supabase Auth; no MFA on app itself |
| A08 Software/Data Integrity | **PARTIAL** | Lockfile yes; CI added; no SRI on fonts |
| A09 Logging Failures | **PARTIAL** | console.warn only; no centralized SIEM |
| A10 SSRF | **FAIL → FIXED** | Image proxy patched |

---

## Dependencies

Pre-fix: **14 vulnerabilities** (1 low, 4 moderate, 9 high) via `npm audit`.

Notable:

- `@remix-run/router` — open redirect (moderate) — fix via `npm audit fix`
- `ws` — memory issues (high, dev/transitive)
- `brace-expansion` — ReDoS (high, dev/transitive)

**Policy:** No automatic major upgrades. Run `npm audit fix` and review lockfile diff.

Regenerate SBOM after dependency changes:

```bash
npm run sbom
```

---

## Third-Party Code Capable of Executing or Loading Content

| Source | Type | Necessary? | CSP |
| --- | --- | --- | --- |
| Vite bundle (`script-src 'self'`) | 1st party | Yes | Allowed |
| Google Fonts CSS | 3rd party stylesheet | Yes (design) | Allowed |
| Google Fonts files | 3rd party font | Yes | `font-src` allowed |
| Google Maps iframe | 3rd party embed | Yes | `frame-src` allowed |
| Supabase SDK | Bundled dependency | Yes | N/A (bundle) |
| Unsplash images | Remote images | Optional marketing | `img-src https:` |
| Share platforms | External links only | Yes | Not executed |

**No ad networks, analytics, or third-party JS SDKs.**

---

## CSP Changes

### Before (production observed)

```
default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none';
form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https:; font-src 'self' data: https:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
frame-src https://www.google.com https://maps.google.com; upgrade-insecure-requests
```

### After (local — pending deploy)

**Enforcement:** adds `script-src-elem 'self'`, `fonts.googleapis.com`, `fonts.gstatic.com`, `manifest-src`, `media-src`, `worker-src`, removes duplicate `X-Frame-Options` (frame-ancestors covers framing).

**Report-Only:** stricter `img-src` (`*.supabase.co`, `images.unsplash.com` only) for monitoring before tightening enforcement.

| Domain | Reason |
| --- | --- |
| `'self'` | App bundle/assets |
| `fonts.googleapis.com` | Google Fonts CSS |
| `fonts.gstatic.com` | Font files |
| `*.supabase.co` | API/Auth/Storage |
| `google.com` / `maps.google.com` | Maps iframe |
| `https:` (images, enforcement only) | Admin-entered external product image URLs |

---

## Security Headers Table

| Header | Before | After | Motive |
| --- | --- | --- | --- |
| CSP | Baseline strict scripts | + font domains, report-only | Fix font blocking; monitor img tightening |
| HSTS | 1y + preload | Same | Force HTTPS |
| X-Content-Type-Options | nosniff | nosniff | MIME sniffing protection |
| Referrer-Policy | strict-origin-when-cross-origin | Same | Limit referrer leakage |
| Permissions-Policy | Restrictive | Same | Disable unused APIs |
| X-Frame-Options | DENY | Removed (redundant) | `frame-ancestors 'none'` in CSP |
| COOP | absent | same-origin | Isolate browsing context |
| CORP | absent | same-site | Reduce cross-origin reads |

---

## Files Modified in This Audit

| File | Change |
| --- | --- |
| `api/_lib/urlSafety.ts` | **New** — SSRF URL allowlist helpers |
| `api/share/image.ts` | SSRF fix, content-type check |
| `api/share/product.ts` | Remove OG poisoning; fix canonical URL |
| `middleware.ts` | Forward User-Agent to share API |
| `vercel.json` | CSP hardening, COOP/CORP, Report-Only |
| `src/utils/inputValidation.ts` | **New** — validation helpers |
| `src/services/contactService.ts` | Server-side validation before insert |
| `src/services/whatsAppLeadService.ts` | Validate lead payloads |
| `supabase/migrations/add_public_insert_validation.sql` | **New** — DB length constraints |
| `vite.config.ts` | Explicit `sourcemap: false` |
| `.gitignore` | Secrets, Vercel, logs, SBOM |
| `.env.example` | Document server vs public vars |
| `package.json` | Security scripts |
| `.github/workflows/security-ci.yml` | **New** — CI pipeline |
| `.github/dependabot.yml` | **New** — weekly updates |
| `tests/security/*` | **New** — automated security tests |
| `SECURITY*.md`, `INCIDENT-RESPONSE.md` | **New** — documentation |

---

## Remaining Risks

1. **Public INSERT spam** — contact/leads tables accept anonymous inserts (mitigated, not eliminated)
2. **Permissive `img-src https:`** — arbitrary HTTPS images in CSP enforcement
3. **Admin protection partly client-side** — must keep RLS policies synchronized
4. **No WAF/rate limiting** at edge for forms/APIs
5. **Google Fonts** — third-party CSS supply chain (consider self-hosting)
6. **npm transitive vulnerabilities** — requires ongoing Dependabot/audit
7. **HSTS preload** — verify all subdomains support HTTPS before keeping preload
8. **Future ads** — must add explicit CSP domains, never `script-src *`

---

## Manual Actions Required

1. **Apply Supabase migration:** `add_public_insert_validation.sql`
2. **Set Vercel server env vars:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SITE_URL` (non-VITE)
3. **Run `npm audit fix`** and review lockfile
4. **Enable GitHub branch protection + MFA** (see checklist)
5. **Deploy to preview first**, verify fonts/maps/products/share previews
6. **Promote to production manually**
7. **Post-deploy passive checks** (headers, CSP console, admin gate)

---

## Safe Deployment Steps

```bash
# 1. Review changes
git diff security-audit-checkpoint-2ba8c9a

# 2. Run checks locally
npm ci
npm audit --audit-level=high
npm run verify:security
npm run test:security
npm run lint
npm run build

# 3. Commit (when ready — NOT pushed automatically by audit)
git add .
git commit -m "security: harden CSP, SSRF protections, validation, and CI"

# 4. Push and deploy via Vercel preview first
git push origin main

# 5. Apply Supabase SQL migration in dashboard SQL editor

# 6. Validate preview → promote production
```

**This audit did NOT push or deploy to production.**
