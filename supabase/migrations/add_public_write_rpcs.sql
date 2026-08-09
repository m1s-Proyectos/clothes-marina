-- Server-side public write endpoints with validation, honeypot, and rate limits.
-- Replaces direct anon INSERT into contact_requests / whatsapp_leads.

create or replace function public.submit_contact_request(
  p_name text,
  p_phone text,
  p_message text,
  p_honeypot text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := trim(coalesce(p_name, ''));
  v_phone text := trim(coalesce(p_phone, ''));
  v_message text := trim(coalesce(p_message, ''));
  v_recent_phone_count integer;
  v_recent_global_count integer;
begin
  if coalesce(trim(p_honeypot), '') <> '' then
    return;
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'invalid name length';
  end if;

  if char_length(v_phone) < 7 or char_length(v_phone) > 30 then
    raise exception 'invalid phone length';
  end if;

  if v_phone !~ '^[\d+\s().-]+$' then
    raise exception 'invalid phone format';
  end if;

  if char_length(v_message) < 5 or char_length(v_message) > 2000 then
    raise exception 'invalid message length';
  end if;

  select count(*) into v_recent_phone_count
  from public.contact_requests
  where phone = v_phone
    and created_at > now() - interval '1 hour';

  if v_recent_phone_count >= 3 then
    raise exception 'rate limit exceeded';
  end if;

  select count(*) into v_recent_global_count
  from public.contact_requests
  where created_at > now() - interval '1 minute';

  if v_recent_global_count >= 20 then
    raise exception 'rate limit exceeded';
  end if;

  insert into public.contact_requests (name, phone, message)
  values (v_name, v_phone, v_message);
end;
$$;

create or replace function public.track_whatsapp_lead(
  p_product_id uuid,
  p_product_name text,
  p_honeypot text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_name text := trim(coalesce(p_product_name, ''));
  v_recent_product_count integer;
  v_recent_global_count integer;
begin
  if coalesce(trim(p_honeypot), '') <> '' then
    return;
  end if;

  if p_product_id is null then
    raise exception 'invalid product id';
  end if;

  if char_length(v_product_name) < 1 or char_length(v_product_name) > 200 then
    raise exception 'invalid product name length';
  end if;

  if not exists (
    select 1 from public.products p
    where p.id = p_product_id and p.available = true
  ) then
    raise exception 'product not available';
  end if;

  select count(*) into v_recent_product_count
  from public.whatsapp_leads
  where product_id = p_product_id
    and created_at > now() - interval '10 minutes';

  if v_recent_product_count >= 30 then
    raise exception 'rate limit exceeded';
  end if;

  select count(*) into v_recent_global_count
  from public.whatsapp_leads
  where created_at > now() - interval '1 minute';

  if v_recent_global_count >= 60 then
    raise exception 'rate limit exceeded';
  end if;

  insert into public.whatsapp_leads (product_id, product_name, source)
  values (p_product_id, v_product_name, 'product');
end;
$$;

revoke all on function public.submit_contact_request(text, text, text, text) from public;
revoke all on function public.track_whatsapp_lead(uuid, text, text) from public;

grant execute on function public.submit_contact_request(text, text, text, text) to anon, authenticated;
grant execute on function public.track_whatsapp_lead(uuid, text, text) to anon, authenticated;

drop policy if exists "Public can insert contact requests" on public.contact_requests;
drop policy if exists "Public can insert whatsapp leads" on public.whatsapp_leads;

-- Inserts are allowed only through SECURITY DEFINER RPCs above.
create policy "No direct public insert contact requests"
on public.contact_requests
for insert
to anon, authenticated
with check (false);

create policy "No direct public insert whatsapp leads"
on public.whatsapp_leads
for insert
to anon, authenticated
with check (false);
