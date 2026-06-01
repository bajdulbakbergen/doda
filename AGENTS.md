<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Doda - B2B тендерно-аукционная платформа (Казахстан)

## Что это
Production-grade B2B платформа для KZ. Зарегистрированные пользователи в едином кабинете выступают как заказчиками, так и подрядчиками. Заказчики создают лоты, подрядчики делают ставки по принципу обратного аукциона. + блоги участников с лентой рекомендаций + встроенный мессенджер.

Аналоги: Profi.ru (формат заказчик-подрядчик) + Goszakup.kz (тендерная механика), но для частного B2B.

Старт: одна категория (стройматериалы), один город (Астана), локали RU/KK.

## Стек
- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind v4
- Supabase (Postgres + Auth + Realtime + Storage)
- next-intl (RU/KK; EN опционально позже)
- framer-motion для анимаций
- Vercel deploy + Cloudflare CDN
- Sentry (errors), PostHog (analytics)
- Платежи: Kaspi (приоритет), Halyk
- SMS: Mobizon. Push: PWA + Telegram-бот.

## Архитектура ролей
**Один аккаунт = один кабинет.** Заказчик/подрядчик - это **действия**, не роли уровня аккаунта.

Уровни доступа:
1. **Гость** - каталог лотов, профили, блоги, история сделок
2. **Зарегистрированный** (email/телефон) - сохранять, подписываться, чат
3. **Верифицированный** (ИП/ТОО + УДЛ) - создавать лоты, подавать ставки

Верификация триггерится **в момент попытки** действия, не при регистрации.

## Логика лота (важно)
- Открытый лот публичен (включая гостей); закрытый - только приглашённые подрядчики
- Все ставки публичны, сортируются от лучшей в реальном времени (Supabase Realtime)
- Подрядчик меняет свою ставку **максимум 3 раза за лот**
- Минимальный шаг ставки = `max(1000 ₸, 0.5% от текущей лучшей цены)`
- **Anti-sniping:** ставка в последние 3 минуты до дедлайна → +5 минут к дедлайну
- Заказчик выбирает победителя сам (не обязательно min цена). Видит таблицу: цена, история ставок, рейтинг, регион, отзывы

Атомарность ставок: транзакции PostgreSQL + оптимистические блокировки.

## Сущности
User, Profile, Verification, Lot, Bid, Deal, Review, Post, PostInteraction, Conversation, Message, Notification, Category.

## Публичная история подрядчика (УТП)
В профиле каждого: все его ставки во всех лотах + результаты + отзывы + агрегаты (кол-во сделок, % успешных, средний чек, скорость ответа). Полная прозрачность.

## Блоги
Типизированные посты: кейс/проект, товар/услуга, новость, фото/видео. **НЕ копировать Instagram.** Гибрид: горизонтальные блоки по типам сверху профиля + вертикальная лента ниже. Asymmetric masonry с метаданными (цена, регион).

## Лента рекомендаций
- Ранжирование: views + likes + saves + переходы в профиль + старт диалога
- Релевантность категорий по истории лотов и подпискам
- Дедупликация: один пост → одному юзеру в рекомендациях один раз
- Boost для свежих 24-48 ч
- Альтернативы рекомендациям: профиль автора, категорийная лента, поиск

## Мессенджер
Точки входа: «Написать» в посте/профиле, «Задать вопрос» в карточке лота (диалог привязан к лоту). Контекст хранится в conversation. Антиспам: лимит 5/день для неверифицированных, жалобы и блокировки. Из чата заказчик может пригласить подрядчика в закрытый лот.

## Бизнес-модель
Старт: комиссия с заказчика после успешной сделки (% TBD). Платное продвижение постов в ленте.
**Эскроу пока нет** (требует лицензии НБ РК). Расчёты вне платформы, но статус сделки трекается: предложение принято → договор → оплата → поставка → закрытие → отзыв.

