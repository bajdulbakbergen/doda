-- 0021_extra_notifications.sql
-- H10: уведомления "вашу ставку перебили" + "лот закрывается через час".
-- Обновляем CHECK-констрейнт notifications_type_valid (был 6 типов, станет 8).

alter table public.notifications drop constraint if exists notifications_type_valid;
alter table public.notifications add constraint notifications_type_valid check (
  type in (
    'lot_bid_placed',
    'lot_winner_selected',
    'deal_status_changed',
    'review_received',
    'message_received',
    'lot_invite_received',
    'bid_outbid',
    'lot_closing_soon'
  )
);

----------------------------------------------------------
-- Триггер: новая ставка → уведомление прошлому лидеру (если перебили)
-- Стартует после notify_new_bid, чтобы порядок был детерминированным.
----------------------------------------------------------
create or replace function public.notify_bid_outbid()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_prev_leader uuid;
  v_prev_amount numeric;
begin
  -- Находим прошлого лидера до новой ставки.
  -- "Лидер" = bid с минимальной amount среди is_active=true и id <> new.id.
  select b.bidder_id, b.amount
    into v_prev_leader, v_prev_amount
  from public.bids b
  where b.lot_id = new.lot_id
    and b.is_active
    and b.id <> new.id
    and b.bidder_id <> new.bidder_id
  order by b.amount asc
  limit 1;

  if v_prev_leader is not null and new.amount < v_prev_amount then
    insert into public.notifications (user_id, type, payload)
    values (v_prev_leader, 'bid_outbid', jsonb_build_object(
      'lot_id', new.lot_id,
      'new_bid_id', new.id,
      'new_bidder_id', new.bidder_id,
      'new_amount', new.amount,
      'previous_amount', v_prev_amount
    ));
  end if;
  return new;
end;
$$;

revoke execute on function public.notify_bid_outbid() from public, anon, authenticated;

create trigger after_bid_insert_outbid
  after insert on public.bids
  for each row execute function public.notify_bid_outbid();

----------------------------------------------------------
-- Функция: lots, закрывающиеся в ближайший час → уведомить активных bidder-ов.
-- Дедупликация через уже существующее уведомление с тем же lot_id и user_id.
-- Вызов: pg_cron каждые 5 минут ИЛИ Vercel cron → API route → rpc('process_closing_soon').
----------------------------------------------------------
create or replace function public.process_closing_soon_notifications()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lot record;
  v_bidder record;
  v_count int := 0;
begin
  for v_lot in
    select id, owner_id, deadline_at
      from public.lots
     where status in ('open', 'closing')
       and deadline_at > now()
       and deadline_at <= now() + interval '1 hour'
  loop
    -- Уведомляем всех активных bidder-ов лота + владельца.
    for v_bidder in
      select distinct bidder_id as user_id
        from public.bids
       where lot_id = v_lot.id and is_active
      union
      select v_lot.owner_id as user_id
    loop
      -- Дедуп: уже было такое уведомление для этого user+lot?
      if not exists (
        select 1
          from public.notifications n
         where n.user_id = v_bidder.user_id
           and n.type = 'lot_closing_soon'
           and (n.payload ->> 'lot_id')::uuid = v_lot.id
      ) then
        insert into public.notifications (user_id, type, payload)
        values (v_bidder.user_id, 'lot_closing_soon', jsonb_build_object(
          'lot_id', v_lot.id,
          'deadline_at', v_lot.deadline_at
        ));
        v_count := v_count + 1;
      end if;
    end loop;
  end loop;
  return v_count;
end;
$$;

revoke execute on function public.process_closing_soon_notifications() from public, anon, authenticated;
-- Доступен только service_role (через cron / edge function).
