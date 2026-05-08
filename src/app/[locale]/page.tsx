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
      <HowItWorks />
      <Features />
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
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.10),rgba(16,185,129,0)_70%),radial-gradient(40%_40%_at_85%_30%,rgba(59,130,246,0.08),rgba(59,130,246,0)_70%)]"
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-6 pt-20 pb-24 sm:items-center sm:pt-28 sm:pb-32 sm:text-center">
        <span className="border-foreground/15 bg-foreground/[0.03] inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {t("badge")}
        </span>

        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:max-w-3xl sm:text-6xl">
          {t.rich("title", {
            accent: (chunks) => (
              <span className="bg-gradient-to-br from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
                {chunks}
              </span>
            ),
          })}
        </h1>

        <p className="text-foreground/70 max-w-2xl text-lg leading-relaxed sm:text-xl">
          {t("subtitle")}
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/lots/new"
            className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-12 items-center rounded-full px-7 text-sm font-medium transition-colors"
          >
            {t("ctaCustomer")} →
          </Link>
          <Link
            href="/lots"
            className="border-foreground/15 hover:bg-foreground/5 inline-flex h-12 items-center rounded-full border px-7 text-sm font-medium transition-colors"
          >
            {t("ctaContractor")}
          </Link>
        </div>

        <div className="text-foreground/60 mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-emerald-500">✓</span> {t("trustVerified")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-emerald-500">✓</span> {t("trustRealtime")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-emerald-500">✓</span> {t("trustTransparent")}
          </span>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const t = useTranslations("home.how");
  const steps = ["register", "publish", "auction", "close"] as const;
  return (
    <section className="border-foreground/10 border-b">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((key, i) => (
            <div
              key={key}
              className="border-foreground/10 bg-foreground/[0.02] relative rounded-2xl border p-6"
            >
              <div className="text-foreground/30 font-mono text-sm tabular-nums">
                0{i + 1}
              </div>
              <h3 className="mt-3 text-base font-semibold">{t(`steps.${key}.title`)}</h3>
              <p className="text-foreground/60 mt-2 text-sm leading-relaxed">
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
  transparency: "◯",
  realtime: "↻",
  antiSniping: "⏱",
  verification: "✓",
  ratings: "★",
  escrowFree: "₸",
};

function Features() {
  const t = useTranslations("home.features");
  const items = [
    "transparency",
    "realtime",
    "antiSniping",
    "verification",
    "ratings",
    "escrowFree",
  ] as const;
  return (
    <section className="border-foreground/10 border-b">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((key) => (
            <article
              key={key}
              className="border-foreground/10 hover:border-foreground/25 group rounded-2xl border p-6 transition-colors"
            >
              <div className="bg-foreground/5 group-hover:bg-foreground/10 flex size-9 items-center justify-center rounded-xl text-base transition-colors">
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

function ForBoth() {
  const t = useTranslations("home.forBoth");
  const customerPoints = ["c1", "c2", "c3", "c4"] as const;
  const contractorPoints = ["k1", "k2", "k3", "k4"] as const;
  return (
    <section className="border-foreground/10 bg-foreground/[0.02] border-b">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="border-foreground/10 bg-background rounded-2xl border p-7">
            <div className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
              {t("customer.label")}
            </div>
            <h3 className="mt-2 text-xl font-semibold">{t("customer.title")}</h3>
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
              className="border-foreground/15 hover:bg-foreground/5 mt-6 inline-flex h-10 items-center rounded-full border px-5 text-sm font-medium transition-colors"
            >
              {t("customer.cta")} →
            </Link>
          </div>

          <div className="border-foreground/10 bg-background rounded-2xl border p-7">
            <div className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
              {t("contractor.label")}
            </div>
            <h3 className="mt-2 text-xl font-semibold">{t("contractor.title")}</h3>
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
              className="border-foreground/15 hover:bg-foreground/5 mt-6 inline-flex h-10 items-center rounded-full border px-5 text-sm font-medium transition-colors"
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
  const items = ["q1", "q2", "q3", "q4", "q5"] as const;
  return (
    <section className="border-foreground/10 border-b">
      <div className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-28">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />
        <div className="divide-foreground/10 border-foreground/10 mt-10 divide-y border-y">
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
        <div className="border-foreground/10 from-foreground/[0.04] to-foreground/[0.01] relative overflow-hidden rounded-3xl border bg-gradient-to-br p-10 text-center sm:p-14">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("title")}</h2>
          <p className="text-foreground/65 mx-auto mt-3 max-w-xl text-base leading-relaxed">
            {t("subtitle")}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/sign-up"
              className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-12 items-center rounded-full px-7 text-sm font-medium transition-colors"
            >
              {t("ctaPrimary")} →
            </Link>
            <Link
              href="/lots"
              className="border-foreground/15 hover:bg-foreground/5 inline-flex h-12 items-center rounded-full border px-7 text-sm font-medium transition-colors"
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="max-w-2xl">
      <div className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}
