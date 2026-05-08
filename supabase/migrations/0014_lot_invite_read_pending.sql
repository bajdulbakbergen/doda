-- 0014_lot_invite_read_pending.sql
-- Расширяем RLS на lots: invitee видит приватный лот даже до accept (для accept/decline UI).
-- После decline лот снова скрывается.

drop policy if exists "lots_invitee_read_private" on public.lots;

create policy "lots_invitee_read_private"
  on public.lots for select
  to authenticated
  using (
    is_private and exists (
      select 1 from public.lot_invites
      where lot_id = lots.id and invitee_id = auth.uid() and declined_at is null
    )
  );
