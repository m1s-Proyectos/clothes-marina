# Security Preview Report — Clothes Marina

**Date:** 2026-08-08  
**Branch:** `security/phase-2-preview`  
**Commit:** `a656e55` — *security: complete phase 2 hardening*  
**Preview URL (Vercel):** https://clothes-marina-exqtmovl6-m1s-proyectos-projects.vercel.app  
**Production URL (unchanged):** https://clothes-marina.vercel.app/

---

## Executive Summary

| Metric | Before Preview | After Preview Validation |
| --- | --- | --- |
| **Security Score** | 86/100 | **88/100** (code-ready; deploy validation partial) |
| **CRITICAL** | 0 | **0** |
| **HIGH** | 0 | **0** |
| **Decision** | GO FOR PREVIEW | **NOT READY FOR PRODUCTION** |

### Why NOT READY FOR PRODUCTION

1. **Vercel Deployment Protection (SSO)** blocks automated external access to the Preview URL — CSP/headers/scripts could not be verified live on Preview without manual authentication.
2. **Supabase migrations** (`add_public_insert_validation.sql`, `add_public_write_rpcs.sql`) must be applied by the operator — RPC existence in DB **not verified** from this environment.
3. **Contact/WhatsApp RPC** functional end-to-end test on Preview **blocked** by SSO + pending migration confirmation.

The **code and local pipeline** pass all automated gates. Production promotion requires manual Preview smoke test after SSO login and confirmed Supabase migration.

---

## 1. Repository Verification

| Check | Result |
| --- | --- |
| Branch | `security/phase-2-preview` |
| Commit | `a656e55` |
| Push to `main` | **No** |
| `.env` in commit | **No** (gitignored; only `.env.example` with placeholders) |
| Phase 1 + 2 changes | **Included** (36 files, +1852 lines) |
| Restore point | `security-audit-checkpoint-2ba8c9a` @ `2ba8c9a` |

---

## 2. Supabase Migrations — Code Review

### `add_public_insert_validation.sql`

| Question | Answer |
| --- | --- |
| Destructive? | **No** — only CHECK constraints |
| Tables | `contact_requests`, `whatsapp_leads` |
| Idempotent? | Yes (`DROP CONSTRAINT IF EXISTS`) |
| Blocks functionality? | Only if existing rows violate length bounds |

### `add_public_write_rpcs.sql`

| Question | Answer |
| --- | --- |
| Destructive? | **No** |
| Creates | `submit_contact_request`, `track_whatsapp_lead` |
| Policies | Replaces open INSERT with `with check (false)` |
| Idempotent? | Yes (`CREATE OR REPLACE`, `DROP POLICY IF EXISTS`) |
| Blocks functionality? | **Yes until applied** — frontend now calls RPCs |

### DB verification status

**NOT CONFIRMED APPLIED.** Code confirms frontend uses:

- `supabase.rpc("submit_contact_request", ...)` in `contactService.ts`
- `supabase.rpc("track_whatsapp_lead", ...)` in `whatsAppLeadService.ts`

Automated test: `tests/security/rpc-integration.test.mjs` (4 tests PASS).

**Operator action:** Run both SQL files in Supabase SQL Editor, then test one contact submission.

---

## 3. Local Pipeline Results

| Command | Result |
| --- | --- |
| `npm audit --omit=dev --audit-level=high` | **PASS** (0 Critical, 0 High) |
| `npm run verify:security` | **PASS** (8/8) |
| `npm run test:security` | **PASS** (25/25) |
| `npm run lint` | **PASS** |
| `npm run typecheck` | **PASS** |
| `npm run build` | **PASS** |

---

## 4. Preview Deployment

| Item | Value |
| --- | --- |
| GitHub deployment | Preview — **success** |
| Vercel dashboard | https://vercel.com/m1s-proyectos-projects/clothes-marina/67VoYP6pyuqyPc8a2o3f4CTzwJj3 |
| Preview URL | https://clothes-marina-exqtmovl6-m1s-proyectos-projects.vercel.app |
| Protection | **Vercel SSO** — returns `302` → `vercel.com/sso-api` |
| `X-Robots-Tag` | `noindex` on protected preview |

---

## 5. HTTP Headers on Preview

**Automated external verification: BLOCKED (SSO).**

Expected headers from `vercel.json` (will apply once accessible):

