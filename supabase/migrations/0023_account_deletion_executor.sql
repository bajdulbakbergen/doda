-- 0023_account_deletion_executor.sql
-- H3: фактическое исполнение запросов на удаление аккаунта по истечении 30 дней.
-- Подход: анонимизация (а не hard delete), чтобы не потерять историческую
-- ссылочную целостность (лоты, ставки, сделки, отзывы). PII вытирается, аккаунт
-- блокируется на вход.
--
-- Вызывается ежедневно из cron-эндпоинта (Vercel cron → /api/cron/process-deletions →
-- supabase.rpc('process_account_deletions')).

-- Помечаем профиль как удалённый.
alter table public.profiles
  add column if not exists is_deleted boolean not null default false;

create index if not exists profiles_is_deleted_idx on public.profiles (is_deleted) where is_deleted;

create or replace function public.process_account_deletions()
returns table (anonymized_user_id uuid, scheduled_for timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_req record;
  v_short text;
begin
  for v_req in
    select user_id, scheduled_for
      from public.account_deletion_requests
     where cancelled_at is null
       and scheduled_for <= now()
       and not exists (
         select 1 from public.profiles p
          where p.id = account_deletion_requests.user_id and p.is_deleted
       )
  loop
    v_short := substring(replace(v_req.user_id::text, '-', ''), 1, 8);

    -- Анонимизируем профиль.
    update public.profiles
       set display_name = 'Удалённый аккаунт',
           slug         = 'deleted-' || v_short,
           bio          = null,
           city         = null,
           avatar_url   = null,
           is_verified  = false,
           is_admin     = false,
           is_deleted   = true
     where id = v_req.user_id;

    -- Блокируем вход: меняем email на anon-форму, ставим бан до 2099.
    update auth.users
       set email             = 'deleted-' || v_short || '@anon.invalid',
           email_confirmed_at = null,
           phone             = null,
           phone_confirmed_at = null,
           banned_until      = timestamptz '2099-01-01',
           encrypted_password = gen_random_uuid()::text,
           raw_user_meta_data = '{}'::jsonb
     where id = v_req.user_id;

    anonymized_user_id := v_req.user_id;
    scheduled_for := v_req.scheduled_for;
    return next;
  end loop;
  return;
end;
$$;

-- Доступ только service_role.
revoke execute on function public.process_account_deletions() from public, anon, authenticated;
