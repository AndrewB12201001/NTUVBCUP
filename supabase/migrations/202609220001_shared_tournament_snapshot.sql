begin;

create table if not exists public.admin_users (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);

create table if not exists public.tournament_snapshots (
    slug text primary key
        check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    payload jsonb not null
        check (jsonb_typeof(payload) = 'object')
        check (octet_length(payload::text) <= 8388608),
    is_published boolean not null default true,
    updated_at timestamptz not null default now(),
    updated_by uuid references auth.users(id) on delete set null
);

create or replace function public.is_ntucup_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.admin_users
        where user_id = (select auth.uid())
    );
$$;

create or replace function public.set_tournament_snapshot_audit_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    new.updated_at := now();
    new.updated_by := (select auth.uid());
    return new;
end;
$$;

drop trigger if exists set_tournament_snapshot_audit_fields
    on public.tournament_snapshots;

create trigger set_tournament_snapshot_audit_fields
before insert or update on public.tournament_snapshots
for each row execute function public.set_tournament_snapshot_audit_fields();

alter table public.admin_users enable row level security;
alter table public.tournament_snapshots enable row level security;

revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.tournament_snapshots from anon, authenticated;
revoke all on function public.is_ntucup_admin() from public;

grant select on table public.admin_users to authenticated;
grant select on table public.tournament_snapshots to anon, authenticated;
grant insert, update on table public.tournament_snapshots to authenticated;
grant execute on function public.is_ntucup_admin() to authenticated;

drop policy if exists "Administrators can see their membership" on public.admin_users;
create policy "Administrators can see their membership"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Anyone can read published tournament results" on public.tournament_snapshots;
create policy "Anyone can read published tournament results"
on public.tournament_snapshots
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Administrators can read all tournament snapshots" on public.tournament_snapshots;
create policy "Administrators can read all tournament snapshots"
on public.tournament_snapshots
for select
to authenticated
using ((select public.is_ntucup_admin()));

drop policy if exists "Administrators can create tournament snapshots" on public.tournament_snapshots;
create policy "Administrators can create tournament snapshots"
on public.tournament_snapshots
for insert
to authenticated
with check ((select public.is_ntucup_admin()));

drop policy if exists "Administrators can update tournament snapshots" on public.tournament_snapshots;
create policy "Administrators can update tournament snapshots"
on public.tournament_snapshots
for update
to authenticated
using ((select public.is_ntucup_admin()))
with check ((select public.is_ntucup_admin()));

commit;
