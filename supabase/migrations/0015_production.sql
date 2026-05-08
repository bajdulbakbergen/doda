-- 0015_production.sql
-- audit_logs + premoderation + bin_blacklist + триггеры аудита и проверки.

----------------------------------------------------------
-- audit_logs: высоко-уровневый аудит ключевых действий
----------------------------------------------------------
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);
create index audit_logs_action_idx on public.audit_logs (action, created_at desc);
create index audit_logs_target_idx on public.audit_logs (target_type, target_id);

alter table public.audit_logs enable row level security;
-- НИКАКИХ policies. Доступ только через service_role.

----------------------------------------------------------
-- Триггер аудита для лотов: insert + status change
----------------------------------------------------------
create or replace function public.audit_lot_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'lot.create', 'lot', new.id,
      jsonb_build_object('title', new.title, 'is_private', new.is_private, 'category_id', new.category_id));
  elsif TG_OP = 'UPDATE' and old.status is distinct from new.status then
    insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'lot.status_change', 'lot', new.id,
      jsonb_build_object('from', old.status, 'to', new.status));
  end if;
  return new;
end;
$$;

revoke execute on function public.audit_lot_change() from public, anon, authenticated;

create trigger audit_lot_changes
  after insert or update of status on public.lots
  for each row execute function public.audit_lot_change();

----------------------------------------------------------
-- Триггер аудита для ставок
----------------------------------------------------------
create or replace function public.audit_bid_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
    values (new.bidder_id, 'bid.submit', 'bid', new.id,
      jsonb_build_object('lot_id', new.lot_id, 'amount', new.amount));
  elsif TG_OP = 'UPDATE' and old.amount is distinct from new.amount then
    insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
    values (new.bidder_id, 'bid.update', 'bid', new.id,
      jsonb_build_object('lot_id', new.lot_id, 'old_amount', old.amount, 'new_amount', new.amount));
  end if;
  return new;
end;
$$;

revoke execute on function public.audit_bid_change() from public, anon, authenticated;

create trigger audit_bid_changes
  after insert or update of amount on public.bids
  for each row execute function public.audit_bid_change();

----------------------------------------------------------
-- Триггер аудита для сделок
----------------------------------------------------------
create or replace function public.audit_deal_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'deal.create', 'deal', new.id,
      jsonb_build_object('lot_id', new.lot_id, 'amount', new.amount));
  elsif TG_OP = 'UPDATE' and old.status is distinct from new.status then
    insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'deal.status_change', 'deal', new.id,
      jsonb_build_object('from', old.status, 'to', new.status));
  end if;
  return new;
end;
$$;

revoke execute on function public.audit_deal_change() from public, anon, authenticated;

create trigger audit_deal_changes
  after insert or update of status on public.deals
  for each row execute function public.audit_deal_change();

----------------------------------------------------------
-- Триггер аудита для верификаций
----------------------------------------------------------
create or replace function public.audit_verification()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
    values (new.user_id, 'verification.submit', 'verification', new.id,
      jsonb_build_object('entity_type', new.entity_type, 'bin', new.bin));
  elsif TG_OP = 'UPDATE' and old.status is distinct from new.status then
    insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'verification.status_change', 'verification', new.id,
      jsonb_build_object('from', old.status, 'to', new.status));
  end if;
  return new;
end;
$$;

revoke execute on function public.audit_verification() from public, anon, authenticated;

create trigger audit_verification_changes
  after insert or update of status on public.verifications
  for each row execute function public.audit_verification();

----------------------------------------------------------
-- Premoderation: статус для лотов и постов
----------------------------------------------------------
create type public.moderation_status as enum (
  'pending',
  'approved',
  'rejected',
  'auto_approved'
);

alter table public.lots
  add column moderation_status public.moderation_status not null default 'auto_approved',
  add column moderation_notes text;

alter table public.posts
  add column moderation_status public.moderation_status not null default 'auto_approved',
  add column moderation_notes text;

create index lots_moderation_idx on public.lots (moderation_status) where moderation_status = 'pending';
create index posts_moderation_idx on public.posts (moderation_status) where moderation_status = 'pending';

-- Обновляем публичный read: только approved/auto_approved
drop policy if exists "lots_public_read_open" on public.lots;
create policy "lots_public_read_open"
  on public.lots for select
  to anon, authenticated
  using (
    not is_private
    and status in ('open', 'closing', 'closed')
    and moderation_status in ('approved', 'auto_approved')
  );

drop policy if exists "posts_published_read" on public.posts;
create policy "posts_published_read"
  on public.posts for select
  to anon, authenticated
  using (
    is_published
    and moderation_status in ('approved', 'auto_approved')
  );

----------------------------------------------------------
-- BIN blacklist (для антифрода)
----------------------------------------------------------
create table public.bin_blacklist (
  bin text primary key check (bin ~ '^\d{12}$'),
  reason text,
  added_by uuid references public.profiles (id) on delete set null,
  added_at timestamptz not null default now()
);

alter table public.bin_blacklist enable row level security;
-- НИКАКИХ policies. Управление только через service_role.

create or replace function public.check_verification_bin()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.bin_blacklist where bin = new.bin) then
    raise exception 'bin_blacklisted' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke execute on function public.check_verification_bin() from public, anon, authenticated;

create trigger before_verification_insert_check_bin
  before insert on public.verifications
  for each row execute function public.check_verification_bin();
