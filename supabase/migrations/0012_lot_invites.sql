-- 0012_lot_invites.sql
-- Приглашения на закрытые лоты + расширение submit_bid.

create table public.lot_invites (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots (id) on delete cascade,
  inviter_id uuid not null references public.profiles (id) on delete restrict,
  invitee_id uuid not null references public.profiles (id) on delete restrict,
  accepted_at timestamptz,
  declined_at timestamptz,
  created_at timestamptz not null default now(),
  constraint lot_invites_distinct_parties check (inviter_id <> invitee_id)
);

create unique index lot_invites_lot_invitee_idx on public.lot_invites (lot_id, invitee_id);
create index lot_invites_invitee_idx on public.lot_invites (invitee_id, created_at desc);

alter table public.lot_invites enable row level security;

create policy "lot_invites_participants_read"
  on public.lot_invites for select
  to authenticated
  using (inviter_id = auth.uid() or invitee_id = auth.uid());

create policy "lot_invites_inviter_insert"
  on public.lot_invites for insert
  to authenticated
  with check (
    inviter_id = auth.uid()
    and exists (
      select 1 from public.lots
      where id = lot_id and owner_id = auth.uid() and is_private
    )
  );

create policy "lot_invites_invitee_update"
  on public.lot_invites for update
  to authenticated
  using (invitee_id = auth.uid())
  with check (invitee_id = auth.uid());

----------------------------------------------------------
-- Расширяем lots RLS: invitee может видеть приватный лот после accept.
----------------------------------------------------------
create policy "lots_invitee_read_private"
  on public.lots for select
  to authenticated
  using (
    is_private and exists (
      select 1 from public.lot_invites
      where lot_id = lots.id and invitee_id = auth.uid() and accepted_at is not null
    )
  );

----------------------------------------------------------
-- Обновлённый submit_bid: для приватного лота требует подтверждённое приглашение.
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
  if v_bidder is null then raise exception 'unauthorized' using errcode = 'P0001'; end if;

  select * into v_lot from public.lots where id = p_lot_id for update;
  if not found then raise exception 'lot_not_found' using errcode = 'P0001'; end if;
  if v_lot.status not in ('open', 'closing') then raise exception 'lot_not_open' using errcode = 'P0001'; end if;
  if v_lot.deadline_at <= v_now then raise exception 'lot_expired' using errcode = 'P0001'; end if;
  if v_lot.owner_id = v_bidder then raise exception 'owner_cannot_bid' using errcode = 'P0001'; end if;

  if v_lot.is_private and not exists (
    select 1 from public.lot_invites
    where lot_id = p_lot_id and invitee_id = v_bidder and accepted_at is not null
  ) then
    raise exception 'lot_private_not_invited' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.profiles where id = v_bidder and is_verified
  ) then
    raise exception 'not_verified' using errcode = 'P0001';
  end if;

  if p_amount <= 0 then raise exception 'invalid_amount' using errcode = 'P0001'; end if;
  if v_lot.max_price is not null and p_amount > v_lot.max_price then
    raise exception 'amount_above_max' using errcode = 'P0001';
  end if;

  select min(amount) into v_lowest
  from public.bids
  where lot_id = p_lot_id and is_active and bidder_id <> v_bidder;

  if v_lowest is not null then
    v_step := greatest(1000::numeric, v_lowest * 0.005);
    if p_amount > v_lowest - v_step then raise exception 'step_too_small' using errcode = 'P0001'; end if;
  elsif v_lot.starting_price is not null and p_amount > v_lot.starting_price then
    raise exception 'amount_above_starting' using errcode = 'P0001';
  end if;

  select * into v_existing
  from public.bids
  where lot_id = p_lot_id and bidder_id = v_bidder and is_active
  for update;

  if found then
    if v_existing.change_count >= 3 then raise exception 'max_changes_reached' using errcode = 'P0001'; end if;
    if p_amount = v_existing.amount then raise exception 'amount_unchanged' using errcode = 'P0001'; end if;
    update public.bids set amount = p_amount, change_count = change_count + 1
    where id = v_existing.id returning * into v_new_bid;
  else
    insert into public.bids (lot_id, bidder_id, amount, change_count)
    values (p_lot_id, v_bidder, p_amount, 0) returning * into v_new_bid;
  end if;

  if v_lot.deadline_at - v_now < interval '3 minutes' then
    update public.lots
    set deadline_at = greatest(v_lot.deadline_at, v_now) + interval '5 minutes',
        status = 'open'
    where id = p_lot_id;
  end if;

  return v_new_bid;
end;
$$;
