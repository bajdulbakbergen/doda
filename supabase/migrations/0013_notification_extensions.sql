-- 0013_notification_extensions.sql
-- Конвертируем notification_type из enum в text + CHECK (проще добавлять новые типы).
-- Добавляем триггеры для message_received и lot_invite_received.

alter table public.notifications alter column type type text using type::text;
drop type public.notification_type;

alter table public.notifications add constraint notifications_type_valid check (
  type in (
    'lot_bid_placed',
    'lot_winner_selected',
    'deal_status_changed',
    'review_received',
    'message_received',
    'lot_invite_received'
  )
);

----------------------------------------------------------
-- Триггер: новое сообщение → уведомление получателю(ам)
----------------------------------------------------------
create or replace function public.notify_new_message()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications (user_id, type, payload)
  select cp.user_id, 'message_received',
    jsonb_build_object(
      'conversation_id', new.conversation_id,
      'message_id', new.id,
      'sender_id', new.sender_id
    )
  from public.conversation_participants cp
  where cp.conversation_id = new.conversation_id
    and cp.user_id <> new.sender_id;
  return new;
end;
$$;

revoke execute on function public.notify_new_message() from public, anon, authenticated;

create trigger after_message_insert_notify
  after insert on public.messages
  for each row execute function public.notify_new_message();

----------------------------------------------------------
-- Триггер: новое приглашение в лот → уведомление получателю
----------------------------------------------------------
create or replace function public.notify_lot_invite()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications (user_id, type, payload)
  values (new.invitee_id, 'lot_invite_received', jsonb_build_object(
    'lot_id', new.lot_id,
    'invite_id', new.id,
    'inviter_id', new.inviter_id
  ));
  return new;
end;
$$;

revoke execute on function public.notify_lot_invite() from public, anon, authenticated;

create trigger after_lot_invite_insert
  after insert on public.lot_invites
  for each row execute function public.notify_lot_invite();
