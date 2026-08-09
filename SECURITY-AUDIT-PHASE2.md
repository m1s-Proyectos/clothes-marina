# Security Audit — Phase 2 Addendum

**Date:** 2026-08-08  
**Baseline score:** 78/100  
**Phase 2 score:** 86/100  
**Status:** GO FOR PREVIEW (not production yet)

See full npm vulnerability matrix and RLS matrix in the final report delivered to the user.

## Phase 2 Changes Summary

| Area | Action |
| --- | --- |
| npm audit | 14 → 4 total (0 production High) |
| sharp | Updated to 0.35.3 (serverless runtime) |
| Public writes | RPC + rate limits + honeypot; direct INSERT blocked |
| CSP img-src | Tightened to `'self' data: blob: *.supabase.co images.unsplash.com` |
| Google Fonts | Self-hosted via `@fontsource/*` |
| Admin image URLs | Allowlist validation in services |
| SSRF | Redirect blocking + expanded tests |
| OG poisoning | Regression tests added |
| CI | Production-only high audit gate |

## Required Before Preview Deploy

1. Apply Supabase migrations in order:
   - `add_public_insert_validation.sql`
   - `add_public_write_rpcs.sql`
2. Confirm Vercel env vars (see `.env.example`)
3. Run full local test suite
4. Deploy preview branch on Vercel
5. Smoke test contact form + WhatsApp + admin + fonts

## Remaining High (Dev Only)

None in production dependencies (`npm audit --omit=dev --audit-level=high` passes).

## Remaining Moderate

- `esbuild` via Vite 5 — **dev server only**, fix requires Vite 8 (Major)
- `react-router` 6.30.4 — **browser**, SSR CVEs N/A; open redirect low risk (no user-controlled navigate URLs)
