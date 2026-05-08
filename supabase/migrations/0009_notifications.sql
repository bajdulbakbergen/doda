-- 0009_notifications.sql
-- In-app уведомления через DB-триггеры. Email/Telegram — отдельной интеграцией позже.

create type public.notification_type as enum (
  'lot_bid_placed',
  'lot_winner_selected',
  'deal_status_changed',
  'review_received'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_unread_idx
  on public.notifications (user_id, created_at desc)
  where read_at is null;
create index notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_owner_read"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifications_owner_update"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter publication supabase_realtime add table public.notifications;

----------------------------------------------------------
-- Триггер: новая ставка → уведомление владельцу лота
----------------------------------------------------------
create or replace function public.notify_new_bid()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_owner uuid;
begin
  select owner_id into v_owner from public.lots where id = new.lot_id;
  if v_owner is not null and v_owner <> new.bidder_id then
    insert into public.notifications (user_id, type, payload)
    values (v_owner, 'lot_bid_placed', jsonb_build_object(
      'lot_id', new.lot_id,
      'bid_id', new.id,
      'bidder_id', new.bidder_id,
      'amount', new.amount
    ));
  end if;
  return new;
end;
$$;

revoke execute on function public.notify_new_bid() from public, anon, authenticated;

create trigger after_bid_insert_notify
  after insert on public.bids
  for each row execute function public.notify_new_bid();

----------------------------------------------------------
-- Триггер: выбран победитель (lots.winner_bid_id поставлен) → уведомление победителю
----------------------------------------------------------
create or replace function public.notify_winner_selected()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_winner_user uuid;
begin
  if new.winner_bid_id is not null
     and (old.winner_bid_id is null or old.winner_bid_id <> new.winner_bid_id) then
    select bidder_id into v_winner_user from public.bids where id = new.winner_bid_id;
    if v_winner_user is not null then
      insert into public.notifications (user_id, type, payload)
      values (v_winner_user, 'lot_winner_selected', jsonb_build_object(
        'lot_id', new.id,
        'bid_id', new.winner_bid_id
      ));
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.notify_winner_selected() from public, anon, authenticated;

create trigger after_lot_winner_select
  after update of winner_bid_id on public.lots
  for each row execute function public.notify_winner_selected();

----------------------------------------------------------
-- Триггер: deal status изменился → уведомление другой стороне
----------------------------------------------------------
create or replace function public.notify_deal_status_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_actor uuid := auth.uid(); v_other uuid;
begin
  if old.status is distinct from new.status then
    if v_actor = new.customer_id then
      v_other := new.contractor_id;
    elsif v_actor = new.contractor_id then
      v_other := new.customer_id;
    else
      v_other := null;
    end if;

    if v_other is not null then
      insert into public.notifications (user_id, type, payload)
      values (v_other, 'deal_status_changed', jsonb_build_object(
        'deal_id', new.id,
        'lot_id', new.lot_id,
        'old_status', old.status,
        'new_status', new.status
      ));
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.notify_deal_status_change() from public, anon, authenticated;

create trigger after_deal_status_change
  after update of status on public.deals
  for each row execute function public.notify_deal_status_change();

----------------------------------------------------------
-- Триггер: новый отзыв → уведомление получателю
----------------------------------------------------------
create or replace function public.notify_review_received()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications (user_id, type, payload)
  values (new.reviewee_id, 'review_received', jsonb_build_object(
    'review_id', new.id,
    'deal_id', new.deal_id,
    'reviewer_id', new.reviewer_id,
    'rating', new.rating
  ));
  return new;
end;
$$;

revoke execute on function public.notify_review_received() from public, anon, authenticated;

create trigger after_review_insert_notify
  after insert on public.reviews
  for each row execute function public.notify_review_received();

----------------------------------------------------------
-- mark_notifications_read: либо все, либо по списку id
----------------------------------------------------------
create or replace function public.mark_notifications_read(p_ids uuid[] default null)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare v_count int;
begin
  if auth.uid() is null then raise exception 'unauthorized' using errcode = 'P0001'; end if;

  if p_ids is null then
    update public.notifications
    set read_at = now()
    where user_id = auth.uid() and read_at is null;
  else
    update public.notifications
    set read_at = now()
    where user_id = auth.uid() and id = any(p_ids) and read_at is null;
  end if;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.mark_notifications_read(uuid[]) from public, anon;
grant execute on function public.mark_notifications_read(uuid[]) to authenticated;
