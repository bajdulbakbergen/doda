import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { JsonLd, organizationJsonLd } from "@/shared/components/seo/json-ld";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <Hero />
      <ProblemSolution />
      <HowItWorks />
      <Features />
      <Stats />
      <ForBoth />
      <Faq />
      <FinalCta />
    </>
  );
}

function Hero() {
  const t = useTranslations("home.hero");
  return (
    <section className="border-foreground/10 relative overflow-hidden border-b">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_30%_0%,rgba(16,185,129,0.10),transparent_60%),radial-gradient(50%_50%_at_85%_30%,rgba(99,102,241,0.06),transparent_60%)]"
      />
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 pt-20 pb-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pt-28 lg:pb-28">
        <div className="space-y-7">
          <span className="border-foreground/15 bg-foreground/[0.03] inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            {t("badge")}
          </span>

          <h1 className="text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            {t.rich("title", {
              accent: (chunks) => (
                <span className="bg-gradient-to-br from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
                  {chunks}
                </span>
              ),
            })}
          </h1>

          <p className="text-foreground/75 max-w-xl text-lg leading-relaxed">{t("subtitle")}</p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/lots/new"
              className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-12 items-center rounded-full px-7 text-sm font-medium transition-colors"
            >
              {t("ctaPrimary")} →
            </Link>
            <Link
              href="#how"
              className="border-foreground/15 hover:bg-foreground/5 inline-flex h-12 items-center rounded-full border px-7 text-sm font-medium transition-colors"
            >
              {t("ctaSecondary")}
            </Link>
          </div>

          <div className="text-foreground/60 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> {t("trust1")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> {t("trust2")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> {t("trust3")}
            </span>
          </div>
        </div>

        <div className="lg:pl-4">
          <MockAuctionCard />
        </div>
      </div>
    </section>
  );
}

