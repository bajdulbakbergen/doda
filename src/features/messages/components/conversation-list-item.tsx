import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/shared/ui/avatar";
import { cn } from "@/shared/lib/cn";
import type { ConversationListItem as Item } from "../queries/get-conversations";

export function ConversationListItem({ item }: { item: Item }) {
  const t = useTranslations("messages.list");
  const format = useFormatter();
  const hasUnread = item.unreadCount > 0;
  const time = format.relativeTime(new Date(item.last_message_at));
  const contextLabel = item.lot
    ? t("contextLot", { title: item.lot.title })
    : item.post
      ? t("contextPost", { title: item.post.title })
      : null;

  return (
    <Link
      href={`/messages/${item.id}`}
      className={cn(
        "border-foreground/10 flex items-start gap-3 rounded-2xl border p-4 transition-colors",
        hasUnread ? "bg-foreground/[0.04] hover:bg-foreground/[0.06]" : "bg-foreground/[0.02] hover:bg-foreground/[0.04]",
      )}
    >
      {item.otherParty ? (
        <Avatar
          src={item.otherParty.avatar_url}
          alt={item.otherParty.display_name}
          size={40}
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-medium">
            {item.otherParty?.display_name ?? "—"}
          </h3>
          <span className="text-foreground/50 shrink-0 text-xs">{time}</span>
        </div>
        {contextLabel ? (
          <div className="text-foreground/50 mt-0.5 truncate text-xs">{contextLabel}</div>
        ) : null}
        {item.lastMessage ? (
          <p className={cn("mt-1 truncate text-sm", hasUnread ? "text-foreground font-medium" : "text-foreground/70")}>
            {item.lastMessage.body}
          </p>
        ) : (
          <p className="text-foreground/50 mt-1 text-sm italic">{t("noMessages")}</p>
        )}
      </div>
      {hasUnread ? (
        <span className="bg-foreground text-background flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
          {item.unreadCount > 9 ? "9+" : item.unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
