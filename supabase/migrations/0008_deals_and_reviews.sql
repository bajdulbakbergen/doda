-- 0008_deals_and_reviews.sql
-- Deal сущность (создаётся атомарно при select_winner) + Review.

create type public.deal_status as enum (
  'proposed', 'contracted', 'paid', 'delivered', 'closed', 'cancelled'
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots (id) on delete restrict,
  winner_bid_id uuid not null references public.bids (id) on delete restrict,
  customer_id uuid not null references public.profiles (id) on delete restrict,
  contractor_id uuid not null references public.profiles (id) on delete restrict,
  amount numeric(14, 2) not null,
  currency text not null default 'KZT',
  status public.deal_status not null default 'proposed',
  cancelled_by uuid references public.profiles (id),
  cancelled_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  constraint deals_parties_distinct check (customer_id <> contractor_id)
);

create unique index deals_lot_idx on public.deals (lot_id);
create index deals_customer_idx on public.deals (customer_id, created_at desc);
create index deals_contractor_idx on public.deals (contractor_id, created_at desc);
create index deals_status_idx on public.deals (status);

create trigger deals_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

alter table public.deals enable row level security;

create policy "deals_participants_read"
  on public.deals for select
  to authenticated
  using (customer_id = auth.uid() or contractor_id = auth.uid());

-- Закрытые сделки видны публично если лот не приватный (для отображения «победил/проиграл»).
create policy "deals_public_read_closed"
  on public.deals for select
  to anon, authenticated
  using (
    status = 'closed'
    and exists (
      select 1 from public.lots l
      where l.id = deals.lot_id and not l.is_private
    )
  );

----------------------------------------------------------
-- advance_deal_status: линейное продвижение
-- proposed → contracted → paid → delivered → closed
-- любой из участников может продвинуть статус.
----------------------------------------------------------
create or replace function public.advance_deal_status(p_deal_id uuid, p_new_status deal_status)
returns public.deals
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_deal public.deals;
begin
  if v_actor is null then raise exception 'unauthorized' using errcode = 'P0001'; end if;

  select * into v_deal from public.deals where id = p_deal_id for update;
  if not found then raise exception 'deal_not_found' using errcode = 'P0001'; end if;
  if v_actor not in (v_deal.customer_id, v_deal.contractor_id) then
    raise exception 'not_a_participant' using errcode = 'P0001';
  end if;

  if not (
    (v_deal.status = 'proposed' and p_new_status = 'contracted')
    or (v_deal.status = 'contracted' and p_new_status = 'paid')
    or (v_deal.status = 'paid' and p_new_status = 'delivered')
    or (v_deal.status = 'delivered' and p_new_status = 'closed')
  ) then
    raise exception 'invalid_transition' using errcode = 'P0001';
  end if;

  update public.deals
  set status = p_new_status,
      closed_at = case when p_new_status = 'closed' then now() else closed_at end
  where id = p_deal_id
  returning * into v_deal;

  return v_deal;
end;
$$;

revoke execute on function public.advance_deal_status(uuid, public.deal_status) from public, anon;
grant execute on function public.advance_deal_status(uuid, public.deal_status) to authenticated;

----------------------------------------------------------
-- cancel_deal: любой из участников до closed
----------------------------------------------------------
create or replace function public.cancel_deal(p_deal_id uuid, p_reason text)
returns public.deals
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_deal public.deals;
begin
  if v_actor is null then raise exception 'unauthorized' using errcode = 'P0001'; end if;

  select * into v_deal from public.deals where id = p_deal_id for update;
  if not found then raise exception 'deal_not_found' using errcode = 'P0001'; end if;
  if v_actor not in (v_deal.customer_id, v_deal.contractor_id) then
    raise exception 'not_a_participant' using errcode = 'P0001';
  end if;
  if v_deal.status in ('closed', 'cancelled') then
    raise exception 'deal_already_finalized' using errcode = 'P0001';
  end if;

  update public.deals
  set status = 'cancelled',
      cancelled_by = v_actor,
      cancelled_reason = nullif(trim(p_reason), '')
  where id = p_deal_id
  returning * into v_deal;

  return v_deal;
end;
$$;

revoke execute on function public.cancel_deal(uuid, text) from public, anon;
grant execute on function public.cancel_deal(uuid, text) to authenticated;

----------------------------------------------------------
-- Заменяем select_winner: добавляем атомарное создание deal.
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
  if v_caller is null then raise exception 'unauthorized' using errcode = 'P0001'; end if;

  select * into v_lot from public.lots where id = p_lot_id for update;
  if not found then raise exception 'lot_not_found' using errcode = 'P0001'; end if;
  if v_lot.owner_id <> v_caller then raise exception 'not_owner' using errcode = 'P0001'; end if;
  if v_lot.status <> 'closed' then raise exception 'lot_not_closed' using errcode = 'P0001'; end if;
  if v_lot.winner_bid_id is not null then raise exception 'winner_already_selected' using errcode = 'P0001'; end if;

  select * into v_bid from public.bids where id = p_bid_id;
  if not found then raise exception 'bid_not_found' using errcode = 'P0001'; end if;
  if v_bid.lot_id <> p_lot_id then raise exception 'bid_lot_mismatch' using errcode = 'P0001'; end if;

  update public.lots set winner_bid_id = p_bid_id where id = p_lot_id returning * into v_lot;

  insert into public.deals (lot_id, winner_bid_id, customer_id, contractor_id, amount, currency)
  values (v_lot.id, v_bid.id, v_lot.owner_id, v_bid.bidder_id, v_bid.amount, v_lot.currency);

  return v_lot;
end;
$$;

----------------------------------------------------------
-- Reviews
----------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewee_id uuid not null references public.profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text check (comment is null or length(comment) <= 1000),
  created_at timestamptz not null default now(),
  constraint reviews_distinct_parties check (reviewer_id <> reviewee_id)
);

create unique index reviews_deal_reviewer_idx on public.reviews (deal_id, reviewer_id);
create index reviews_reviewee_idx on public.reviews (reviewee_id, created_at desc);

alter table public.reviews enable row level security;

create policy "reviews_public_read"
  on public.reviews for select
  to anon, authenticated
  using (true);

create policy "reviews_own_insert"
  on public.reviews for insert
  to authenticated
  with check (
    reviewer_id = auth.uid()
    and exists (
      select 1 from public.deals d
      where d.id = reviews.deal_id
        and d.status = 'closed'
        and (
          (d.customer_id = auth.uid() and d.contractor_id = reviews.reviewee_id)
          or (d.contractor_id = auth.uid() and d.customer_id = reviews.reviewee_id)
        )
    )
  );

alter publication supabase_realtime add table public.deals;
