-- Enable useful extensions
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- 1) categories
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  image_url text not null,
  created_at timestamptz not null default now()
);

-- 2) products
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  reference_price numeric(12,2),
  main_image_url text not null,
  available boolean not null default true,
  category_id uuid not null references public.categories(id) on delete restrict,
  featured boolean not null default false,
  brand text not null default '',
  color text not null default '',
  size text not null default '',
  offer_active boolean not null default false,
  offer_quantity integer,
  offer_price numeric(12,2),
  created_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored
);

-- 3) product_images
create table if not exists public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null
);

-- Indexing strategy
create index if not exists idx_categories_created_at_desc on public.categories (created_at desc);
create index if not exists idx_products_created_at_desc on public.products (created_at desc);
create index if not exists idx_products_category_id on public.products (category_id);
create index if not exists idx_products_available on public.products (available);
create index if not exists idx_products_featured on public.products (featured);
create index if not exists idx_products_search_vector on public.products using gin (search_vector);
create index if not exists idx_products_name_trgm on public.products using gin (name gin_trgm_ops);
create index if not exists idx_product_images_product_id on public.product_images (product_id);

-- Helpful view for read-heavy catalog screens
create or replace view public.v_catalog_products as
select
  p.id,
  p.name,
  p.description,
  p.reference_price,
  p.main_image_url,
  p.available,
  p.featured,
  p.created_at,
  c.id as category_id,
  c.name as category_name,
  c.slug as category_slug
from public.products p
join public.categories c on c.id = p.category_id
order by p.created_at desc;
