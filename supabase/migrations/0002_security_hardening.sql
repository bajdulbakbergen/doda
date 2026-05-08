-- 0002_security_hardening.sql
-- Чиним предупреждения Supabase advisors:
-- 1. set_updated_at: фиксируем search_path
-- 2. handle_new_user: запрещаем вызов из REST API (он нужен только как триггер)

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
