alter table public.balthazar_operations drop constraint balthazar_operations_status_check;
alter table public.balthazar_operations add constraint balthazar_operations_status_check check(status in ('pending','executed','failed','rejected','undone'));
