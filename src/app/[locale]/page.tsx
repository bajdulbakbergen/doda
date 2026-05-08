import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Home />;
}

function Home() {
  const t = useTranslations("home");

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
      <section className="space-y-8">
        <div className="space-y-5 max-w-3xl">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="text-foreground/70 text-lg leading-relaxed">{t("hero.subtitle")}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/lots/new"
            className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium transition-colors"
          >
            {t("hero.ctaCustomer")}
          </Link>
          <Link
            href="/lots"
            className="border-foreground/15 hover:bg-foreground/5 inline-flex h-11 items-center justify-center rounded-full border px-6 text-sm font-medium transition-colors"
          >
            {t("hero.ctaContractor")}
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(["transparency", "realtime", "verification"] as const).map((key) => (
          <article
            key={key}
            className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-6"
          >
            <h3 className="text-lg font-semibold">{t(`features.${key}.title`)}</h3>
            <p className="text-foreground/70 mt-2 text-sm leading-relaxed">
              {t(`features.${key}.body`)}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
