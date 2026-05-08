import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategories } from "@/features/lots/queries/get-categories";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "categories" });
  return { title: t("title") };
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [categories, t] = await Promise.all([
    getCategories(),
    getTranslations({ locale, namespace: "categories" }),
  ]);

  const topLevel = categories.filter((c) => !c.parent_id);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-foreground/60 text-sm">{t("subtitle")}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {topLevel.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.04] rounded-2xl border p-5 transition-colors"
          >
            <h2 className="text-base font-semibold">
              {locale === "kk" ? cat.name_kk : cat.name_ru}
            </h2>
            <div className="text-foreground/50 mt-1 text-xs">/{cat.slug}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
