-- Create public bucket for product images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Storage policies
drop policy if exists "Public read product images bucket" on storage.objects;
create policy "Public read product images bucket"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

drop policy if exists "Admin upload product images bucket" on storage.objects;
create policy "Admin upload product images bucket"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
);

drop policy if exists "Admin update product images bucket" on storage.objects;
create policy "Admin update product images bucket"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
)
with check (
  bucket_id = 'product-images'
  and coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
);

drop policy if exists "Admin delete product images bucket" on storage.objects;
create policy "Admin delete product images bucket"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
);
