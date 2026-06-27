-- Product ratings: individual votes (scalable toward full review system).
-- Run after schema.sql and rls.sql.

create table if not exists public.product_ratings (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  session_id text not null,
  ip_hash text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_ratings_unique_session unique (product_id, session_id)
);

-- Future: one rating per authenticated user when user_id is set.
create unique index if not exists product_ratings_unique_user
  on public.product_ratings (product_id, user_id)
  where user_id is not null;

create index if not exists idx_product_ratings_product_id
  on public.product_ratings (product_id);

create index if not exists idx_product_ratings_created_at
  on public.product_ratings (created_at desc);

comment on table public.product_ratings is
  'Individual product star ratings. Extend later with product_reviews (text, photos, verified purchase).';

-- Aggregated stats per product (computed, not stored on products).
create or replace view public.v_product_rating_stats as
select
  product_id,
  count(*)::integer as vote_count,
  round(avg(rating)::numeric, 1) as average_rating,
  count(*) filter (where rating = 1)::integer as rating_1,
  count(*) filter (where rating = 2)::integer as rating_2,
  count(*) filter (where rating = 3)::integer as rating_3,
  count(*) filter (where rating = 4)::integer as rating_4,
  count(*) filter (where rating = 5)::integer as rating_5
from public.product_ratings
group by product_id;

grant select on public.v_product_rating_stats to anon, authenticated;

alter table public.product_ratings enable row level security;

-- Admins can read raw ratings (future moderation / analytics).
drop policy if exists "Admins read product ratings" on public.product_ratings;
create policy "Admins read product ratings"
on public.product_ratings
for select
to authenticated
using (public.is_admin());

-- Public writes go through SECURITY DEFINER RPC (session deduplication).

create or replace function public.get_product_rating_summary(
  p_product_id uuid,
  p_session_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stats jsonb;
  v_your_rating smallint;
begin
  select jsonb_build_object(
    'product_id', s.product_id,
    'vote_count', s.vote_count,
    'average_rating', s.average_rating,
    'rating_1', s.rating_1,
    'rating_2', s.rating_2,
    'rating_3', s.rating_3,
    'rating_4', s.rating_4,
    'rating_5', s.rating_5
  )
  into v_stats
  from public.v_product_rating_stats s
  where s.product_id = p_product_id;

  if v_stats is null then
    v_stats := jsonb_build_object(
      'product_id', p_product_id,
      'vote_count', 0,
      'average_rating', null,
      'rating_1', 0,
      'rating_2', 0,
      'rating_3', 0,
      'rating_4', 0,
      'rating_5', 0
    );
  end if;

  if p_session_id is not null and length(trim(p_session_id)) >= 16 then
    select r.rating
    into v_your_rating
    from public.product_ratings r
    where r.product_id = p_product_id
      and r.session_id = trim(p_session_id);
  end if;

  return v_stats || jsonb_build_object('your_rating', v_your_rating);
end;
$$;

create or replace function public.submit_product_rating(
  p_product_id uuid,
  p_rating smallint,
  p_session_id text,
  p_ip_hash text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if p_rating < 1 or p_rating > 5 then
    raise exception 'rating must be between 1 and 5';
  end if;

  if p_session_id is null or length(trim(p_session_id)) < 16 then
    raise exception 'invalid session_id';
  end if;

  if not exists (
    select 1 from public.products p
    where p.id = p_product_id and p.available = true
  ) then
    raise exception 'product not available';
  end if;

  insert into public.product_ratings (product_id, rating, session_id, ip_hash, user_id)
  values (p_product_id, p_rating, trim(p_session_id), p_ip_hash, v_user_id)
  on conflict (product_id, session_id)
  do update set
    rating = excluded.rating,
    updated_at = now(),
    user_id = coalesce(excluded.user_id, public.product_ratings.user_id),
    ip_hash = coalesce(excluded.ip_hash, public.product_ratings.ip_hash);

  return public.get_product_rating_summary(p_product_id, p_session_id);
end;
$$;

grant execute on function public.get_product_rating_summary(uuid, text) to anon, authenticated;
grant execute on function public.submit_product_rating(uuid, smallint, text, text) to anon, authenticated;

-- Admin analytics (panel administrativo futuro).
create or replace function public.get_product_rating_admin_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  select jsonb_build_object(
    'total_ratings', count(*)::integer,
    'global_average', round(avg(rating)::numeric, 2),
    'rating_1', count(*) filter (where rating = 1)::integer,
    'rating_2', count(*) filter (where rating = 2)::integer,
    'rating_3', count(*) filter (where rating = 3)::integer,
    'rating_4', count(*) filter (where rating = 4)::integer,
    'rating_5', count(*) filter (where rating = 5)::integer
  )
  into v_result
  from public.product_ratings;

  return coalesce(
    v_result,
    jsonb_build_object(
      'total_ratings', 0,
      'global_average', null,
      'rating_1', 0,
      'rating_2', 0,
      'rating_3', 0,
      'rating_4', 0,
      'rating_5', 0
    )
  );
end;
$$;

grant execute on function public.get_product_rating_admin_overview() to authenticated;

create or replace function public.get_top_rated_products(p_limit integer default 10)
returns table (
  product_id uuid,
  product_name text,
  vote_count integer,
  average_rating numeric,
  rating_1 integer,
  rating_2 integer,
  rating_3 integer,
  rating_4 integer,
  rating_5 integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  return query
  select
    s.product_id,
    p.name as product_name,
    s.vote_count,
    s.average_rating,
    s.rating_1,
    s.rating_2,
    s.rating_3,
    s.rating_4,
    s.rating_5
  from public.v_product_rating_stats s
  join public.products p on p.id = s.product_id
  where s.vote_count > 0
  order by s.average_rating desc, s.vote_count desc
  limit greatest(1, least(p_limit, 50));
end;
$$;

grant execute on function public.get_top_rated_products(integer) to authenticated;

create or replace function public.get_lowest_rated_products(p_limit integer default 10)
returns table (
  product_id uuid,
  product_name text,
  vote_count integer,
  average_rating numeric,
  rating_1 integer,
  rating_2 integer,
  rating_3 integer,
  rating_4 integer,
  rating_5 integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  return query
  select
    s.product_id,
    p.name as product_name,
    s.vote_count,
    s.average_rating,
    s.rating_1,
    s.rating_2,
    s.rating_3,
    s.rating_4,
    s.rating_5
  from public.v_product_rating_stats s
  join public.products p on p.id = s.product_id
  where s.vote_count > 0
  order by s.average_rating asc, s.vote_count desc
  limit greatest(1, least(p_limit, 50));
end;
$$;

grant execute on function public.get_lowest_rated_products(integer) to authenticated;
