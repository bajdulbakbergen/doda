"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/shared/lib/cn";

type Props = {
  userId: string;
  initialUnread: number;
};

/**
 * Bell-counter с realtime инкрементом.
 *
 * Архитектурный приём: храним только `delta` (изменения с момента mount),
 * отображаемое значение = derived state из `initialUnread + delta`. Это даёт:
 *   - сброс к серверному значению при ремаунте после navigation (initialUnread свежий)
 *   - инкремент при INSERT events
 *   - 0 на странице /notifications (там свежий initialUnread тоже 0 после mark-read)
 * И не требует setState внутри useEffect для синхронизации с пропами.
 */
export function NotificationsBellRealtime({ userId, initialUnread }: Props) {
  const t = useTranslations("notifications");
  const pathname = usePathname();
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // На странице /notifications не инкрементим — там и так показывается 0.
          if (pathname !== "/notifications") {
            setDelta((d) => d + 1);
          }
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, pathname]);

  const unread =
    pathname === "/notifications" ? 0 : Math.max(0, initialUnread + delta);

  return (
    <Link
      href="/notifications"
      aria-label={t("bellAria")}
      className="hover:bg-foreground/5 relative inline-flex size-9 items-center justify-center rounded-full transition-colors"
    >
      <span aria-hidden className="text-base">
        🔔
      </span>
      {unread > 0 ? (
        <span
          className={cn(
            "absolute -top-0.5 -right-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full",
            "bg-red-600 px-1 text-[10px] font-semibold leading-[18px] text-white",
          )}
        >
          {unread > 99 ? "99+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
