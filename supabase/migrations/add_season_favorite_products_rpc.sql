-- Carrusel "Favoritos de la temporada": productos con calificaciones en la última semana.
-- Ejecutar en Supabase después de add_product_ratings.sql

create or replace function public.get_season_favorite_products(p_limit integer default 5)
returns table (
  product_id uuid,
  product_name text,
  main_image_url text,
  vote_count integer,
  average_rating numeric,
  category_name text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    p.id as product_id,
    p.name as product_name,
    p.main_image_url,
    count(r.id)::integer as vote_count,
    round(avg(r.rating)::numeric, 1) as average_rating,
    c.name as category_name
  from public.product_ratings r
  inner join public.products p on p.id = r.product_id
  inner join public.categories c on c.id = p.category_id
  where r.created_at >= (now() - interval '7 days')
    and r.rating >= 1
    and p.available = true
  group by p.id, p.name, p.main_image_url, c.name
  order by vote_count desc, average_rating desc, p.name asc
  limit greatest(1, least(p_limit, 10));
end;
$$;

grant execute on function public.get_season_favorite_products(integer) to anon, authenticated;
