alter table public.balthazar_ai_requests drop constraint ai_day_current;
alter policy ai_requests_owner_insert on public.balthazar_ai_requests with check (
 user_id = (select auth.uid()) and day=(now() at time zone 'America/Bogota')::date
 and exists (select 1 from public.balthazar_allowed_emails where email=lower(auth.jwt()->>'email'))
);
create or replace function public.balthazar_reserve_ai() returns integer language plpgsql security invoker set search_path='' as $$
declare used integer;
begin
 if auth.uid() is null or not exists(select 1 from public.balthazar_allowed_emails where email=lower(auth.jwt()->>'email')) then raise exception 'ACCESS_DENIED'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(auth.uid()::text, 0));
 select count(*)::integer into used from public.balthazar_ai_requests where user_id=auth.uid() and day=(now() at time zone 'America/Bogota')::date;
 if used>=20 then return 0; end if;
 insert into public.balthazar_ai_requests(user_id) values(auth.uid());
 return 20-used;
end; $$;
