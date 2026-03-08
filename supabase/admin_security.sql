-- Contact requests from public contact form
create table if not exists public.contact_requests (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  message text not null,
  status text not null default 'new',
  source text not null default 'web_contact',
  created_at timestamptz not null default now()
);

-- WhatsApp click leads from product pages
create table if not exists public.whatsapp_leads (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  source text not null default 'product',
  created_at timestamptz not null default now()
);

-- Requests from authenticated users who want admin access
create table if not exists public.admin_access_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  status text not null default 'pending',
  notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.contact_requests enable row level security;
alter table public.whatsapp_leads enable row level security;
alter table public.admin_access_requests enable row level security;

drop policy if exists "Public can insert contact requests" on public.contact_requests;
create policy "Public can insert contact requests"
on public.contact_requests
for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read contact requests" on public.contact_requests;
create policy "Admins can read contact requests"
on public.contact_requests
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update contact requests" on public.contact_requests;
create policy "Admins can update contact requests"
on public.contact_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can insert whatsapp leads" on public.whatsapp_leads;
create policy "Public can insert whatsapp leads"
on public.whatsapp_leads
for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read whatsapp leads" on public.whatsapp_leads;
create policy "Admins can read whatsapp leads"
on public.whatsapp_leads
for select
to authenticated
using (public.is_admin());

drop policy if exists "Authenticated can request admin access" on public.admin_access_requests;
create policy "Authenticated can request admin access"
on public.admin_access_requests
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can read own admin requests" on public.admin_access_requests;
create policy "Users can read own admin requests"
on public.admin_access_requests
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins can update admin requests" on public.admin_access_requests;
create policy "Admins can update admin requests"
on public.admin_access_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.review_admin_access_request(
  p_request_id uuid,
  p_approve boolean,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admins can review admin access requests';
  end if;

  select user_id into v_user_id
  from public.admin_access_requests
  where id = p_request_id;

  if v_user_id is null then
    raise exception 'Admin access request not found';
  end if;

  update public.admin_access_requests
  set
    status = case when p_approve then 'approved' else 'denied' end,
    notes = p_notes,
    reviewed_by = auth.uid(),
    reviewed_at = now()
  where id = p_request_id;

  if p_approve then
    update auth.users
    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
    where id = v_user_id;
  end if;
end;
$$;

grant execute on function public.review_admin_access_request(uuid, boolean, text) to authenticated;
