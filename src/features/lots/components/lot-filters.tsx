"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { Category } from "../queries/get-categories";

type Props = {
  categories: Category[];
  selectedCategorySlug?: string;
  selectedStatus?: string;
  region?: string;
  locale: string;
};

export function LotFilters({
  categories,
  selectedCategorySlug,
  selectedStatus,
  region,
  locale,
}: Props) {
  const t = useTranslations("lots");
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function update(name: string, value: string) {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    if (value) params.set(name, value);
    else params.delete(name);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="border-foreground/10 bg-foreground/[0.02] flex flex-wrap items-end gap-3 rounded-2xl border p-4">
      <div className="flex-1 space-y-1.5 min-w-[180px]">
        <label htmlFor="filter-category" className="text-foreground/60 text-xs font-medium">
          {t("filters.category")}
        </label>
        <select
          id="filter-category"
          value={selectedCategorySlug ?? ""}
          disabled={pending}
          onChange={(e) => update("category", e.target.value)}
          className="border-foreground/15 bg-background h-10 w-full rounded-xl border px-3 text-sm"
        >
          <option value="">{t("filters.allCategories")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {locale === "kk" ? cat.name_kk : cat.name_ru}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 space-y-1.5 min-w-[160px]">
        <label htmlFor="filter-region" className="text-foreground/60 text-xs font-medium">
          {t("filters.region")}
        </label>
        <input
          id="filter-region"
          type="text"
          defaultValue={region ?? ""}
          disabled={pending}
          placeholder={t("filters.regionPlaceholder")}
          onBlur={(e) => update("region", e.target.value.trim())}
          className="border-foreground/15 bg-background h-10 w-full rounded-xl border px-3 text-sm"
        />
      </div>

      <div className="space-y-1.5 min-w-[140px]">
        <label htmlFor="filter-status" className="text-foreground/60 text-xs font-medium">
          {t("filters.status")}
        </label>
        <select
          id="filter-status"
          value={selectedStatus ?? ""}
          disabled={pending}
          onChange={(e) => update("status", e.target.value)}
          className="border-foreground/15 bg-background h-10 w-full rounded-xl border px-3 text-sm"
        >
          <option value="">{t("filters.statusActive")}</option>
          <option value="open">{t("status.open")}</option>
          <option value="closing">{t("status.closing")}</option>
          <option value="closed">{t("status.closed")}</option>
        </select>
      </div>
    </div>
  );
}
