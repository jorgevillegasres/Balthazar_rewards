create table public.balthazar_operations (
 user_id uuid not null references auth.users(id) on delete cascade,
 id uuid not null,
 kind text not null check (kind in ('capture','day','task')),
 source text not null check (source in ('text','voice')),
 revision bigint not null check (revision>=0),
 status text not null default 'pending' check(status in ('pending','executed','failed','rejected')),
 summary text not null default '' check(char_length(summary)<=900),
 code text not null default '' check(char_length(code)<=80),
 request_hash text not null check(request_hash ~ '^[a-f0-9]{64}$'),
 proposal jsonb check(proposal is null or (jsonb_typeof(proposal)='object' and octet_length(proposal::text)<=50000)),
 created_at timestamptz not null default now(),
 primary key(user_id,id)
);
create index balthazar_operations_recent on public.balthazar_operations(user_id,created_at desc,id);
alter table public.balthazar_operations enable row level security;
revoke all on public.balthazar_operations from anon;
grant select,insert,update on public.balthazar_operations to authenticated;
create policy balthazar_operations_select on public.balthazar_operations for select to authenticated using (
 user_id=(select auth.uid()) and exists(select 1 from public.balthazar_allowed_emails where email=lower((select auth.jwt())->>'email'))
);
create policy balthazar_operations_insert on public.balthazar_operations for insert to authenticated with check (
 user_id=(select auth.uid()) and exists(select 1 from public.balthazar_allowed_emails where email=lower((select auth.jwt())->>'email'))
);
create policy balthazar_operations_update on public.balthazar_operations for update to authenticated using (
 user_id=(select auth.uid()) and exists(select 1 from public.balthazar_allowed_emails where email=lower((select auth.jwt())->>'email'))
) with check (
 user_id=(select auth.uid()) and exists(select 1 from public.balthazar_allowed_emails where email=lower((select auth.jwt())->>'email'))
);
