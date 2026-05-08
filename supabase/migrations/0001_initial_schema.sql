-- 0001_initial_schema.sql
-- Базовая схема: profiles + categories + lots + bids + RLS + триггеры.
-- Supabase предоставляет auth.users автоматически. Мы расширяем профиль через public.profiles.

----------------------------------------------------------
-- ENUMS
----------------------------------------------------------
create type public.lot_status as enum ('draft', 'open', 'closing', 'closed', 'cancelled');

----------------------------------------------------------
-- CATEGORIES (иерархия + двуязычные названия)
----------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ru text not null,
  name_kk text not null,
  parent_id uuid references public.categories (id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index categories_parent_idx on public.categories (parent_id);

----------------------------------------------------------
-- PROFILES (1:1 c auth.users)
----------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  slug text unique not null,
  avatar_url text,
  bio text,
  city text,
  preferred_locale text not null default 'ru'
    check (preferred_locale in ('ru', 'kk', 'en')),
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_verified_idx on public.profiles (is_verified) where is_verified;

----------------------------------------------------------
-- LOTS
----------------------------------------------------------
create table public.lots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  title text not null,
  description text not null,
  category_id uuid not null references public.categories (id) on delete restrict,
  region text not null,
  currency text not null default 'KZT',
  starting_price numeric(14, 2),
  max_price numeric(14, 2),
  deadline_at timestamptz not null,
  is_private boolean not null default false,
  status public.lot_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lots_price_consistency check (
    (starting_price is null or starting_price > 0)
    and (max_price is null or max_price > 0)
    and (starting_price is null or max_price is null or max_price >= starting_price)
  )
);

create index lots_status_deadline_idx on public.lots (status, deadline_at);
create index lots_category_idx on public.lots (category_id);
create index lots_owner_idx on public.lots (owner_id);

----------------------------------------------------------
-- BIDS
-- Подрядчик может изменить ставку максимум 3 раза.
-- Реализация: храним только активную ставку с change_count; история — отдельной таблицей позже.
----------------------------------------------------------
create table public.bids (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.lots (id) on delete cascade,
  bidder_id uuid not null references public.profiles (id) on delete restrict,
  amount numeric(14, 2) not null check (amount > 0),
  change_count int not null default 0
    check (change_count >= 0 and change_count <= 3),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Одна активная ставка на пару (лот, подрядчик)
create unique index bids_active_unique_idx
  on public.bids (lot_id, bidder_id)
  where is_active;

create index bids_lot_amount_idx on public.bids (lot_id, amount);
create index bids_bidder_idx on public.bids (bidder_id);

----------------------------------------------------------
-- updated_at триггер
----------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger lots_updated_at
  before update on public.lots
  for each row execute function public.set_updated_at();

create trigger bids_updated_at
  before update on public.bids
  for each row execute function public.set_updated_at();

----------------------------------------------------------
-- Авто-создание профиля при регистрации в auth
----------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_name text;
  base_slug text;
begin
  base_name := coalesce(
    new.raw_user_meta_data ->> 'display_name',
    split_part(new.email, '@', 1)
  );
  base_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g'))
    || '-' || substring(new.id::text, 1, 8);

  insert into public.profiles (id, display_name, slug)
  values (new.id, base_name, base_slug);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

----------------------------------------------------------
-- RLS
----------------------------------------------------------
alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.lots enable row level security;
alter table public.bids enable row level security;

-- categories: публичное чтение
create policy "categories_public_read"
  on public.categories for select
  to anon, authenticated
  using (true);

-- profiles
create policy "profiles_public_read"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- lots
create policy "lots_public_read_open"
  on public.lots for select
  to anon, authenticated
  using (
    not is_private
    and status in ('open', 'closing', 'closed')
  );

create policy "lots_owner_read_all"
  on public.lots for select
  to authenticated
  using (auth.uid() = owner_id);

create policy "lots_verified_owner_insert"
  on public.lots for insert
  to authenticated
  with check (
    auth.uid() = owner_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and is_verified
    )
  );

create policy "lots_owner_update"
  on public.lots for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- bids
create policy "bids_public_read_visible_lots"
  on public.bids for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.lots l
      where l.id = bids.lot_id
        and (
          (not l.is_private and l.status in ('open', 'closing', 'closed'))
          or l.owner_id = auth.uid()
          or bids.bidder_id = auth.uid()
        )
    )
  );

create policy "bids_verified_bidder_insert"
  on public.bids for insert
  to authenticated
  with check (
    auth.uid() = bidder_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and is_verified
    )
    and exists (
      select 1 from public.lots l
      where l.id = lot_id
        and l.status in ('open', 'closing')
        and l.owner_id <> auth.uid()
    )
  );

create policy "bids_own_update"
  on public.bids for update
  to authenticated
  using (auth.uid() = bidder_id)
  with check (auth.uid() = bidder_id);

----------------------------------------------------------
-- Realtime
----------------------------------------------------------
alter publication supabase_realtime add table public.bids;
alter publication supabase_realtime add table public.lots;

----------------------------------------------------------
-- Стартовые категории (стройматериалы — приоритетная вертикаль)
----------------------------------------------------------
insert into public.categories (slug, name_ru, name_kk, sort_order) values
  ('construction-materials', 'Стройматериалы', 'Құрылыс материалдары', 10),
  ('construction-services', 'Строительные услуги', 'Құрылыс қызметтері', 20);
