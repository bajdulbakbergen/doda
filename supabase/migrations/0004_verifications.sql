-- 0004_verifications.sql
-- KYC: ИП/ТОО + БИН + сканы УДЛ. Approved-статус ставит profiles.is_verified.

create type public.verification_entity_type as enum ('IP', 'TOO');
create type public.verification_status as enum ('pending', 'approved', 'rejected');

create table public.verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  entity_type public.verification_entity_type not null,
  legal_name text not null check (length(legal_name) between 2 and 200),
  bin text not null check (bin ~ '^\d{12}$'),
  document_paths text[] not null default array[]::text[],
  status public.verification_status not null default 'pending',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_notes text
);

-- Не более одной активной заявки (pending или approved) на пользователя.
-- Rejected — повторно подавать можно.
create unique index verifications_active_per_user_idx
  on public.verifications (user_id)
  where status in ('pending', 'approved');

create index verifications_status_idx on public.verifications (status);
create index verifications_user_idx on public.verifications (user_id);

----------------------------------------------------------
-- Триггер: при approved → profile.is_verified = true; при revoke → false.
----------------------------------------------------------
create or replace function public.handle_verification_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (TG_OP = 'INSERT' and new.status = 'approved')
     or (TG_OP = 'UPDATE' and new.status = 'approved' and old.status <> 'approved') then
    update public.profiles set is_verified = true where id = new.user_id;
  elsif TG_OP = 'UPDATE' and old.status = 'approved' and new.status <> 'approved' then
    update public.profiles set is_verified = false where id = new.user_id;
  end if;
  return new;
end;
$$;

revoke execute on function public.handle_verification_status_change()
  from public, anon, authenticated;

create trigger on_verification_status_change
  after insert or update of status on public.verifications
  for each row execute function public.handle_verification_status_change();

----------------------------------------------------------
-- RLS
----------------------------------------------------------
alter table public.verifications enable row level security;

create policy "verifications_owner_read"
  on public.verifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "verifications_owner_insert"
  on public.verifications for insert
  to authenticated
  with check (user_id = auth.uid());

-- update только для admin (через service role или вручную в studio).
-- Пользователь не должен менять status сам.

----------------------------------------------------------
-- Storage: PRIVATE bucket для документов
----------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('verification-docs', 'verification-docs', false, 10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']);

create policy "verification_docs_owner_read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "verification_docs_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "verification_docs_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
