# Clothes Marina

Production-ready online clothing catalog built for physical-store sales via WhatsApp and social sharing.

## 1) Folder Structure

```txt
clothes-marina/
  supabase/
    schema.sql
    rls.sql
    storage.sql
    functions/
      contact/
        index.ts
  src/
    components/
      admin/
      auth/
      catalog/
      common/
      layout/
    config/
      env.ts
    contexts/
      AuthContext.tsx
    hooks/
      useDebounce.ts
      useSeo.ts
    lib/
      http.ts
      supabase.ts
    pages/
      admin/
      AboutPage.tsx
      CatalogPage.tsx
      CollectionsPage.tsx
      ContactPage.tsx
      HomePage.tsx
      ProductDetailPage.tsx
    services/
      authService.ts
      categoryService.ts
      contactService.ts
      productService.ts
      storageService.ts
    styles/
      index.css
    types/
      index.ts
    utils/
      format.ts
      share.ts
    App.tsx
    main.tsx
  .env.example
  index.html
  package.json
  postcss.config.js
  tailwind.config.ts
  tsconfig.json
  vite.config.ts
```

## 2) Supabase SQL Schema

Run `supabase/schema.sql` in SQL editor:

- `categories` table
- `products` table
- `product_images` table
- FK constraints + indexes
- Full-text search (`search_vector`) + trigram index
- Default order-friendly indexes by `created_at desc`

## 3) RLS Policies

Run `supabase/rls.sql`:

- Public read:
  - categories: open read
  - products: only `available = true`
  - product images: only for available products
- Admin write:
  - full CRUD on categories/products/product_images via JWT role claim
- Includes function `public.is_admin()`

### Admin role claim

Set admin users with an app metadata role:

```sql
-- example with service role context
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'admin@clothesmarina.com';
```

## 4) Storage Bucket Setup

Run `supabase/storage.sql`:

- Bucket: `product-images` (public)
- MIME restrictions (jpeg/png/webp)
- Public read policy
- Admin insert/update/delete policies

## 5) React Folder Structure

- `pages/` route-level UI
- `components/` reusable UI blocks
- `services/` Supabase access abstraction
- `contexts/` auth state and role
- `hooks/` debounce + SEO utilities
- `lib/` clients (`axios`, `supabase`)
- `types/` shared domain models

## 6) Example Components

- Hero + featured products: `src/pages/HomePage.tsx`
- Product card with share + WhatsApp: `src/components/catalog/ProductCard.tsx`
- Floating WhatsApp CTA: `src/components/common/FloatingWhatsAppButton.tsx`
- Admin protected route: `src/components/auth/ProtectedRoute.tsx`

## 7) Example Supabase Service File

- Product queries and CRUD: `src/services/productService.ts`
- Category CRUD: `src/services/categoryService.ts`
- Storage upload: `src/services/storageService.ts`

Service layer keeps UI decoupled from query logic and supports future caching/analytics wrappers.

## 8) Example Filtering Implementation

`src/pages/CatalogPage.tsx` + `src/components/catalog/CatalogFilters.tsx`:

- Real-time search with debounce (`useDebounce`)
- Category filter including `offers`
- Sort options:
  - newest
  - featured
  - alphabetical
  - availability

## 9) Authentication Implementation

- Supabase Auth email/password login: `src/services/authService.ts`
- Session + role state: `src/contexts/AuthContext.tsx`
- Admin route guard: `src/components/auth/ProtectedRoute.tsx`
- Admin pages:
  - `/admin`
  - `/admin/categories`
  - `/admin/products`

## 10) Deployment Instructions

### Local development

1. Install Node.js 20+
2. Install dependencies:
   - `npm install`
3. Create env file:
   - `cp .env.example .env`
4. Fill required env vars:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_WHATSAPP_PHONE`
   - `VITE_APP_URL`
5. Run app:
   - `npm run dev`

### Supabase deployment

1. Create Supabase project.
2. Run SQL scripts in this order:
   1. `supabase/schema.sql`
   2. `supabase/rls.sql`
   3. `supabase/storage.sql`
   4. `supabase/admin_security.sql`
   5. Remaining files in `supabase/migrations/` (including `add_system_heartbeat.sql`)
3. Create admin user via Auth UI.
4. Assign app metadata role `admin`.
5. (Optional) Deploy Edge Function:
   - `supabase functions deploy contact`

### Frontend deployment (Vercel or Netlify)

1. Import repository.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variables from `.env`.
5. Deploy.

### Production hardening checklist

- Configure custom domain and HTTPS
- Add analytics and error monitoring
- Set image CDN/cache headers
- Add backup/restore strategy for Postgres
- Restrict admin emails and enforce MFA

## 11) Security hardening for Vercel + Supabase

### Vercel

- Keep `vercel.json` headers enabled (CSP, HSTS, X-Frame-Options, nosniff, Permissions-Policy).
- Use only HTTPS URLs for all assets and callbacks.
- Add all production domains in Vercel and force HTTPS.
- Do not expose any service role key in Vercel env vars (frontend must only use anon key).

### Supabase Auth

- In Auth settings, set:
  - Site URL: your production domain
  - Redirect URLs: exact allowed URLs (prod + localhost dev)
- Disable unused providers.
- Enable bot protection/CAPTCHA and rate limits.
- Enforce MFA for admin users.
- Disable public signups if your flow does not require customer accounts.

### Supabase Database & Storage

- Keep RLS enabled on all public tables.
- Verify all write policies require `public.is_admin()`.
- Ensure bucket write policies are admin-only.
- Rotate keys if leaked and review API logs periodically.

### Operational security

- Store env vars only in Vercel project settings, never in repository.
- Use strong passwords and 2FA on Vercel, GitHub, and Supabase accounts.
- Run periodic dependency updates and `npm audit` checks.
- Set up monitoring/alerts for auth failures and suspicious admin activity.

## 12) Supabase Free keep-alive (technical heartbeat)

This is **not** a sale, order, WhatsApp lead, contact request, or product rating. It only updates `public.system_heartbeats` (single row `id = 1`) through `record_system_heartbeat`.

### Apply the SQL

Run `supabase/migrations/add_system_heartbeat.sql` in the Supabase SQL Editor.

### GitHub secrets (repo → Settings → Secrets and variables → Actions)

| Secret | Value | Do not use |
|---|---|---|
| `SUPABASE_URL` | Project URL (`https://<ref>.supabase.co`) | — |
| `SUPABASE_ANON_KEY` | Same **anon** / **publishable** key as `VITE_SUPABASE_ANON_KEY` | `service_role` / secret key |

### Run the workflow manually

1. GitHub → **Actions** → **Supabase keep-alive** → **Run workflow**.
2. Confirm the job is green (HTTP 2xx). A non-2xx response fails the job.

The schedule also runs once every 24 hours (`0 12 * * *` UTC).

### Verify in SQL Editor

```sql
select id, source, last_ping_at, ping_count, note
from public.system_heartbeats
where id = 1;
```

After a successful run: `source` is `github_actions`, `last_ping_at` is recent, and `ping_count` increased by 1.