## Безопасность
2FA (TOTP + SMS), хеш паролей **bcrypt** (Supabase Auth, alg фиксирован - кастомный argon2 потребовал бы выпиливания Supabase Auth), шифрование ПД (УДЛ, БИН), приватный bucket для документов с подписанными URL, аудит-логи, rate limiting, OWASP Top 10, бэкапы БД с тестом восстановления.

## Юридика KZ
Оферта, ПС, ПК, согласие на ПД (ЗРК «О ПД»), регистрация базы ПД в КНБ, регламент торгов, регламент споров. Тексты - отдельно с юристом, в коде предусмотреть страницы и подтверждение при регистрации.

## Уведомления
Каналы: email, web push, SMS (для KZ критично), Telegram-бот, mobile push (PWA позже).
Триггеры: новый лот в категории / новая ставка в моём лоте / моя ставка перебита / лот закрывается через час / выбран победителем / новый отзыв / новое сообщение.
Настройки уведомлений в кабинете обязательны.

## SEO
Все публичные страницы лотов и профилей индексируются. Sitemap, robots.txt, Schema.org, OG, hreflang. SSR для всех публичных страниц.

## Антифрод
Связка по IP/устройству/телефону для мультиаккаунтов, детектор аномальных ставок, чёрный список БИН, premoderation на старте, жалобы с SLA.

## Out of scope (MVP)
Эскроу, нативные приложения (только PWA + TWA для Android), крипто, международная экспансия, AI-помощник для лотов.

## Этапы разработки
1. **Фундамент** ✅ - email/password auth, callback, sign-out, восстановление пароля, публичные профили `/u/[slug]`, личный кабинет `/account`, аватары через Supabase Storage, i18n, базовые UI-примитивы
2. **Тендерное ядро** ✅ - верификация ИП/ТОО (форма + private bucket + триггер), создание лота, каталог `/lots` с фильтрами, страница лота с realtime-ставками, Postgres функция `submit_bid` (атомарная, anti-sniping, 3 изменения), `close_lot` и `select_winner`, история подрядчика на профиле, audit log `bid_changes`
3. **Сделки и репутация** ✅ - `deals` таблица (auto-create в модифицированной `select_winner`), статусы proposed→contracted→paid→delivered→closed, `advance_deal_status`/`cancel_deal` функции, `reviews` (1-5 звёзд + комментарий, RLS требует closed deal), `RatingSummary` на профиле, in-app `notifications` через DB-триггеры, bell в header с realtime подпиской
4. **Социалка** ✅ - `posts` (4 типа: case/product/news/media) с публичным bucket для картинок, `post_interactions` (like/save), `/feed` с ранкингом (likes + saves*1.5 + boost для свежих 48ч), `conversations` 2-party DM с опциональным lot/post контекстом, `messages` с realtime, `start_conversation` функция (find-or-create), `lot_invites` для приватных лотов с RLS-расширением, invite picker в чате, accept/decline banner на странице лота. `notification_type` мигрирован из enum в text+CHECK для гибкости. Новые типы уведомлений: `message_received`, `lot_invite_received`
5. **Production** ✅ - `audit_logs` + триггеры на лотах/ставках/сделках/верификациях, `moderation_status` enum на лотах/постах с обновлёнными RLS, `bin_blacklist` + before-insert триггер на верификациях, SEO (`robots.ts`, `sitemap.ts` с hreflang, `JsonLd` с Schema.org для лотов/профилей/постов), Sentry SDK с env-gated init и `instrumentation.ts`, PostHog SDK через `PostHogProvider` с pageview tracking, PWA `manifest.ts`, 2FA TOTP enroll/verify через Supabase MFA на `/account/security`

### Production checklist (перед релизом)

