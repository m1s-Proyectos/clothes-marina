-- Enable RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

-- Utility function: checks app_metadata.role claim from JWT
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Public read policies
drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories"
on public.categories
for select
to anon, authenticated
using (true);

drop policy if exists "Public read available products" on public.products;
create policy "Public read available products"
on public.products
for select
to anon, authenticated
using (available = true or public.is_admin());

drop policy if exists "Public read product images" on public.product_images;
create policy "Public read product images"
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_images.product_id
      and (p.available = true or public.is_admin())
  )
);

-- Admin full access
drop policy if exists "Admin write categories" on public.categories;
create policy "Admin write categories"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin write products" on public.products;
create policy "Admin write products"
on public.products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin write product_images" on public.product_images;
create policy "Admin write product_images"
on public.product_images
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
