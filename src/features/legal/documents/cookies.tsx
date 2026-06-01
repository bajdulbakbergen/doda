import { operator } from "@/config/operator";
import { LegalDocLayout } from "../components/legal-doc-layout";

export const cookiesMeta = {
  slug: "cookies",
  version: "1.0.0",
  publishedAt: "08.05.2026",
  titleRu: "Политика использования cookies",
  titleKk: "Cookies саясаты",
};

export function CookiesRu() {
  return (
    <LegalDocLayout
      title={cookiesMeta.titleRu}
      version={cookiesMeta.version}
      publishedAt={cookiesMeta.publishedAt}
    >
      <h2>1. Что такое cookies</h2>
      <p>
        Cookies — небольшие текстовые файлы, размещаемые веб-сайтом в браузере пользователя
        для хранения информации, необходимой для корректной работы сайта, аналитики его
        использования и персонализации. Аналогичными технологиями являются local storage,
        session storage, IndexedDB и пиксельные трекеры.
      </p>
      <p>
        Платформа {operator.legalName} использует указанные технологии. Принимая настоящую
        Политику и/или продолжая использование Платформы, Пользователь подтверждает своё
        согласие на их использование в соответствии с настоящей Политикой.
      </p>

      <h2>2. Категории используемых cookies</h2>

      <h3>2.1. Необходимые (Strictly Necessary)</h3>
      <p>
        Необходимы для работы Платформы. Без них невозможно использование основных функций.
        Не требуют согласия Пользователя.
      </p>
      <ul>
        <li>
          <code>sb-access-token</code>, <code>sb-refresh-token</code> — токены
          аутентификации Supabase, срок 1 час / 30 дней;
        </li>
        <li>
          <code>NEXT_LOCALE</code> — выбранный язык интерфейса, срок 1 год;
        </li>
        <li>
          <code>doda-install-dismissed-at</code> — флаг отклонения предложения установить
          PWA, срок 14 дней;
        </li>
        <li>
          <code>doda-cookie-consent</code> — выбор Пользователя в отношении необязательных
          cookies, срок 365 дней.
        </li>
      </ul>

      <h3>2.2. Функциональные (Functional)</h3>
      <p>
        Улучшают пользовательский опыт. Активируются при общем согласии на cookies.
      </p>
      <ul>
        <li>
          <code>localStorage: doda-lot-filters</code> — последние применённые фильтры в
          каталоге Лотов (хранится локально, не передаётся на сервер);
        </li>
        <li>сохранение состояния realtime-подписок при переходах между страницами.</li>
      </ul>

      <h3>2.3. Аналитические (Analytics)</h3>
      <p>
        Помогают Оператору понять, как Пользователи взаимодействуют с Платформой, для
        улучшения функциональности. Активируются только при явном согласии Пользователя.
      </p>
      <ul>
        <li>
          <strong>PostHog</strong> (хостинг в Европейском Союзе) — продуктовая аналитика:
          просмотры страниц, события (создание Лотов, подача Ставок), funnel-анализ. Срок
          хранения cookies — до 1 года. Подробнее:{" "}
          <a href="https://posthog.com/privacy" target="_blank" rel="noreferrer">
            posthog.com/privacy
          </a>
          .
        </li>
        <li>
          <strong>Sentry</strong> — сбор данных об ошибках для повышения стабильности
          сервиса. Личные данные в трейсах ошибок не передаются. Подробнее:{" "}
          <a href="https://sentry.io/privacy/" target="_blank" rel="noreferrer">
            sentry.io/privacy
          </a>
          .
        </li>
      </ul>
      <p className="text-foreground/55 text-xs">
        Аналитические сервисы активируются только если соответствующие env-переменные
        заданы Оператором. На момент публикации настоящей версии Политики статус сервисов
        может быть уточнён через раздел «Настройки cookies».
      </p>

      <h2>3. Управление cookies</h2>
      <p>
        При первом посещении Платформы Пользователю предлагается выбрать категории
        cookies, которые он разрешает использовать. Доступны опции:
      </p>
      <ul>
        <li><strong>Принять все</strong> — все категории cookies включены;</li>
        <li><strong>Только необходимые</strong> — отключены функциональные и аналитические cookies;</li>
        <li><strong>Настроить</strong> — выбор каждой категории отдельно.</li>
      </ul>
      <p>
        Выбор Пользователя сохраняется на 365 дней. По истечении этого срока запрос
        согласия повторяется. Пользователь в любой момент может изменить свой выбор через
        раздел «Настройки cookies» в подвале сайта.
      </p>

      <h2>4. Управление через настройки браузера</h2>
      <p>
        Пользователь может полностью отключить cookies или удалить ранее сохранённые
        cookies через настройки своего браузера. Соответствующие инструкции:
      </p>
      <ul>
        <li>
          Google Chrome:{" "}
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noreferrer"
          >
            support.google.com/chrome/answer/95647
          </a>
        </li>
        <li>
          Mozilla Firefox:{" "}
          <a
            href="https://support.mozilla.org/ru/kb/cookies"
            target="_blank"
            rel="noreferrer"
          >
            support.mozilla.org/ru/kb/cookies
          </a>
        </li>
        <li>
          Safari:{" "}
          <a
            href="https://support.apple.com/ru-ru/guide/safari/sfri11471/mac"
            target="_blank"
            rel="noreferrer"
          >
            support.apple.com/ru-ru/guide/safari
          </a>
        </li>
        <li>
          Microsoft Edge:{" "}
          <a
            href="https://support.microsoft.com/ru-ru/microsoft-edge"
            target="_blank"
            rel="noreferrer"
          >
            support.microsoft.com/ru-ru/microsoft-edge
          </a>
        </li>
      </ul>
      <p>
        Отключение необходимых cookies приведёт к невозможности использования основных
        функций Платформы.
      </p>

      <h2>5. Изменение Политики</h2>
      <p>
        Оператор вправе вносить изменения в настоящую Политику. Актуальная редакция
        размещается на Платформе. При существенных изменениях категорий cookies или
        используемых сервисов согласие Пользователя запрашивается повторно через
        Cookie-баннер.
      </p>

      <h2>6. Контакты</h2>
      <p>
        Вопросы по использованию cookies можно направить на{" "}
        <a href={`mailto:${operator.dpoEmail}`}>{operator.dpoEmail}</a>.
      </p>
    </LegalDocLayout>
  );
}

