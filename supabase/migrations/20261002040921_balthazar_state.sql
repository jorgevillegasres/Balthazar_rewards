create table public.balthazar_allowed_emails (
  email text primary key check (email = lower(email))
);
alter table public.balthazar_allowed_emails enable row level security;
grant select on public.balthazar_allowed_emails to authenticated;
revoke all on public.balthazar_allowed_emails from anon;
create policy "Read own membership" on public.balthazar_allowed_emails for select to authenticated
using (email = lower((select auth.jwt())->>'email'));

create table public.balthazar_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision integer not null default 0 check (revision >= 0),
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.balthazar_state enable row level security;
grant select, insert, update on public.balthazar_state to authenticated;
revoke all on public.balthazar_state from anon;
create policy "Read own Balthazar" on public.balthazar_state for select to authenticated
using ((select auth.uid()) = user_id and exists(select 1 from public.balthazar_allowed_emails where email=lower((select auth.jwt())->>'email')));
create policy "Create own Balthazar" on public.balthazar_state for insert to authenticated
with check ((select auth.uid()) = user_id and exists(select 1 from public.balthazar_allowed_emails where email=lower((select auth.jwt())->>'email')));
create policy "Update own Balthazar" on public.balthazar_state for update to authenticated
using ((select auth.uid()) = user_id and exists(select 1 from public.balthazar_allowed_emails where email=lower((select auth.jwt())->>'email')))
with check ((select auth.uid()) = user_id and exists(select 1 from public.balthazar_allowed_emails where email=lower((select auth.jwt())->>'email')));

-- Owner membership is provisioned separately. Never commit user account data.
