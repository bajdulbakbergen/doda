import { useTranslations } from "next-intl";
import { StarDisplay } from "./star-display";
import type { RatingStats } from "../queries/get-rating-stats";

export function RatingSummary({ stats }: { stats: RatingStats }) {
  const t = useTranslations("reviews.summary");

  return (
    <div className="border-foreground/10 bg-foreground/[0.02] grid grid-cols-2 gap-x-8 gap-y-4 rounded-2xl border p-5 sm:grid-cols-4">
      <Stat label={t("rating")}>
        {stats.totalReviews > 0 ? (
          <div className="space-y-1">
            <div className="text-2xl font-semibold tabular-nums">
              {stats.averageRating.toFixed(1)}
            </div>
            <StarDisplay rating={stats.averageRating} size="sm" />
            <div className="text-foreground/50 text-xs">
              {t("ofReviews", { count: stats.totalReviews })}
            </div>
          </div>
        ) : (
          <div className="text-foreground/50 text-sm">{t("noReviews")}</div>
        )}
      </Stat>
      <Stat label={t("totalDeals")}>
        <div className="text-2xl font-semibold tabular-nums">{stats.totalDeals}</div>
        <div className="text-foreground/50 text-xs">
          {t("split", { customer: stats.asCustomer, contractor: stats.asContractor })}
        </div>
      </Stat>
      <Stat label={t("completed")}>
        <div className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
          {stats.completedDeals}
        </div>
        <div className="text-foreground/50 text-xs">
          {stats.totalDeals > 0
            ? t("percentage", {
                pct: Math.round((stats.completedDeals / stats.totalDeals) * 100),
              })
            : "—"}
        </div>
      </Stat>
      <Stat label={t("cancelled")}>
        <div className="text-2xl font-semibold tabular-nums">{stats.cancelledDeals}</div>
      </Stat>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
        {label}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
