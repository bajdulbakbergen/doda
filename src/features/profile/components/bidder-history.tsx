import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/shared/lib/format";
import { LotStatusBadge } from "@/features/lots/components/lot-status-badge";
import type { BidderHistoryItem } from "@/features/lots/queries/get-bidder-history";

type Props = {
  items: BidderHistoryItem[];
  locale: string;
};

export function BidderHistory({ items, locale }: Props) {
  const t = useTranslations("profile.history");
  const format = useFormatter();

  if (items.length === 0) {
    return (
      <section className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-6">
        <h2 className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
          {t("title")}
        </h2>
        <p className="text-foreground/60 mt-2 text-sm">{t("empty")}</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
        {t("title")}
      </h2>

      <ul className="space-y-2">
        {items.map(({ bid, lot }) => {
          const isWinner = lot.winner_bid_id === bid.id;
          const placedAt = format.dateTime(new Date(bid.updated_at), {
            dateStyle: "medium",
          });
          const categoryName = lot.category
            ? locale === "kk"
              ? lot.category.name_kk
              : lot.category.name_ru
            : null;

          return (
            <li
              key={bid.id}
              className="border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.04] rounded-2xl border p-4 transition-colors"
            >
              <Link href={`/lots/${lot.id}`} className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <LotStatusBadge status={lot.status} />
                    {isWinner ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                        ✓ {t("won")}
                      </span>
                    ) : null}
                    {categoryName ? (
                      <span className="text-foreground/60">{categoryName}</span>
                    ) : null}
                  </div>
                  <h3 className="truncate text-sm font-medium">{lot.title}</h3>
                  <div className="text-foreground/50 text-xs">
                    {t("placedAt", { date: placedAt })}
                    {bid.change_count > 0 ? <> · {t("changes", { count: bid.change_count })}</> : null}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-semibold tabular-nums">
                    {formatPrice(bid.amount, lot.currency)}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
