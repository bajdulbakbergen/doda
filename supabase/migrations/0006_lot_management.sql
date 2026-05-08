-- 0006_lot_management.sql
-- winner_bid_id колонка + функции close_lot и select_winner.

alter table public.lots
  add column winner_bid_id uuid references public.bids (id);

create index lots_winner_idx on public.lots (winner_bid_id);

----------------------------------------------------------
-- close_lot: владелец вручную закрывает приём ставок
----------------------------------------------------------
create or replace function public.close_lot(p_lot_id uuid)
returns public.lots
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_lot public.lots;
begin
  if v_caller is null then
    raise exception 'unauthorized' using errcode = 'P0001';
  end if;

  select * into v_lot from public.lots where id = p_lot_id for update;
  if not found then
    raise exception 'lot_not_found' using errcode = 'P0001';
  end if;

  if v_lot.owner_id <> v_caller then
    raise exception 'not_owner' using errcode = 'P0001';
  end if;

  if v_lot.status not in ('open', 'closing') then
    raise exception 'lot_not_open' using errcode = 'P0001';
  end if;

  update public.lots
  set status = 'closed'
  where id = p_lot_id
  returning * into v_lot;

  return v_lot;
end;
$$;

revoke execute on function public.close_lot(uuid) from public, anon;
grant execute on function public.close_lot(uuid) to authenticated;

----------------------------------------------------------
-- select_winner: владелец закрытого лота выбирает ставку-победителя
----------------------------------------------------------
create or replace function public.select_winner(p_lot_id uuid, p_bid_id uuid)
returns public.lots
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := auth.uid();
  v_lot public.lots;
  v_bid public.bids;
begin
  if v_caller is null then
    raise exception 'unauthorized' using errcode = 'P0001';
  end if;

  select * into v_lot from public.lots where id = p_lot_id for update;
  if not found then
    raise exception 'lot_not_found' using errcode = 'P0001';
  end if;

  if v_lot.owner_id <> v_caller then
    raise exception 'not_owner' using errcode = 'P0001';
  end if;

  if v_lot.status <> 'closed' then
    raise exception 'lot_not_closed' using errcode = 'P0001';
  end if;

  if v_lot.winner_bid_id is not null then
    raise exception 'winner_already_selected' using errcode = 'P0001';
  end if;

  select * into v_bid from public.bids where id = p_bid_id;
  if not found then
    raise exception 'bid_not_found' using errcode = 'P0001';
  end if;

  if v_bid.lot_id <> p_lot_id then
    raise exception 'bid_lot_mismatch' using errcode = 'P0001';
  end if;

  update public.lots
  set winner_bid_id = p_bid_id
  where id = p_lot_id
  returning * into v_lot;

  return v_lot;
end;
$$;

revoke execute on function public.select_winner(uuid, uuid) from public, anon;
grant execute on function public.select_winner(uuid, uuid) to authenticated;
