-- 0018_admin_access.sql
-- Админ-флаг в profiles + helper-функция + admin RLS для доступа к доказательной базе:
--   user_consents (журнал согласий)
--   audit_logs (журнал действий)
--   verifications (заявки на верификацию)
--   account_deletion_requests (заявки на удаление)
-- Назначение админа: руками через SQL
--   update public.profiles set is_admin = true where slug = 'customer-handle';

alter table public.profiles add column if not exists is_admin boolean not null default false;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

revoke execute on function public.current_user_is_admin() from public, anon;
grant execute on function public.current_user_is_admin() to authenticated;

-- Админ читает все согласия любых пользователей
create policy "user_consents_admin_read"
  on public.user_consents for select
  to authenticated
  using (public.current_user_is_admin());

-- Админ читает все аудит-логи
create policy "audit_logs_admin_read"
  on public.audit_logs for select
  to authenticated
  using (public.current_user_is_admin());

-- Админ читает все верификации
create policy "verifications_admin_read"
  on public.verifications for select
  to authenticated
  using (public.current_user_is_admin());

-- Админ обновляет статус верификации (approve/reject)
create policy "verifications_admin_update"
  on public.verifications for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

-- Админ читает все заявки на удаление аккаунта
create policy "account_deletion_admin_read"
  on public.account_deletion_requests for select
  to authenticated
  using (public.current_user_is_admin());

-- Админ читает blacklist
create policy "bin_blacklist_admin_read"
  on public.bin_blacklist for select
  to authenticated
  using (public.current_user_is_admin());

create policy "bin_blacklist_admin_insert"
  on public.bin_blacklist for insert
  to authenticated
  with check (public.current_user_is_admin());

create policy "bin_blacklist_admin_delete"
  on public.bin_blacklist for delete
  to authenticated
  using (public.current_user_is_admin());
