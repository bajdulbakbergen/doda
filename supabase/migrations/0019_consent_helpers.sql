-- 0019_consent_helpers.sql
-- Helper-функция для записи согласия сразу после signUp (когда session ещё не установлена
-- из-за email confirmation). Окно - 10 минут с момента создания auth.users.

create or replace function public.record_signup_consent(
  p_user_id uuid,
  p_document_slug text,
  p_document_version text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_created_at timestamptz;
begin
  select created_at into v_created_at from auth.users where id = p_user_id;
  if v_created_at is null then
    raise exception 'user_not_found' using errcode = 'P0001';
  end if;
  if v_created_at < now() - interval '10 minutes' then
    raise exception 'too_late' using errcode = 'P0001';
  end if;
  insert into public.user_consents (user_id, document_slug, document_version, source)
  values (p_user_id, p_document_slug, p_document_version, 'sign_up');
end;
$$;

revoke execute on function public.record_signup_consent(uuid, text, text) from public;
grant execute on function public.record_signup_consent(uuid, text, text) to anon, authenticated;
