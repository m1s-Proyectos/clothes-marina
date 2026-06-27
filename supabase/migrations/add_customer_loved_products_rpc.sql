-- Carrusel "Lo que más aman nuestros clientes": productos con más clics en Solicitar producto (WhatsApp).
-- Ejecutar en Supabase (requiere tabla whatsapp_leads de admin_security.sql).

create or replace function public.get_customer_loved_products(p_limit integer default 5)
returns table (
  product_id uuid,
  product_name text,
  main_image_url text,
  request_count integer,
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
    count(w.id)::integer as request_count,
    c.name as category_name
  from public.whatsapp_leads w
  inner join public.products p on p.id = w.product_id
  inner join public.categories c on c.id = p.category_id
  where w.product_id is not null
    and w.source = 'product'
    and p.available = true
  group by p.id, p.name, p.main_image_url, c.name
  order by request_count desc, p.name asc
  limit greatest(1, least(p_limit, 10));
end;
$$;

grant execute on function public.get_customer_loved_products(integer) to anon, authenticated;