function MockAuctionCard() {
  const t = useTranslations("home.mock");
  const bids = [
    { name: "ТОО «СтройТрест»", amount: "3 850 000 ₸", verified: true, winning: true },
    { name: "ИП Мукаев Е.", amount: "3 920 000 ₸", verified: true, winning: false },
    { name: "ТОО «АлматБетон»", amount: "4 150 000 ₸", verified: true, winning: false },
  ];
  return (
    <div className="border-foreground/10 bg-background relative rounded-3xl border p-1 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.18)]">
      <div className="bg-foreground/[0.02] rounded-[20px] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              {t("statusOpen")}
            </span>
            <h3 className="text-base font-semibold">{t("lotTitle")}</h3>
            <div className="text-foreground/55 text-xs">{t("lotMeta")}</div>
          </div>
          <div className="text-right">
            <div className="text-foreground/50 text-[10px] uppercase tracking-wider">
              {t("deadlineLabel")}
            </div>
            <div className="text-base font-semibold tabular-nums text-amber-600 dark:text-amber-400">
              {t("deadlineValue")}
            </div>
          </div>
        </div>

        <ol className="mt-5 space-y-1.5">
          {bids.map((b, i) => (
            <li
              key={i}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                b.winning
                  ? "border-emerald-300/50 bg-emerald-50 dark:bg-emerald-950/30"
                  : "border-foreground/10"
              }`}
            >
              <span className="text-foreground/40 w-5 text-center font-mono text-xs">
                {i + 1}
              </span>
              <div className="flex-1 text-sm">
                <div className="flex items-center gap-1.5 font-medium">
                  {b.name}
                  {b.verified ? (
                    <span className="text-emerald-500" aria-label="verified">
                      ✓
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="text-sm font-semibold tabular-nums">{b.amount}</div>
            </li>
          ))}
        </ol>

        <div className="text-foreground/50 mt-4 flex items-center gap-1.5 text-xs">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          {t("liveLabel")}
        </div>
      </div>
    </div>
  );
}

function ProblemSolution() {
  const t = useTranslations("home.problem");
  const oldWay = ["o1", "o2", "o3", "o4"] as const;
  const newWay = ["n1", "n2", "n3", "n4"] as const;
  return (
    <section className="border-foreground/10 bg-foreground/[0.02] border-b">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
            {t("eyebrow")}
          </div>
          <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="border-foreground/10 bg-background rounded-2xl border p-7">
            <div className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
              {t("oldLabel")}
            </div>
            <h3 className="mt-2 text-lg font-semibold">{t("oldTitle")}</h3>
            <ul className="mt-5 space-y-3">
              {oldWay.map((k) => (
                <li key={k} className="flex gap-2.5 text-sm">
                  <span className="mt-0.5 shrink-0 text-red-500">×</span>
                  <span className="text-foreground/75">{t(`old.${k}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-300/40 bg-emerald-50/40 p-7 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
              {t("newLabel")}
            </div>
            <h3 className="mt-2 text-lg font-semibold">{t("newTitle")}</h3>
            <ul className="mt-5 space-y-3">
              {newWay.map((k) => (
                <li key={k} className="flex gap-2.5 text-sm">
                  <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                  <span>{t(`new.${k}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const t = useTranslations("home.how");
  const steps = ["publish", "compete", "close"] as const;
  return (
    <section id="how" className="border-foreground/10 scroll-mt-16 border-b">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((key, i) => (
            <div key={key} className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-7">
              <div className="flex items-center gap-3">
                <span className="bg-foreground text-background flex size-8 items-center justify-center rounded-full text-sm font-semibold tabular-nums">
                  {i + 1}
                </span>
                <span className="text-foreground/40 font-mono text-xs uppercase tracking-wider">
                  {t(`steps.${key}.tag`)}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{t(`steps.${key}.title`)}</h3>
              <p className="text-foreground/65 mt-2 text-sm leading-relaxed">
                {t(`steps.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURE_ICONS: Record<string, string> = {
  realtime: "↻",
  antiSniping: "⏱",
  verification: "🛡",
  reputation: "★",
  closed: "🔒",
  free: "₸",
};

function Features() {
  const t = useTranslations("home.features");
  const items = ["realtime", "antiSniping", "verification", "reputation", "closed", "free"] as const;
  return (
    <section className="border-foreground/10 bg-foreground/[0.02] border-b">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((key) => (
            <article
              key={key}
              className="border-foreground/10 bg-background hover:border-foreground/25 group rounded-2xl border p-6 transition-colors"
            >
              <div className="bg-foreground/5 group-hover:bg-foreground/10 flex size-10 items-center justify-center rounded-xl text-base transition-colors">
                {FEATURE_ICONS[key]}
              </div>
              <h3 className="mt-4 text-base font-semibold">{t(`items.${key}.title`)}</h3>
              <p className="text-foreground/65 mt-1.5 text-sm leading-relaxed">
                {t(`items.${key}.body`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const t = useTranslations("home.stats");
  const items = ["s1", "s2", "s3", "s4"] as const;
  return (
    <section className="border-foreground/10 border-b">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid gap-8 md:grid-cols-4">
          {items.map((k) => (
            <div key={k} className="space-y-1.5">
              <div className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
                {t(`${k}.value`)}
              </div>
              <div className="text-foreground/65 text-sm leading-snug">{t(`${k}.label`)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForBoth() {
  const t = useTranslations("home.forBoth");
  const customerPoints = ["c1", "c2", "c3", "c4"] as const;
  const contractorPoints = ["k1", "k2", "k3", "k4"] as const;
  return (
    <section className="border-foreground/10 bg-foreground/[0.02] border-b">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="border-foreground/10 bg-background rounded-2xl border p-7 sm:p-8">
            <div className="bg-foreground/5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
              {t("customer.label")}
            </div>
            <h3 className="mt-4 text-2xl font-semibold leading-tight">{t("customer.title")}</h3>
            <p className="text-foreground/65 mt-2 text-sm leading-relaxed">
              {t("customer.subtitle")}
            </p>
            <ul className="mt-6 space-y-3">
              {customerPoints.map((p) => (
                <li key={p} className="flex gap-2.5 text-sm">
                  <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                  <span>{t(`customer.points.${p}`)}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/lots/new"
              className="bg-foreground text-background hover:bg-foreground/90 mt-7 inline-flex h-11 items-center rounded-full px-5 text-sm font-medium transition-colors"
            >
              {t("customer.cta")} →
            </Link>
          </div>

          <div className="border-foreground/10 bg-background rounded-2xl border p-7 sm:p-8">
            <div className="bg-foreground/5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
              {t("contractor.label")}
            </div>
            <h3 className="mt-4 text-2xl font-semibold leading-tight">{t("contractor.title")}</h3>
            <p className="text-foreground/65 mt-2 text-sm leading-relaxed">
              {t("contractor.subtitle")}
            </p>
            <ul className="mt-6 space-y-3">
              {contractorPoints.map((p) => (
                <li key={p} className="flex gap-2.5 text-sm">
                  <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                  <span>{t(`contractor.points.${p}`)}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/lots"
              className="border-foreground/20 hover:bg-foreground/5 mt-7 inline-flex h-11 items-center rounded-full border px-5 text-sm font-medium transition-colors"
            >
              {t("contractor.cta")} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const t = useTranslations("home.faq");
  const items = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;
  return (
    <section className="border-foreground/10 border-b">
      <div className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-28">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />
        <div className="divide-foreground/10 border-foreground/10 mt-12 divide-y border-y">
          {items.map((key) => (
            <details key={key} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-medium">
                <span>{t(`items.${key}.q`)}</span>
                <span
                  aria-hidden
                  className="text-foreground/40 mt-0.5 shrink-0 text-xl leading-none transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="text-foreground/70 mt-3 text-sm leading-relaxed">
                {t(`items.${key}.a`)}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const t = useTranslations("home.finalCta");
  return (
    <section>
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <div className="from-foreground to-foreground/85 relative overflow-hidden rounded-3xl bg-gradient-to-br p-10 text-center sm:p-14">
          <h2 className="text-background text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-background/75 mx-auto mt-3 max-w-xl text-base leading-relaxed">
            {t("subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/sign-up"
              className="bg-background text-foreground hover:bg-background/90 inline-flex h-12 items-center rounded-full px-8 text-sm font-medium transition-colors"
            >
              {t("ctaPrimary")} →
            </Link>
            <Link
              href="/lots"
              className="border-background/30 text-background hover:bg-background/10 inline-flex h-12 items-center rounded-full border px-7 text-sm font-medium transition-colors"
            >
              {t("ctaSecondary")}
            </Link>
          </div>
          <p className="text-background/55 mt-6 text-xs">{t("footnote")}</p>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-foreground/65 mt-3 text-base leading-relaxed">{subtitle}</p>
      ) : null}
    </div>
  );
}
