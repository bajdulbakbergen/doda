-- 0011_messenger.sql
-- DM (2-party) с опциональным контекстом (lot_id или post_id).

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid references public.lots (id) on delete set null,
  post_id uuid references public.posts (id) on delete set null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create index conversations_last_msg_idx on public.conversations (last_message_at desc);
create index conversations_lot_idx on public.conversations (lot_id) where lot_id is not null;
create index conversations_post_idx on public.conversations (post_id) where post_id is not null;

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create index conversation_participants_user_idx
  on public.conversation_participants (user_id, conversation_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete restrict,
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);
create index messages_sender_idx on public.messages (sender_id);

----------------------------------------------------------
-- RLS
----------------------------------------------------------
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

create policy "conversations_participants_read"
  on public.conversations for select
  to authenticated
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversations.id and cp.user_id = auth.uid()
    )
  );

create policy "conversation_participants_self_read"
  on public.conversation_participants for select
  to authenticated
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_participants.conversation_id and cp.user_id = auth.uid()
    )
  );

-- last_read_at юзер может обновлять для своей записи
create policy "conversation_participants_self_update"
  on public.conversation_participants for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "messages_participants_read"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
    )
  );

create policy "messages_participants_insert"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
    )
  );

----------------------------------------------------------
-- Триггер: обновляет last_message_at в conversations при новом сообщении.
----------------------------------------------------------
create or replace function public.touch_conversation()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;

revoke execute on function public.touch_conversation() from public, anon, authenticated;

create trigger after_message_insert_touch
  after insert on public.messages
  for each row execute function public.touch_conversation();

----------------------------------------------------------
-- start_conversation: атомарно ищет или создаёт диалог между двумя юзерами
-- с тем же контекстом (lot_id, post_id).
----------------------------------------------------------
create or replace function public.start_conversation(
  p_other_user uuid,
  p_lot_id uuid default null,
  p_post_id uuid default null
)
returns public.conversations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_existing public.conversations;
  v_new public.conversations;
begin
  if v_me is null then raise exception 'unauthorized' using errcode = 'P0001'; end if;
  if p_other_user is null or p_other_user = v_me then
    raise exception 'invalid_other_user' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.profiles where id = p_other_user) then
    raise exception 'user_not_found' using errcode = 'P0001';
  end if;

  -- Поиск существующего диалога с тем же контекстом
  select c.* into v_existing
  from public.conversations c
  where c.lot_id is not distinct from p_lot_id
    and c.post_id is not distinct from p_post_id
    and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = c.id and cp.user_id = v_me
    )
    and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = c.id and cp.user_id = p_other_user
    )
  order by c.last_message_at desc
  limit 1;

  if found then return v_existing; end if;

  insert into public.conversations (lot_id, post_id, created_by)
  values (p_lot_id, p_post_id, v_me)
  returning * into v_new;

  insert into public.conversation_participants (conversation_id, user_id)
  values (v_new.id, v_me), (v_new.id, p_other_user);

  return v_new;
end;
$$;

revoke execute on function public.start_conversation(uuid, uuid, uuid) from public, anon;
grant execute on function public.start_conversation(uuid, uuid, uuid) to authenticated;

----------------------------------------------------------
-- mark_conversation_read: обновляет last_read_at участника
----------------------------------------------------------
create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'unauthorized' using errcode = 'P0001'; end if;
  update public.conversation_participants
  set last_read_at = now()
  where conversation_id = p_conversation_id and user_id = auth.uid();
end;
$$;

revoke execute on function public.mark_conversation_read(uuid) from public, anon;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.messages;
