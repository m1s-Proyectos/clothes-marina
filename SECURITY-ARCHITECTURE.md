# Security Architecture — Clothes Marina

## Restore Point (Phase 0)

Before this security hardening work:

- **Branch:** `main`
- **Commit:** `2ba8c9a` — *Add local reference images for catalog and categories.*
- **Restore branch created:** `security-audit-checkpoint-2ba8c9a`

To roll back code changes from this audit:

```bash
git checkout security-audit-checkpoint-2ba8c9a
```

## Stack Discovered

| Layer | Technology |
| --- | --- |
| Frontend | React 18 + TypeScript + Vite 5 |
| Routing | React Router DOM 6 |
| Styling | Tailwind CSS 3 + Google Fonts |
| Backend/API | Vercel Serverless Functions (`api/share/*`) + Vercel Edge Middleware |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email/password, JWT sessions) |
| Storage | Supabase Storage (`product-images` bucket) |
| Edge functions | Supabase Edge Function template (`contact`) — not wired in production UI |
| Hosting | Vercel (`clothes-marina.vercel.app`) |
| Package manager | npm (`package-lock.json`) |

## Architecture Map

```text
Browser (customer/admin)
  |
  | HTTPS
  v
Vercel CDN + Edge Middleware (/product/* social crawlers)
  |
  +--> Static SPA (React bundle from /index.html)
  |
  +--> /api/share/product  (OG HTML for social crawlers)
  +--> /api/share/image    (OG image proxy/resize via sharp)
  |
  v
Supabase
  +--> PostgREST (anon key + RLS)
  +--> Auth (JWT in browser storage)
  +--> Storage (public read, admin write)
  +--> RPC (ratings, analytics, admin review)
```

## Trust Boundaries

| Boundary | Public Side | Private Side | Controls |
| --- | --- | --- | --- |
| Browser ↔ Vercel | Untrusted user input, DOM, localStorage | Static assets, CSP, security headers | CSP, React escaping, input validation |
| Browser ↔ Supabase | Anon key (public by design) | Data protected by RLS | RLS policies, RPC checks, no service role in client |
| Crawlers ↔ Share API | Social bots, query params | Product metadata | DB-backed OG tags, URL allowlists, HTML escaping |
| Image proxy ↔ Internet | Product image URLs | Internal network | HTTPS allowlist (Supabase storage + Unsplash) |
| Admin UI ↔ Supabase | Authenticated JWT | Admin-only tables/RPC | `app_metadata.role = admin`, RLS, SECURITY DEFINER RPC |
| GitHub ↔ Vercel | Source repo | Production deploy | Branch protection (manual), MFA (manual), CI checks |

## Public Endpoints

- `/`, `/catalog`, `/catalog/:slug`, `/product/:id`, `/contact`, `/about`, etc.
- `/api/share/product`, `/api/share/image`
- Supabase REST/RPC via client SDK

## Private / Restricted Surfaces

- `/admin/*` (client gate + Supabase RLS)
- Supabase admin tables: `contact_requests`, `whatsapp_leads`, raw `product_ratings`
- Storage writes (admin only)

## Environment Variable Classification

| Variable | Scope | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | PUBLIC | Expected in browser bundle |
| `VITE_SUPABASE_ANON_KEY` | PUBLIC | Expected; security relies on RLS |
| `VITE_APP_URL` | PUBLIC | Canonical/share URLs |
| `VITE_WHATSAPP_PHONE` | PUBLIC | Business contact number |
| `VITE_EDGE_CONTACT_URL` | PUBLIC | Optional external endpoint |
| `SUPABASE_URL` | SERVER | Preferred for API routes |
| `SUPABASE_ANON_KEY` | SERVER | Read-only product fetch in share APIs |
| `SITE_URL` | SERVER | Canonical URLs in share HTML |
| `SUPABASE_SERVICE_ROLE_KEY` | **NEVER CLIENT** | Must not exist in frontend env |

## External Dependencies (Runtime)

| Provider | Purpose | JS in browser? |
| --- | --- | --- |
| Supabase | DB/Auth/Storage | SDK bundled (1st party dependency) |
| Google Fonts | Typography CSS/fonts | CSS `@import` (3rd party stylesheet) |
| Google Maps | Store location iframe | iframe only |
| Unsplash | Hero/marketing images | `<img>` only |
| Facebook/Twitter/WhatsApp/Instagram | Share deep links | Navigation only (no embed scripts) |

No analytics, ads, or third-party JS SDKs are currently loaded.
