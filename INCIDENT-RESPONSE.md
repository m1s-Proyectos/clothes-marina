# Incident Response — Clothes Marina

## When to Use This Playbook

Activate if you observe:

- Unexpected content on the website
- Unknown admin users or products
- Browser warnings (malware/phishing) for your domain
- Secrets exposed in Git, logs, or client bundle
- Unusual Supabase activity or data deletion
- Customer reports of redirects or suspicious popups

## Severity Levels

| Level | Example | Response Time |
| --- | --- | --- |
| P0 | Active malware served to customers, leaked service role key | Immediate |
| P1 | Admin account compromise suspected, SSRF/XSS actively exploited | < 1 hour |
| P2 | Spam flood, dependency CVE with exploit path | < 24 hours |
| P3 | Misconfiguration without active exploitation | Planned fix |

## Response Steps

### 1. Stop Compromised Deployments

- In Vercel: pause/auto-cancel suspicious deployments
- Do **not** deploy further until root cause is understood
- Optionally roll back to last known good deployment (`security-audit-checkpoint-2ba8c9a` or prior stable commit)

### 2. Identify Last Known Good State

```bash
git log --oneline -20
git checkout security-audit-checkpoint-2ba8c9a  # example restore point
```

- Compare Vercel deployment history with Git commits
- Note timestamp of first suspicious change

### 3. Review Git History

- Check recent commits and authors
- Review PR merges outside normal process
- Search for unexpected changes in `vercel.json`, `api/`, `package.json`, admin pages

### 4. Review Sessions & Access

- Supabase Auth: list users with `app_metadata.role = admin`
- Revoke sessions for compromised accounts (Supabase dashboard)
- GitHub: review active sessions and PATs
- Vercel: review team access and tokens

### 5. Review Logs

- Vercel function logs (`/api/share/*`)
- Supabase logs (API, Auth, Postgres)
- Look for spikes in `contact_requests`, `whatsapp_leads` inserts
- Failed admin login patterns (manual review)

### 6. Revoke & Rotate Secrets

Rotate in this order if exposure suspected:

1. Supabase **service role** key (if ever exposed)
2. Supabase **anon** key (if RLS was weakened)
3. Supabase database password (if exposed)
4. Admin user passwords
5. GitHub/Vercel tokens
6. Any third-party webhook secrets

Update Vercel environment variables after rotation.

### 7. Review Dependencies

```bash
npm audit
npm run sbom
```

- Compare `package-lock.json` changes in suspicious commits
- Remove unexpected packages or postinstall scripts

### 8. Fix Vulnerability

- Patch code/configuration locally
- Run full test suite: `npm run verify:security && npm run test:security && npm run build`
- Apply Supabase SQL fixes if RLS/policy issue

### 9. Redeploy from Known Good Code

- Deploy fixed code via normal Vercel pipeline
- Prefer preview deployment validation first
- Promote to production only after smoke tests pass

### 10. Verify Production (Non-Destructive)

- CSP present, no unexpected external scripts
- Product pages load correctly
- Admin panel inaccessible without valid admin JWT
- No secrets in browser DevTools → Sources/Network
- Share previews still work (WhatsApp/Facebook)

### 11. Document the Incident

Record:

- Timeline (detection → containment → recovery)
- Root cause
- Credentials rotated
- Customers affected (if any)
- Follow-up hardening tasks

## Communication Template

> Detectamos actividad inusual en Clothes Marina el [fecha]. Contuvimos el incidente, rotamos credenciales y restauramos el sitio desde una versión verificada. Si notaste comportamiento extraño, cierra sesión y contáctanos.

## Prevention Controls (Ongoing)

- MFA on GitHub, Vercel, Supabase
- Branch protection + code review
- CI security checks (`.github/workflows/security-ci.yml`)
- Dependabot weekly updates
- Quarterly checklist (`SECURITY-PRODUCTION-CHECKLIST.md`)
- Never commit secrets; use `.env.example` only

## Emergency Contacts

Maintain offline:

- Vercel support
- Supabase support
- Domain registrar
- Repository owner phone/email

Do **not** store live credentials in this document.