export function CookiesKk() {
  return (
    <LegalDocLayout
      title={cookiesMeta.titleKk}
      version={cookiesMeta.version}
      publishedAt={cookiesMeta.publishedAt}
    >
      <h2>1. Cookies дегеніміз не</h2>
      <p>
        Cookies — сайттың дұрыс жұмыс істеуі, аналитика мен дербестендіру үшін браузерде
        сақталатын шағын мәтіндік файлдар. {operator.legalName} Платформасы осы
        технологияларды пайдаланады.
      </p>

      <h2>2. Cookies санаттары</h2>

      <h3>2.1. Қажетті</h3>
      <p>
        Платформаның жұмысы үшін міндетті. Пайдаланушының келісімін қажет етпейді.
      </p>
      <ul>
        <li><code>sb-access-token</code>, <code>sb-refresh-token</code> — Supabase аутентификациясы;</li>
        <li><code>NEXT_LOCALE</code> — таңдалған тіл;</li>
        <li><code>doda-cookie-consent</code> — cookies таңдауы.</li>
      </ul>

      <h3>2.2. Функционалды</h3>
      <p>Пайдаланушы тәжірибесін жақсартады, жалпы келісім бойынша белсенді.</p>

      <h3>2.3. Аналитикалық</h3>
      <p>Тек айқын келісім бойынша:</p>
      <ul>
        <li><strong>PostHog</strong> — өнімдік аналитика (ЕО хостинг);</li>
        <li><strong>Sentry</strong> — қателер туралы деректерді жинау.</li>
      </ul>

      <h2>3. Cookies-ті басқару</h2>
      <p>
        Алғашқы кірген кезде Пайдаланушыға таңдау ұсынылады: «Барлығын қабылдау», «Тек
        қажетті», «Баптау». Таңдау 365 күн сақталады.
      </p>

      <h2>4. Браузер баптаулары арқылы басқару</h2>
      <p>
        Cookies-ті браузер баптаулары арқылы өшіруге болады. Қажетті cookies өшірілсе
        Платформаның негізгі функцияларын пайдалану мүмкін болмайды.
      </p>

      <h2>5. Саясатты өзгерту</h2>
      <p>
        Оператор Саясатты өзгерте алады. Елеулі өзгерістер кезінде Пайдаланушының
        келісімі қайта сұралады.
      </p>

      <h2>6. Байланыс</h2>
      <p>
        Сұрақтар:{" "}
        <a href={`mailto:${operator.dpoEmail}`}>{operator.dpoEmail}</a>
      </p>
    </LegalDocLayout>
  );
}