| HEADER | EXPECTED VALUE (summary) | AUTO TEST | COMMENT |
| --- | --- | --- | --- |
| HTTPS | TLS | **BLOCKED** | SSO redirect before content |
| Content-Security-Policy | strict script-src 'self'; img-src *.supabase.co + unsplash | **CONFIG PASS** | Verified in repo + static tests |
| CSP-Report-Only | Same img-src strict | **CONFIG PASS** | Present in vercel.json |
| Strict-Transport-Security | max-age=31536000; includeSubDomains; preload | **BLOCKED** | HSTS visible on SSO redirect |
| X-Content-Type-Options | nosniff | **CONFIG PASS** | In vercel.json |
| Referrer-Policy | strict-origin-when-cross-origin | **CONFIG PASS** | In vercel.json |
| Permissions-Policy | restrictive | **CONFIG PASS** | In vercel.json |
| Cross-Origin-Opener-Policy | same-origin | **CONFIG PASS** | New in phase 2 |
| Cross-Origin-Resource-Policy | same-site | **CONFIG PASS** | New in phase 2 |

**Production (current `main`, passive):** still on **old CSP** (`img-src https:`, Google Fonts via CSS). Preview branch has hardened CSP not yet on production.

---

## 6. CSP — Expected Behavior (from config + local build)

| Directive | Allowed | Risk |
| --- | --- | --- |
| script-src | `'self'` only | Low |
| style-src | `'self' 'unsafe-inline'` | Required for Tailwind |
| img-src | `'self' data: blob: *.supabase.co images.unsplash.com` | Medium-low |
| font-src | `'self' data:` | Self-hosted fonts |
| connect-src | `'self' *.supabase.co` | Low |
| frame-src | Google Maps only | Low |

No `*` wildcards. No external font CDNs.

---

## 7. JavaScript Inventory (local `dist/` = Preview build artifact)

| URL / Source | Type | Expected | Risk |
| --- | --- | --- | --- |
| `/assets/index-*.js` | First-party bundle | Yes | Low |
| Supabase SDK (in bundle) | First-party dep | Yes | Low — anon key only at runtime via env |
| Google Maps | iframe only | Yes | Low — no JS from Google |
| External analytics/ads | None | Yes | None |
| Google Fonts CDN | **Removed** | Yes | None |

---

## 8. Contact Form

| Test | Method | Result |
| --- | --- | --- |
| Uses RPC not INSERT | Code + automated test | **PASS** |
| Honeypot field | Code review | **PASS** (`company` hidden field) |
| Client validation | Unit tests | **PASS** |
| Server rate limits | SQL migration review | **PASS** (logic present) |
| Live submit on Preview | External | **BLOCKED** (SSO + migrations) |

---

## 9. WhatsApp Leads

| Test | Result |
| --- | --- |
| Uses `track_whatsapp_lead` RPC | **PASS** (code + test) |
| Direct INSERT removed | **PASS** |
| Live flow on Preview | **BLOCKED** (SSO) |

---

## 10. Admin Authorization (logical + code)

| Test | Result |
| --- | --- |
| `ProtectedRoute` client gate | Present |
| RLS `is_admin()` on writes | **PASS** (SQL review) |
| Non-admin direct INSERT products | **Should FAIL** at Supabase (RLS) |
| Live destructive test | **Not executed** (non-destructive policy) |

**Evidence:** `rls.sql` — all writes on `products`, `categories`, `product_images` require `is_admin()`.

---

## 11. RLS Matrix (reconfirmed)

See `SECURITY-AUDIT-PHASE2.md`. No changes since phase 2 code review.

- anon: public read + RPC writes only (post-migration)
- authenticated non-admin: same as anon for catalog; own admin_access_requests
- admin: full catalog write + inbox read

---

## 12. SSRF Regression

| Test | Result |
| --- | --- |
| `urlSafety.test.mjs` | **PASS** (6 cases) |
| Redirect blocking in `image.ts` | **PASS** (code) |
| Live Preview API test | **BLOCKED** (SSO) |

---

## 13. OG Share Poisoning

| Test | Result |
| --- | --- |
| `og-poisoning.test.mjs` | **PASS** |
| Query params `t`, `d`, `img` ignored | **PASS** (code) |
| Live crawler simulation on Preview | **BLOCKED** (SSO) |

---

## 14. Source Maps

| Check | Result |
| --- | --- |
| `vite.config.ts` sourcemap: false | **PASS** |
| `/assets/*.js.map` on Preview | **BLOCKED** (SSO — no file served) |
| Local dist | No `.map` files |

---

## 15. Sensitive Paths (Preview, passive)

| Path | Response | Sensitive leak? |
| --- | --- | --- |
| `/.env` | 302 SSO | **No** |
| `/.env.local` | 302 SSO | **No** |
| `/.git/config` | 302 SSO | **No** |
| `/package.json` | 302 SSO | **No** |

