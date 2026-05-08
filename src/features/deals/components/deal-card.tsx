import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/shared/ui/avatar";
import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import type { MyDeal } from "../queries/get-my-deals";

const STATUS_BADGE: Record<string, string> = {
  proposed: "bg-foreground/10 text-foreground/70",
  contracted: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  paid: "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200",
  delivered: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  closed: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  cancelled: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
};

export function DealCard({
  deal,
  currentUserId,
}: {
  deal: MyDeal;
  currentUserId: string;
}) {
  const t = useTranslations("deals");
  const tStatus = useTranslations("deals.status");
  const isCustomer = deal.customer_id === currentUserId;
  const counterparty = isCustomer ? deal.contractor : deal.customer;

  return (
    <Link
      href={`/deals/${deal.id}`}
      className="border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.04] block rounded-2xl border p-5 transition-colors"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium",
                STATUS_BADGE[deal.status],
              )}
            >
              {tStatus(deal.status)}
            </span>
            <span className="text-foreground/60">
              {t("card.role", { role: isCustomer ? t("card.asCustomer") : t("card.asContractor") })}
            </span>
          </div>
          <h3 className="truncate text-sm font-medium">{deal.lot.title}</h3>
          <div className="flex items-center gap-2 text-xs">
            <Avatar
              src={counterparty.avatar_url}
              alt={counterparty.display_name}
              size={20}
            />
            <span className="text-foreground/70">{counterparty.display_name}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-semibold tabular-nums">
            {formatPrice(deal.amount, deal.currency)}
          </div>
        </div>
      </div>
    </Link>
  );
}
