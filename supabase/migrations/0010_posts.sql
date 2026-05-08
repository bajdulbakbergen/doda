-- 0010_posts.sql
-- Блог-посты + взаимодействия (likes/saves) + публичный bucket для картинок.

create type public.post_type as enum ('case', 'product', 'news', 'media');
create type public.post_interaction_type as enum ('like', 'save');

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  type public.post_type not null,
  title text not null check (length(title) between 5 and 200),
  body text check (body is null or length(body) <= 5000),
  images text[] not null default array[]::text[],
  category_id uuid references public.categories (id) on delete set null,
  region text,
  price numeric(14, 2),
  price_max numeric(14, 2),
  currency text not null default 'KZT',
  linked_lot_id uuid references public.lots (id) on delete set null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_price_consistency check (
    (price is null or price > 0)
    and (price_max is null or price_max > 0)
    and (price is null or price_max is null or price_max >= price)
  ),
  constraint posts_images_limit check (array_length(images, 1) is null or array_length(images, 1) <= 5)
);

create index posts_author_idx on public.posts (author_id, created_at desc);
create index posts_type_idx on public.posts (type, created_at desc);
create index posts_published_idx on public.posts (created_at desc) where is_published;
create index posts_category_idx on public.posts (category_id);

create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

create policy "posts_published_read"
  on public.posts for select
  to anon, authenticated
  using (is_published);

create policy "posts_owner_read_all"
  on public.posts for select
  to authenticated
  using (author_id = auth.uid());

create policy "posts_verified_author_insert"
  on public.posts for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and is_verified)
  );

create policy "posts_owner_update"
  on public.posts for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "posts_owner_delete"
  on public.posts for delete
  to authenticated
  using (author_id = auth.uid());

----------------------------------------------------------
-- Взаимодействия (like / save)
----------------------------------------------------------
create table public.post_interactions (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  type public.post_interaction_type not null,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id, type)
);

create index post_interactions_post_idx on public.post_interactions (post_id, type);

alter table public.post_interactions enable row level security;

create policy "post_interactions_public_read"
  on public.post_interactions for select
  to anon, authenticated
  using (true);

create policy "post_interactions_owner_insert"
  on public.post_interactions for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "post_interactions_owner_delete"
  on public.post_interactions for delete
  to authenticated
  using (user_id = auth.uid());

----------------------------------------------------------
-- Storage: публичный bucket для картинок постов
----------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-images', 'post-images', true, 10485760,
  array['image/png', 'image/jpeg', 'image/webp']);

create policy "post_images_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "post_images_owner_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "post_images_owner_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);

alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.post_interactions;