Note: Production SPA returns `index.html` for unknown paths — also no real `.env` leak.

---

## 16. Bundle Secret Scan (`dist/assets/index-*.js`)

| Pattern | Found |
| --- | --- |
| SERVICE_ROLE | **No** |
| DATABASE_URL | **No** |
| Real JWT keys | **No** |
| Placeholder keys | **No** (build without local `.env` secrets) |

Library strings containing "password" / "apikey" (Supabase SDK method names): **Info only — not secrets**.

---

## 17. Dependencies

```
npm audit --omit=dev --audit-level=high → PASS
```

Remaining: 2 **moderate** (`react-router` — SSR N/A for SPA; open redirect low practical risk).

---

## 18. Performance / Local Smoke Test

Local `npm run preview` @ `127.0.0.1:4173`:

| Route | HTTP |
| --- | --- |
| `/` | 200 |
| `/catalog` | 200 |
| `/contact` | 200 |
| `/admin/login` | 200 |

Scripts in HTML: single module `/assets/index-*.js` only.

---

## 19. Logs

Preview logs not accessible from this environment. Code review: no logging of passwords/tokens in client services. Supabase SDK handles auth headers internally.

---

## 20–22. Manual Checklists

See `SECURITY-PRODUCTION-CHECKLIST.md` (Vercel, GitHub, Supabase) and branch protection recommendations below.

### GitHub `main` branch protection (recommended before production)

- [ ] Require pull request before merge
- [ ] Require status checks: Security CI
- [ ] Block force push
- [ ] Block branch deletion
- [ ] Require 1 approval

---

## 23. Severity Summary (Post-Preview)

| Severity | Count | Notes |
| --- | --- | --- |
| CRITICAL | **0** | |
| HIGH | **0** | Production audit clean |
| MEDIUM | **3** | Preview SSO blocks validation; migrations unconfirmed; moderate react-router |
| LOW | **2** | Vercel preview protection UX; production still on old CSP until merge |

---

## 24. Final Decision

# NOT READY FOR PRODUCTION

### Gates status

| Gate | Status |
| --- | --- |
| Critical = 0 | ✅ |
| High = 0 | ✅ |
| Audit production high | ✅ |
| Build | ✅ |
| Security tests (25) | ✅ |
| RLS (code/SQL review) | ✅ |
| Admin authorization (RLS) | ✅ |
| CSP (live Preview) | ⚠️ **NOT VERIFIED** (SSO) |
| No secrets in bundle | ✅ |
| Contact RPC (live) | ⚠️ **PENDING** migrations + manual test |
| WhatsApp RPC (live) | ⚠️ **PENDING** |
| SSRF/OG regression tests | ✅ |
| Preview functional validation | ⚠️ **BLOCKED** (SSO) |

---

## 25. Steps When Ready for Production

**Do NOT merge until all ⚠️ items below are resolved.**

### A. Before merge

1. Apply Supabase migrations (both SQL files).
2. Open Preview URL in browser (authenticate via Vercel SSO if required).
3. Manual smoke test: Home, Catalog, Product, Contact submit, Admin login, Maps, fonts.
4. DevTools → Console: zero CSP violations.
5. DevTools → Network: confirm single JS bundle, Supabase calls OK.
6. Optional: disable Deployment Protection for preview branch temporarily to re-run automated header checks.

### B. Merge commands

```bash
git checkout main
git pull origin main
git merge --no-ff security/phase-2-preview
git push origin main
```

### C. Pre-deploy verification

```bash
npm audit --omit=dev --audit-level=high
npm run verify:security && npm run test:security && npm run lint && npm run typecheck && npm run build
```

### D. Post-deploy (production) — non-destructive

```bash
curl -sI https://clothes-marina.vercel.app/ | findstr /I "content-security strict-transport cross-origin"
```

- Verify new CSP (`img-src` without bare `https:`)
- Verify COOP/CORP headers present
- Test contact form once
- Confirm no CSP console errors

### E. Rollback if failure

```bash
git revert -m 1 <merge-commit-sha>
git push origin main
```

Or in Vercel Dashboard: **Deployments → previous production → Promote to Production**.

Restore point: `git checkout security-audit-checkpoint-2ba8c9a`

---

## Appendix: Preview URL Access

If Preview shows Vercel login:

1. Vercel Dashboard → Project → Settings → Deployment Protection
2. For preview testing: allow team access or temporarily disable Standard Protection for Preview
3. Re-run header/CSP checks after access granted

**Never disable protections on Production.**
