import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/shared/ui/avatar";
import { cn } from "@/shared/lib/cn";
import { StarDisplay } from "@/features/reviews/components/star-display";
import type { EnrichedNotification } from "../queries/get-notifications";

type Props = { item: EnrichedNotification };

export function NotificationItem({ item }: Props) {
  const t = useTranslations("notifications.item");
  const tDealStatus = useTranslations("deals.status");
  const format = useFormatter();
  const placedAt = format.relativeTime(new Date(item.created_at));
  const isUnread = !item.read_at;
  const payload = (item.payload ?? {}) as Record<string, unknown>;

  let body: React.ReactNode = null;
  let href: string | null = null;

  switch (item.type) {
    case "lot_bid_placed": {
      const amount = typeof payload.amount === "number" ? payload.amount : null;
      const bidder = item.meta.bidder;
      const lot = item.meta.lot;
      href = lot ? `/lots/${lot.id}` : null;
      body = (
        <div className="flex items-start gap-3">
          {bidder ? <Avatar src={bidder.avatar_url} alt={bidder.display_name} size={32} /> : null}
          <div className="flex-1 text-sm">
            {t.rich("lot_bid_placed", {
              bidder: bidder?.display_name ?? "-",
              lot: lot?.title ?? "-",
              amount: amount ? `${amount} ₸` : "-",
              b: (chunks) => <strong className="font-medium">{chunks}</strong>,
            })}
          </div>
        </div>
      );
      break;
    }
    case "lot_winner_selected": {
      const lot = item.meta.lot;
      href = lot ? `/lots/${lot.id}` : null;
      body = (
        <div className="text-sm">
          {t.rich("lot_winner_selected", {
            lot: lot?.title ?? "-",
            b: (chunks) => <strong className="font-medium">{chunks}</strong>,
          })}
        </div>
      );
      break;
    }
    case "deal_status_changed": {
      const newStatus =
        typeof payload.new_status === "string" ? payload.new_status : null;
      const lot = item.meta.lot;
      const deal = item.meta.deal;
      href = deal ? `/deals/${deal.id}` : null;
      body = (
        <div className="text-sm">
          {t.rich("deal_status_changed", {
            lot: lot?.title ?? "-",
            status: newStatus ? tDealStatus(newStatus as never) : "-",
            b: (chunks) => <strong className="font-medium">{chunks}</strong>,
          })}
        </div>
      );
      break;
    }
    case "review_received": {
      const reviewer = item.meta.reviewer;
      const rating = typeof payload.rating === "number" ? payload.rating : 0;
      const deal = item.meta.deal;
      href = deal ? `/deals/${deal.id}` : reviewer ? `/u/${reviewer.slug}` : null;
      body = (
        <div className="flex items-start gap-3">
          {reviewer ? (
            <Avatar src={reviewer.avatar_url} alt={reviewer.display_name} size={32} />
          ) : null}
          <div className="flex-1 space-y-1 text-sm">
            <div>
              {t.rich("review_received", {
                reviewer: reviewer?.display_name ?? "-",
                b: (chunks) => <strong className="font-medium">{chunks}</strong>,
              })}
            </div>
            <StarDisplay rating={rating} size="sm" />
          </div>
        </div>
      );
      break;
    }
    case "message_received": {
      const conversationId =
        typeof payload.conversation_id === "string" ? payload.conversation_id : null;
      const senderId =
        typeof payload.sender_id === "string" ? payload.sender_id : null;
      const sender = item.meta.bidder ?? item.meta.reviewer;
      href = conversationId ? `/messages/${conversationId}` : null;
      body = (
        <div className="flex items-start gap-3">
          {sender ? <Avatar src={sender.avatar_url} alt={sender.display_name} size={32} /> : null}
          <div className="flex-1 text-sm">
            {t.rich("message_received", {
              sender: sender?.display_name ?? "-",
              b: (chunks) => <strong className="font-medium">{chunks}</strong>,
            })}
          </div>
        </div>
      );
      void senderId;
      break;
    }
    case "lot_invite_received": {
      const lot = item.meta.lot;
      href = lot ? `/lots/${lot.id}` : null;
      body = (
        <div className="text-sm">
          {t.rich("lot_invite_received", {
            lot: lot?.title ?? "-",
            b: (chunks) => <strong className="font-medium">{chunks}</strong>,
          })}
        </div>
      );
      break;
    }
    default: {
      body = (
        <div className="text-foreground/60 text-sm font-mono text-xs">
          {item.type}
        </div>
      );
    }
  }

  const content = (
    <div
      className={cn(
        "border-foreground/10 rounded-2xl border p-4 transition-colors",
        isUnread ? "bg-foreground/[0.04]" : "bg-foreground/[0.01]",
      )}
    >
      {body}
      <div className="text-foreground/50 mt-2 text-xs">{placedAt}</div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}
