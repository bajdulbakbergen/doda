"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Avatar } from "@/shared/ui/avatar";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { SelectWinnerForm } from "@/features/lots/components/select-winner-form";
import type { BidWithBidder } from "../queries/get-bids";

type Props = {
  lotId: string;
  initialBids: BidWithBidder[];
  currency: string;
  currentUserId: string | null;
  ownerId: string;
  /** Лот закрыт без победителя и текущий юзер — владелец */
  canSelectWinner: boolean;
  winnerBidId: string | null;
};

export function BidsListRealtime({
  lotId,
  initialBids,
  currency,
  currentUserId,
  ownerId,
  canSelectWinner,
  winnerBidId,
}: Props) {
  const t = useTranslations("bids.list");
  const format = useFormatter();
  const [bids, setBids] = useState(initialBids);

  useEffect(() => {
    const supabase = createClient();

    async function refetch() {
      const { data } = await supabase
        .from("bids")
        .select(
          `*, bidder:profiles!bids_bidder_id_fkey(id, slug, display_name, avatar_url, is_verified)`,
        )
        .eq("lot_id", lotId)
        .eq("is_active", true)
        .order("amount", { ascending: true });
      if (data) setBids(data as BidWithBidder[]);
    }

    const channel = supabase
      .channel(`lot-bids-${lotId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bids",
          filter: `lot_id=eq.${lotId}`,
        },
        () => {
          void refetch();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [lotId]);

  if (bids.length === 0) {
    return (
      <div className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-6 text-center">
        <p className="text-foreground/60 text-sm">{t("empty")}</p>
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {bids.map((bid, idx) => {
        const isMine = currentUserId === bid.bidder_id;
        const isWinner = winnerBidId === bid.id;
        const placedAt = format.dateTime(new Date(bid.updated_at), {
          dateStyle: "short",
          timeStyle: "short",
        });

        return (
          <li
            key={bid.id}
            className={cn(
              "border-foreground/10 flex items-center gap-3 rounded-2xl border p-3 transition-colors",
              idx === 0 && !isWinner && "bg-emerald-50/50 dark:bg-emerald-950/20",
              isWinner && "bg-amber-50 dark:bg-amber-950/30 border-amber-300",
              isMine && "ring-foreground/20 ring-2 ring-offset-2 ring-offset-background",
            )}
          >
            <span className="text-foreground/40 w-6 text-center font-mono text-xs">
              {idx + 1}
            </span>
            {bid.bidder ? (
              <Link
                href={`/u/${bid.bidder.slug}`}
                className="flex flex-1 items-center gap-2.5 transition-opacity hover:opacity-80"
              >
                <Avatar src={bid.bidder.avatar_url} alt={bid.bidder.display_name} size={32} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{bid.bidder.display_name}</div>
                  <div className="text-foreground/50 text-xs">
                    {placedAt}
                    {bid.change_count > 0 ? (
                      <> · {t("changesCount", { count: bid.change_count })}</>
                    ) : null}
                    {isMine ? (
                      <>
                        {" "}
                        · <span className="font-medium">{t("yours")}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </Link>
            ) : (
              <div className="text-foreground/60 flex-1 text-sm">{t("anonymous")}</div>
            )}
            <div className="text-right">
              <div className="text-base font-semibold tabular-nums">
                {formatPrice(bid.amount, currency)}
              </div>
              {isWinner ? (
                <div className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  {t("winner")}
                </div>
              ) : null}
            </div>
            {canSelectWinner && currentUserId === ownerId && !winnerBidId ? (
              <div className="ml-2">
                <SelectWinnerForm lotId={lotId} bidId={bid.id} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
