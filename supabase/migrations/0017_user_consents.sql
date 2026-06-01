-- 0017_user_consents.sql
-- Журнал согласий пользователя на юр. документы (ToS, ПД-согласие, оферта и т.д.).
-- Версия документа фиксируется в момент согласия - чтобы можно было поднять, на какую
-- именно редакцию пользователь соглашался при regулировании споров.

create table public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  document_slug text not null,
  document_version text not null,
  accepted_at timestamptz not null default now(),
  ip text,
  user_agent text,
  source text not null default 'sign_up' check (source in ('sign_up', 'verification', 'reaccept', 'cookie_banner'))
);

create index user_consents_user_idx on public.user_consents (user_id, accepted_at desc);
create index user_consents_doc_idx on public.user_consents (document_slug, document_version);

alter table public.user_consents enable row level security;

create policy "user_consents_owner_read"
  on public.user_consents for select
  to authenticated
  using (user_id = auth.uid());

create policy "user_consents_owner_insert"
  on public.user_consents for insert
  to authenticated
  with check (user_id = auth.uid());

-- Запрос на удаление аккаунта: помечаем профиль, грейс-период 30 дней, потом анонимизируем.
create table public.account_deletion_requests (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  requested_at timestamptz not null default now(),
  scheduled_for timestamptz not null default (now() + interval '30 days'),
  reason text,
  cancelled_at timestamptz
);

create index account_deletion_scheduled_idx on public.account_deletion_requests (scheduled_for)
  where cancelled_at is null;

alter table public.account_deletion_requests enable row level security;

create policy "account_deletion_owner_read"
  on public.account_deletion_requests for select
  to authenticated
  using (user_id = auth.uid());

create policy "account_deletion_owner_insert"
  on public.account_deletion_requests for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "account_deletion_owner_update"
  on public.account_deletion_requests for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
