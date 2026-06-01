-- 0020_signup_consent_trigger.sql
-- Атомарная фиксация согласий пользователя при регистрации.
-- Если ранее (через record_signup_consent RPC) запись могла молча провалиться,
-- то теперь триггер на auth.users insert читает signup_consents из user_metadata
-- и пишет в public.user_consents в той же транзакции, что и создание пользователя.
-- Если триггер падает - падает и регистрация (acid).

create or replace function public.on_auth_user_signup_consent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_consents jsonb := new.raw_user_meta_data -> 'signup_consents';
  v_ip       text  := new.raw_user_meta_data ->> 'signup_ip';
  v_ua       text  := new.raw_user_meta_data ->> 'signup_user_agent';
  v_item     jsonb;
begin
  if v_consents is null or jsonb_typeof(v_consents) <> 'array' then
    return new;
  end if;

  for v_item in select * from jsonb_array_elements(v_consents) loop
    insert into public.user_consents (
      user_id, document_slug, document_version, source, ip, user_agent
    ) values (
      new.id,
      v_item ->> 'slug',
      v_item ->> 'version',
      'sign_up',
      v_ip,
      v_ua
    )
    on conflict do nothing;
  end loop;

  return new;
end;
$$;

drop trigger if exists on_auth_user_signup_consent on auth.users;
create trigger on_auth_user_signup_consent
  after insert on auth.users
  for each row execute function public.on_auth_user_signup_consent();
