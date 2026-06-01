-- 0022_deal_mutual_confirm.sql
-- H6: продвижение статуса сделки требует подтверждения принимающей стороны.
-- Модель: каждый шаг подтверждает тот, КТО ПРИНИМАЕТ результат.
--   proposed   → contracted: customer принимает условия выигравшего bid
--   contracted → paid       : contractor подтверждает, что деньги поступили (off-platform)
--   paid       → delivered  : customer подтверждает, что получил товар/услугу
--   delivered  → closed     : любая сторона может закрыть сделку
-- В одностороннем порядке (например, customer ставит paid не дождавшись contractor) - запрещено.

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
    (v_deal.status = 'proposed'  and p_new_status = 'contracted')
    or (v_deal.status = 'contracted' and p_new_status = 'paid')
    or (v_deal.status = 'paid'       and p_new_status = 'delivered')
    or (v_deal.status = 'delivered'  and p_new_status = 'closed')
  ) then
    raise exception 'invalid_transition' using errcode = 'P0001';
  end if;

  -- Защита от одностороннего продвижения: только принимающая сторона может подтвердить.
  if p_new_status = 'contracted' and v_actor <> v_deal.customer_id then
    raise exception 'only_customer_confirms' using errcode = 'P0001';
  end if;

  if p_new_status = 'paid' and v_actor <> v_deal.contractor_id then
    raise exception 'only_contractor_confirms' using errcode = 'P0001';
  end if;

  if p_new_status = 'delivered' and v_actor <> v_deal.customer_id then
    raise exception 'only_customer_confirms' using errcode = 'P0001';
  end if;
  -- closed: либая сторона.

  update public.deals
  set status = p_new_status,
      closed_at = case when p_new_status = 'closed' then now() else closed_at end
  where id = p_deal_id
  returning * into v_deal;

  return v_deal;
end;
$$;
