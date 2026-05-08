import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LotCard } from "@/features/lots/components/lot-card";
import {
  getCategoryBySlug,
  localizedCategoryName,
} from "@/features/lots/queries/get-categories";
import { getLots } from "@/features/lots/queries/get-lots";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return { title: "404" };
  return { title: localizedCategoryName(cat, locale) };
}

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();

  const [lots, t] = await Promise.all([
    getLots({ categorySlug: slug }),
    getTranslations({ locale, namespace: "lots" }),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <nav className="text-foreground/60 mb-4 text-sm">
        <Link href="/categories" className="hover:text-foreground transition-colors">
          ← {t("backToCategories")}
        </Link>
      </nav>

      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {localizedCategoryName(cat, locale)}
        </h1>
        <p className="text-foreground/60 text-sm">
          {t("catalog.lotsInCategory", { count: lots.length })}
        </p>
      </header>

      {lots.length === 0 ? (
        <div className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-12 text-center">
          <p className="text-foreground/60">{t("catalog.empty")}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {lots.map((lot) => (
            <LotCard key={lot.id} lot={lot} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
