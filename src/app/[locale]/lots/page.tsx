import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { Pagination } from "@/shared/components/ui/pagination";
import { LotCard } from "@/features/lots/components/lot-card";
import { LotFilters } from "@/features/lots/components/lot-filters";
import { getLots } from "@/features/lots/queries/get-lots";
import { getCategories } from "@/features/lots/queries/get-categories";
import { getCurrentProfile } from "@/features/profile/queries/get-profile";
import type { Database } from "@/lib/supabase/types";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    region?: string;
    status?: string;
    page?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lots" });
  return { title: t("catalog.title") };
}

const VALID_STATUSES = new Set(["draft", "open", "closing", "closed", "cancelled"]);

export default async function LotsCatalogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "lots" });
  const pageNum = Math.max(1, Number(search.page) || 1);

  const [categories, paged, profile] = await Promise.all([
    getCategories(),
    getLots({
      categorySlug: search.category,
      region: search.region,
      status: VALID_STATUSES.has(search.status ?? "")
        ? (search.status as Database["public"]["Enums"]["lot_status"])
        : undefined,
      page: pageNum,
    }),
    getCurrentProfile(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("catalog.title")}</h1>
          <p className="text-foreground/60 mt-1 text-sm">{t("catalog.subtitle")}</p>
        </div>
        {profile?.is_verified ? (
          <Link href="/lots/new">
            <Button>{t("catalog.createCta")}</Button>
          </Link>
        ) : null}
      </header>

      <div className="mb-6">
        <LotFilters
          categories={categories}
          selectedCategorySlug={search.category}
          selectedStatus={search.status}
          region={search.region}
          locale={locale}
        />
      </div>

      {paged.lots.length === 0 ? (
        <div className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-12 text-center">
          <p className="text-foreground/60">{t("catalog.empty")}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {paged.lots.map((lot) => (
              <LotCard key={lot.id} lot={lot} locale={locale} />
            ))}
          </div>
          <Pagination
            pathname="/lots"
            searchParams={{
              category: search.category,
              region: search.region,
              status: search.status,
            }}
            page={paged.page}
            totalPages={paged.totalPages}
          />
        </>
      )}
    </div>
  );
}
