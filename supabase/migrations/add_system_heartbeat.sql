-- Technical keep-alive for Supabase Free inactivity pausing.
-- Isolated from catalog, leads, ratings, and contact data.
-- Apply in the SQL Editor after the existing schema/migrations.

create table if not exists public.system_heartbeats (
  id smallint primary key,
  source text not null,
  last_ping_at timestamptz not null default now(),
  ping_count bigint not null default 0,
  note text,
  constraint system_heartbeats_single_row check (id = 1),
  constraint system_heartbeats_source_check
    check (source in ('bootstrap', 'github_actions', 'manual')),
  constraint system_heartbeats_source_length_check
    check (char_length(source) between 1 and 40),
  constraint system_heartbeats_ping_count_check
    check (ping_count >= 0),
  constraint system_heartbeats_note_length_check
    check (note is null or char_length(note) <= 200)
);

comment on table public.system_heartbeats is
  'Technical keep-alive only. Not a sale, order, lead, rating, or contact request.';

comment on column public.system_heartbeats.source is
  'Allowed values: bootstrap, github_actions, manual.';

insert into public.system_heartbeats (id, source, last_ping_at, ping_count, note)
values (1, 'bootstrap', now(), 0, 'single-row technical keep-alive')
on conflict (id) do nothing;

create or replace function public.enforce_system_heartbeat_row()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'system_heartbeats row cannot be deleted';
  end if;

  new.id := 1;

  if tg_op = 'UPDATE' then
    if new.ping_count <> old.ping_count + 1 then
      new.ping_count := old.ping_count + 1;
    end if;
    new.last_ping_at := now();
    new.note := old.note;
  else
    new.ping_count := 0;
    new.last_ping_at := now();
  end if;

  if new.source not in ('bootstrap', 'github_actions', 'manual') then
    raise exception 'invalid heartbeat source';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_system_heartbeat_row on public.system_heartbeats;
create trigger trg_enforce_system_heartbeat_row
before insert or update or delete on public.system_heartbeats
for each row
execute function public.enforce_system_heartbeat_row();

alter table public.system_heartbeats enable row level security;

revoke all on table public.system_heartbeats from public, anon, authenticated;

grant select on table public.system_heartbeats to authenticated;

drop policy if exists "No public read system heartbeats" on public.system_heartbeats;
drop policy if exists "No public write system heartbeats" on public.system_heartbeats;
drop policy if exists "Admins can read system heartbeats" on public.system_heartbeats;

create policy "No public read system heartbeats"
on public.system_heartbeats
for select
to anon
using (false);

create policy "Admins can read system heartbeats"
on public.system_heartbeats
for select
to authenticated
using (public.is_admin());

create policy "No public write system heartbeats"
on public.system_heartbeats
for all
to anon, authenticated
using (false)
with check (false);

create or replace function public.record_system_heartbeat(p_source text default 'github_actions')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source text := trim(coalesce(p_source, ''));
begin
  if v_source not in ('github_actions', 'manual') then
    raise exception 'invalid heartbeat source';
  end if;

  update public.system_heartbeats
  set
    source = v_source,
    last_ping_at = now(),
    ping_count = ping_count + 1
  where id = 1;

  if not found then
    raise exception 'system heartbeat row missing';
  end if;
end;
$$;

comment on function public.record_system_heartbeat(text) is
  'Technical keep-alive ping. Updates only public.system_heartbeats id=1.';

revoke all on function public.record_system_heartbeat(text) from public;
grant execute on function public.record_system_heartbeat(text) to anon, authenticated;
