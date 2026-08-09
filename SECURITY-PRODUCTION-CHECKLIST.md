# Security Production Checklist — Manual Actions

Use this checklist after each production deploy and quarterly for account hygiene.

## Vercel Account

- [ ] MFA/2FA enabled on Vercel account
- [ ] Review team members — remove inactive users
- [ ] Review installed integrations (GitHub, Supabase, etc.)
- [ ] Confirm production branch is `main` only
- [ ] Verify environment variables:
  - [ ] `VITE_*` contain only public values
  - [ ] No service role key in any env var
  - [ ] `SITE_URL` matches production domain
- [ ] Preview deployments: confirm `/admin` is not usable without real admin credentials
- [ ] Review deployment logs for unexpected builds
- [ ] Confirm custom domain HTTPS is active (if applicable)

## GitHub Repository

- [ ] MFA/2FA enabled on GitHub account
- [ ] Branch protection on `main` (require PR review, block force push)
- [ ] Review collaborators and teams
- [ ] Revoke old Personal Access Tokens
- [ ] Review OAuth Apps and GitHub Apps with repo access
- [ ] Review Deploy Keys
- [ ] Enable Dependabot alerts + secret scanning (if available)
- [ ] Confirm GitHub Actions use `permissions: contents: read` minimum

## Supabase Project

- [ ] MFA enabled on Supabase dashboard account
- [ ] Confirm RLS enabled on all public tables
- [ ] Apply pending migrations (`add_public_insert_validation.sql`)
- [ ] Verify **no** service role key in frontend/Vercel `VITE_*` vars
- [ ] Review Auth users — remove unknown admins
- [ ] Review Storage bucket policies (`product-images`)
- [ ] Enable/disable database backups per plan
- [ ] Test restore procedure in staging (document RTO/RPO)
- [ ] Review API logs for unusual insert volume (contact/leads spam)

## DNS / Domain (if custom domain added)

- [ ] HTTPS certificate valid
- [ ] HSTS appropriate for domain scope
- [ ] No dangling DNS records to old hosts

## Post-Deploy Smoke Test (Non-Destructive)

Run against `https://clothes-marina.vercel.app/`:

- [ ] Home loads without CSP console errors
- [ ] Catalog and product detail load
- [ ] Google Maps iframe renders
- [ ] Fonts render (Manrope/Cormorant)
- [ ] Contact form submits successfully
- [ ] Admin login rejects non-admin users
- [ ] View page source — no `.env`, no service keys
- [ ] Confirm no public `*.js.map` files
- [ ] Check response headers include CSP + HSTS

## Third-Party Services

- [ ] Google Search Console — no security issues reported
- [ ] WhatsApp business number still correct
- [ ] Review any future ad network domains before CSP changes

## Credential Rotation Triggers

Rotate immediately if:

- `.env` was ever committed
- Admin password suspected compromised
- Supabase anon key leaked with weakened RLS
- Service role key exposed anywhere
- GitHub or Vercel account compromise suspected
