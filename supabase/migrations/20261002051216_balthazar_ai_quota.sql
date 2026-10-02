create table public.balthazar_ai_requests (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 day date not null default (now() at time zone 'America/Bogota')::date,
 created_at timestamptz not null default now(),
 constraint ai_day_current check (day = (now() at time zone 'America/Bogota')::date)
);
create index balthazar_ai_requests_user_day on public.balthazar_ai_requests(user_id, day);
alter table public.balthazar_ai_requests enable row level security;
revoke all on public.balthazar_ai_requests from anon, authenticated;
grant select, insert on public.balthazar_ai_requests to authenticated;
create policy ai_requests_owner_select on public.balthazar_ai_requests for select to authenticated using (
 user_id = (select auth.uid()) and exists (select 1 from public.balthazar_allowed_emails where email=lower(auth.jwt()->>'email'))
);
create policy ai_requests_owner_insert on public.balthazar_ai_requests for insert to authenticated with check (
 user_id = (select auth.uid()) and exists (select 1 from public.balthazar_allowed_emails where email=lower(auth.jwt()->>'email'))
);
create function public.balthazar_reserve_ai() returns integer language plpgsql security invoker set search_path='' as $$
declare used integer;
begin
 if auth.uid() is null or not exists(select 1 from public.balthazar_allowed_emails where email=lower(auth.jwt()->>'email')) then raise exception 'ACCESS_DENIED'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(auth.uid()::text, 0));
 select count(*)::integer into used from public.balthazar_ai_requests where user_id=auth.uid() and day=(now() at time zone 'America/Bogota')::date;
 if used>=20 then return 0; end if;
 insert into public.balthazar_ai_requests(user_id) values(auth.uid());
 return 20-used-1+1;
end; $$;
revoke all on function public.balthazar_reserve_ai() from public, anon;
grant execute on function public.balthazar_reserve_ai() to authenticated;
