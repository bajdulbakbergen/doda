-- 0005_bids_engine.sql
-- bid_changes (audit) + submit_bid функция (атомарная подача/изменение ставки).

----------------------------------------------------------
-- bid_changes: история изменений суммы ставки
----------------------------------------------------------
create table public.bid_changes (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid not null references public.bids (id) on delete cascade,
  amount numeric(14, 2) not null,
  recorded_at timestamptz not null default now()
);

create index bid_changes_bid_idx on public.bid_changes (bid_id, recorded_at);

alter table public.bid_changes enable row level security;

create policy "bid_changes_public_read"
  on public.bid_changes for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.bids b
      join public.lots l on l.id = b.lot_id
      where b.id = bid_changes.bid_id
        and (
          (not l.is_private and l.status in ('open', 'closing', 'closed'))
          or l.owner_id = auth.uid()
          or b.bidder_id = auth.uid()
        )
    )
  );

----------------------------------------------------------
-- Триггер записи изменений
----------------------------------------------------------
create or replace function public.record_bid_amount_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (TG_OP = 'INSERT')
     or (TG_OP = 'UPDATE' and old.amount is distinct from new.amount) then
    insert into public.bid_changes (bid_id, amount) values (new.id, new.amount);
  end if;
  return new;
end;
$$;

revoke execute on function public.record_bid_amount_change()
  from public, anon, authenticated;

create trigger bids_record_changes
  after insert or update of amount on public.bids
  for each row execute function public.record_bid_amount_change();

----------------------------------------------------------
-- Realtime для bid_changes
----------------------------------------------------------
alter publication supabase_realtime add table public.bid_changes;

----------------------------------------------------------
-- Атомарная подача/изменение ставки.
-- Бизнес-правила:
--   * только верифицированные пользователи
--   * не владелец лота
--   * лот публичный, status в (open, closing), deadline > now
--   * сумма > 0, <= max_price (если задан)
--   * первая ставка <= starting_price (если задан)
--   * если есть другие активные ставки, новая ставка <= min - step,
--     где step = max(1000 ₸, 0.5% от min)
--   * макс. 3 изменения собственной ставки
--   * anti-sniping: если ставка в последние 3 минуты - deadline += 5 минут
--                   (но не короче чем сейчас + 5 минут)
----------------------------------------------------------
create or replace function public.submit_bid(p_lot_id uuid, p_amount numeric)
returns public.bids
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_bidder uuid := auth.uid();
  v_lot public.lots;
  v_existing public.bids;
  v_lowest numeric;
  v_step numeric;
  v_now timestamptz := now();
  v_new_bid public.bids;
begin
  if v_bidder is null then
    raise exception 'unauthorized' using errcode = 'P0001';
  end if;

  select * into v_lot from public.lots where id = p_lot_id for update;
  if not found then
    raise exception 'lot_not_found' using errcode = 'P0001';
  end if;

  if v_lot.status not in ('open', 'closing') then
    raise exception 'lot_not_open' using errcode = 'P0001';
  end if;

  if v_lot.deadline_at <= v_now then
    raise exception 'lot_expired' using errcode = 'P0001';
  end if;

  if v_lot.owner_id = v_bidder then
    raise exception 'owner_cannot_bid' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.profiles where id = v_bidder and is_verified
  ) then
    raise exception 'not_verified' using errcode = 'P0001';
  end if;

  if p_amount <= 0 then
    raise exception 'invalid_amount' using errcode = 'P0001';
  end if;

  if v_lot.max_price is not null and p_amount > v_lot.max_price then
    raise exception 'amount_above_max' using errcode = 'P0001';
  end if;

  -- Минимум среди других активных ставок
  select min(amount) into v_lowest
  from public.bids
  where lot_id = p_lot_id and is_active and bidder_id <> v_bidder;

  if v_lowest is not null then
    v_step := greatest(1000::numeric, v_lowest * 0.005);
    if p_amount > v_lowest - v_step then
      raise exception 'step_too_small' using errcode = 'P0001';
    end if;
  elsif v_lot.starting_price is not null and p_amount > v_lot.starting_price then
    raise exception 'amount_above_starting' using errcode = 'P0001';
  end if;

  -- Существующая активная ставка этого подрядчика
  select * into v_existing
  from public.bids
  where lot_id = p_lot_id and bidder_id = v_bidder and is_active
  for update;

  if found then
    if v_existing.change_count >= 3 then
      raise exception 'max_changes_reached' using errcode = 'P0001';
    end if;
    if p_amount = v_existing.amount then
      raise exception 'amount_unchanged' using errcode = 'P0001';
    end if;
    update public.bids
    set amount = p_amount, change_count = change_count + 1
    where id = v_existing.id
    returning * into v_new_bid;
  else
    insert into public.bids (lot_id, bidder_id, amount, change_count)
    values (p_lot_id, v_bidder, p_amount, 0)
    returning * into v_new_bid;
  end if;

  -- Anti-sniping
  if v_lot.deadline_at - v_now < interval '3 minutes' then
    update public.lots
    set deadline_at = greatest(v_lot.deadline_at, v_now) + interval '5 minutes',
        status = 'open'
    where id = p_lot_id;
  end if;

  return v_new_bid;
end;
$$;

revoke execute on function public.submit_bid(uuid, numeric) from public, anon;
grant execute on function public.submit_bid(uuid, numeric) to authenticated;