**Supabase Dashboard:**
- [ ] Authentication → Email: оставить `Confirm email` ВКЛ (для dev можно выключить)
- [ ] Authentication → Multi-Factor: убедиться что TOTP enabled
- [ ] Authentication → Rate Limits: настроить лимиты на signup/signin
- [ ] Database → Replication: проверить что Realtime включён для нужных таблиц
- [ ] Database → Backups: настроить расписание (минимум daily)
- [ ] Project Settings → API → Allowed origins: добавить production домен
- [ ] Storage → Configuration: настроить CORS для production домена
- [ ] Auth → SMTP: настроить custom SMTP (Postmark/Resend) вместо встроенного rate-limited
- [ ] Auth → URL Configuration: site_url + redirect_urls на production

**Env переменные на Vercel:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (только для server actions, никогда NEXT_PUBLIC_)
- [ ] `NEXT_PUBLIC_SITE_URL` = production домен
- [ ] `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` если включаем мониторинг
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` если включаем аналитику

**До запуска:**
- [ ] Создать иконки PWA (icon-192.png, icon-512.png, icon-maskable.png) в /public и раскомментировать в `manifest.ts`
- [ ] Добавить favicon.ico (есть стандартный из create-next-app)
- [ ] Подготовить open graph cover image (`/og-image.png`)
- [ ] Прогнать Lighthouse и проверить SEO/Accessibility/Performance scores
- [ ] Настроить Cloudflare CDN перед Vercel (если нужно)
- [ ] Настроить Vercel Analytics или альтернативу
- [ ] Подготовить юридические страницы `/legal/{terms,privacy,offer,personal-data,tenders-rules,disputes}` (заглушки сейчас)
- [ ] Регистрация базы ПД в КНБ РК (закон РК «О ПД»)
- [ ] Custom email templates в Supabase Auth (с фирменным стилем)
- [ ] Backup recovery test - восстановить prod снапшот в staging проекте

**Что НЕ сделано (отложенный список):**
- [ ] **Kaspi/Halyk платежи** - нужны merchant API ключи + интеграция SDK + webhook handlers
- [ ] **Telegram-бот** - отдельный worker (Bun/Deno) с polling/webhook, hosted на Render/Fly.io
- [ ] **Email transactional** - после подключения Postmark/Resend, конвертировать ключевые in-app уведомления в email через Database Webhook → Edge Function → провайдер
- [ ] **Admin UI** для модерации (`/admin/moderation`, `/admin/verifications`, `/admin/blacklist`) - пока вручную через Supabase MCP/Studio
- [ ] **MFA challenge на sign-in** - поддержали enroll, но автоматический challenge-step при логине не реализован. Пользователю нужно manually вызвать `mfa.challenge` + `verify` после signInWithPassword
- [ ] **TWA для Android** - требует Bubblewrap + signing key + Play Store
- [ ] **Encryption at rest** для БИН/ИИН - pgcrypto + envelope encryption (KMS-managed key через service_role)
- [ ] **Rate limiting at app level** - Postgres-based sliding window function

### Документированные хаки и компромиссы
- **Premoderation default**: `auto_approved` чтобы не блокировать пользовательский контент. Когда нужна строгая модерация, поменять default через `alter table ... alter column moderation_status set default 'pending';` и контент уходит в очередь
- **Audit logs RLS**: ни одной policy → не доступны через REST. Только через service_role. Для админ-UI нужно создать API route с service_role клиентом
- **bin_blacklist RLS**: то же самое. Управление только service_role
- **Sentry без `withSentryConfig`**: чтобы не усложнять next.config.ts и build pipeline. Source maps upload не настроен - добавить когда подключим CI/CD

### Что отложено из этапа 5
- **Real Kaspi/Halyk integration** - нужны merchant API ключи и webhook handlers
- **Email/Telegram уведомления** - нужны провайдер + worker. Скелет триггеров готов
- **Admin UI** - пока через Supabase Studio. Готовы schema + RLS
- **TWA build** - отдельный workflow с Bubblewrap
- **MFA enforcement на sign-in** - TOTP enroll работает, но challenge-step не автоматический

### Что отложено из этапа 4
- **View tracking + дедупликация в feed** - пока ранкинг по лайкам/сохранениям без учёта просмотров. Добавим в этап 5 (потребует `feed_views` таблицу с TTL).
- **Подписки на пользователей** (follow) - нет. Лента общая, без персонализации по подпискам.
- **Reactions/attachments в чате** - только текст. Файлы и эмодзи позже.
- **Spam-лимит 5/день** для неверифицированных DM - пока полагаемся на Supabase rate limits. Добавим функцию-проверку при scaling.
- **Blocks/reports** - нет. Этап 5 (антифрод).
- **Markdown в постах** - body как plain text с newlines. Markdown позже (нужен renderer и санитизация).

### Что отложено из этапа 3
- **Email уведомления** - нужен SMTP-провайдер (Postmark/Resend) или Supabase Edge Function. Сейчас только in-app уведомления.
- **Telegram-бот** - отдельный worker процесс. В этапе 5.
- **Disputed статус сделок** - нужен админский флоу разрешения. Пока только cancel.
- **Web push** - Service Worker + push subscriptions. В этапе 5 при PWA.

### Что отложено из этапа 2
- **Auto-close по дедлайну** - пока ручной close владельцем. Cron/edge function в этапе 5.
- **Admin UI для модерации верификаций** - пока approve/reject вручную через Supabase studio: `update verifications set status='approved' where user_id='...';`
- **Закрытые лоты с приглашениями** - таблица `lot_invites` и UI приглашений в этапе 4.
- **Шифрование БИН/ИИН в БД** - pg_crypto + envelope encryption в этапе 5 безопасности.

### Тестирование верификации в dev
Approve вручную через Supabase MCP / Studio:
```sql
update public.verifications set status = 'approved', reviewed_at = now() where user_id = '<UUID>';
```
Триггер автоматически проставит `profiles.is_verified = true`. Reject:
```sql
update public.verifications set status = 'rejected', reviewer_notes = 'reason', reviewed_at = now() where user_id = '<UUID>';
```

### Что отложено из этапа 1
- **Phone+OTP auth** - требует подключённого SMS-провайдера (Mobizon/Twilio в настройках Supabase Auth). Делаем когда будем интегрировать SMS-уведомления.
- **2FA (TOTP)** - Supabase Auth даёт коробкой, добавим вместе с верификацией.
- В Supabase Dashboard → Authentication → Email включено подтверждение email. Для локального тестирования можно временно отключить (`Confirm email` toggle), либо использовать встроенный SMTP (rate-limited).

## Конвенции кода
- TypeScript strict mode, ESLint + Prettier
- Структура feature-based: `src/features/{lots,auth,profile,bids,blog,chat,deals,notifications,verification}`
- Общее в `src/shared/{ui,components,lib,hooks,types}`
- Routes в `src/app/[locale]/...`
- Supabase clients в `src/lib/supabase/{client,server}.ts`
- next-intl config в `src/i18n/`
- Имена переменных и UI на русском допустимы для бизнес-доменных терминов (лот, ставка, сделка)

## Next.js 16: важные отличия
- **`middleware.ts` переименован в `proxy.ts`** - используем `src/proxy.ts`. В нём цепочка: сначала `next-intl`, затем рефреш Supabase сессии. `auth/callback` исключён из matcher.
- `params` асинхронные: `const { locale } = await params`
- Глобальные хелперы `PageProps<'/[locale]'>` и `LayoutProps<'/[locale]'>`
- Turbopack stable (включён по умолчанию для dev и build)

## Подводный камень: next-intl `redirect` и TypeScript
TS не сужает типы после `redirect()` из `createNavigation`-destructuring (теряет `never`). Мы экспортируем явную обёртку из `src/i18n/navigation.ts`:
```ts
export function redirect(args: { href: string; locale: string }): never {
  navigation.redirect(args);
  throw new Error("unreachable");
}
```
Используем её в Server Actions и Server Components. Не подменять на `navigation.redirect` напрямую - упадут проверки `if (!user) redirect(...)`.

## Команды
```bash
npm run dev      # dev сервер
npm run build    # production билд
npm run lint     # eslint
npm run format   # prettier (после настройки)
```

## PWA

- Manifest: `src/app/manifest.ts` → отдаёт `/manifest.webmanifest`
- Service Worker: `public/sw.js`, регистрация в `src/shared/components/pwa/service-worker-register.tsx` (только в production)
- Install prompt: `src/shared/components/pwa/install-prompt.tsx` - перехват `beforeinstallprompt`, хранение dismissed-флага в localStorage (14 дней)
- Offline-страница: `src/app/[locale]/offline/page.tsx` - fallback при отсутствии сети
- Иконки SVG в `public/`: `icon.svg`, `icon-maskable.svg`, `apple-touch-icon.svg`
- Bottom nav (только мобилка): `src/shared/components/layout/bottom-nav.tsx`
- Web Share API: `src/shared/components/pwa/share-button.tsx` с fallback на clipboard
- iOS meta: `appleWebApp` в `metadata`, viewport с `viewportFit: "cover"`, safe-area-inset через CSS env()

### Перед production
- Сгенерировать PNG иконки (192×192, 512×512, 512×512 maskable, 180×180 apple-touch) и заменить SVG ссылки в `manifest.ts` (некоторые краулеры/гайдлайны Play Store предпочитают PNG)
- Проверить Lighthouse PWA score - должен быть 100/100 после PNG-иконок

## TWA (Android приложение через Bubblewrap)

PWA можно обернуть в Android приложение для Google Play Store без нативной разработки. Используем Trusted Web Activity.

### Файлы в репо
- `public/.well-known/assetlinks.json` - Digital Asset Links для верификации связи app↔домен
- `twa-manifest.json` - конфиг для Bubblewrap CLI

### Шаги сборки APK
1. **Установить Bubblewrap CLI**: `npm i -g @bubblewrap/cli`
2. **Установить Android SDK** (через Android Studio либо command-line tools)
3. **Сгенерировать signing key**:
   ```bash
   keytool -genkey -v -keystore android.keystore -alias android \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
