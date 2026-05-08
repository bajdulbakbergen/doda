import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/shared/ui/avatar";
import { formatPrice } from "@/shared/lib/format";
import type { LotWithMeta } from "../queries/get-lots";
import { LotStatusBadge } from "./lot-status-badge";
import { LotDeadline } from "./lot-deadline";

type Props = { lot: LotWithMeta; locale: string };

export function LotCard({ lot, locale }: Props) {
  const t = useTranslations("lots");
  const categoryName = lot.category
    ? locale === "kk"
      ? lot.category.name_kk
      : lot.category.name_ru
    : null;

  return (
    <Link
      href={`/lots/${lot.id}`}
      className="border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.04] block rounded-2xl border p-5 transition-colors"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <LotStatusBadge status={lot.status} />
            {categoryName ? (
              <span className="text-foreground/50">{categoryName}</span>
            ) : null}
            <span className="text-foreground/40">·</span>
            <span className="text-foreground/60">{lot.region}</span>
          </div>
          <h3 className="text-lg font-semibold leading-snug">{lot.title}</h3>
        </div>
        {lot.owner ? (
          <div className="flex items-center gap-2 text-xs">
            <Avatar src={lot.owner.avatar_url} alt={lot.owner.display_name} size={24} />
            <span className="text-foreground/70">{lot.owner.display_name}</span>
          </div>
        ) : null}
      </div>

      <div className="text-foreground/60 mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span>
          {t("card.bidsCount", { count: lot.bid_count })}
        </span>
        {lot.lowest_bid != null ? (
          <span>
            {t("card.bestBid")}{" "}
            <span className="text-foreground font-medium">
              {formatPrice(lot.lowest_bid, lot.currency)}
            </span>
          </span>
        ) : lot.starting_price != null ? (
          <span>
            {t("card.startingPrice")}{" "}
            <span className="text-foreground font-medium">
              {formatPrice(lot.starting_price, lot.currency)}
            </span>
          </span>
        ) : null}
        <span>
          {t("card.deadline")}{" "}
          <LotDeadline deadlineISO={lot.deadline_at} />
        </span>
      </div>
    </Link>
  );
}
