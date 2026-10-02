revoke all on public.balthazar_allowed_emails from authenticated;
grant select on public.balthazar_allowed_emails to authenticated;
revoke all on public.balthazar_state from authenticated;
grant select, insert, update on public.balthazar_state to authenticated;