4. **Получить SHA-256 fingerprint**:
   ```bash
   keytool -list -v -keystore android.keystore -alias android
   ```
   Скопировать строку `SHA256:`
5. **Заполнить `public/.well-known/assetlinks.json`** - вставить SHA-256 в `sha256_cert_fingerprints`
6. **Заполнить `twa-manifest.json`** - заменить `REPLACE_WITH_YOUR_DOMAIN.vercel.app` на production домен (custom или *.vercel.app)
7. **Задеплоить assetlinks.json** на production (через push в `main`)
8. **Проверить Digital Asset Links**:
   ```
   https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://YOUR_DOMAIN&relation=delegate_permission/common.handle_all_urls
   ```
9. **Сгенерировать TWA проект**: `bubblewrap init --manifest=https://YOUR_DOMAIN/manifest.webmanifest` (или передать через `twa-manifest.json`)
10. **Собрать APK**: `bubblewrap build` → создаст `app-release-signed.apk` и `app-release-bundle.aab`
11. **Загрузить .aab в Google Play Console** → создать listing → review → publish

### Что важно для Play Store
- Иконки PNG (адаптивные/maskable) - без альфа-канала где надо
- Privacy Policy URL обязательна
- Screenshots приложения (минимум 2 для phone, 1 для tablet)
- Описание ru + kk
- Возрастной рейтинг (B2B → 3+)
- `applicationId = kz.doda.app` (или другой обратно-доменный)

## Supabase
- Проект: `iynohjjeobqgxxklzvnc` (region: eu-central-1)
- URL: `https://iynohjjeobqgxxklzvnc.supabase.co`
- Ключи в `.env.local` (не коммитить)
- Миграции через MCP `apply_migration` или Supabase CLI; файлы в `supabase/migrations/`

## Что НЕ делать
- Не амендить чужие коммиты
- Не push --force в main
- Не использовать `--no-verify` без явного указания
- Не коммитить `.env.local`, ключи, скан-документы
- Не кэшировать персональные данные на CDN
