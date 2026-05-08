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

export function NotificationsBellRealtime({ userId, initialUnread }: Props) {
  const t = useTranslations("notifications");
  const pathname = usePathname();
  const [unread, setUnread] = useState(initialUnread);

  // Re-sync from server when pathname changes (e.g. user navigates to /notifications and reads them).
  useEffect(() => {
    setUnread(initialUnread);
  }, [initialUnread]);

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
        () => setUnread((c) => c + 1),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  // Сбрасываем счётчик когда юзер на странице уведомлений (server отметит при visit).
  useEffect(() => {
    if (pathname === "/notifications") setUnread(0);
  }, [pathname]);

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
