-- 0007_storage_hardening.sql
-- Удаляем избыточную SELECT policy для avatars bucket — публичный URL и так
-- работает через storage public endpoint, а listing разрешать никому не нужно.

drop policy if exists "avatars_public_read" on storage.objects;
