"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/cn";

type Props = {
  deadlineISO: string;
  className?: string;
};

function format(diffMs: number, t: (key: string, values?: Record<string, number>) => string): string {
  if (diffMs <= 0) return t("ended");
  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (days > 0) return t("daysHours", { days, hours });
  if (hours > 0) return t("hoursMinutes", { hours, minutes });
  if (minutes > 0) return t("minutesSeconds", { minutes, seconds });
  return t("seconds", { seconds });
}

export function LotDeadline({ deadlineISO, className }: Props) {
  const t = useTranslations("lots.deadline");
  const target = new Date(deadlineISO).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = target - now;
  const isCritical = diff > 0 && diff < 3 * 60 * 1000;
  const isEnded = diff <= 0;

  return (
    <span
      className={cn(
        "tabular-nums",
        isEnded && "text-foreground/60",
        isCritical && "text-amber-600 dark:text-amber-400 font-medium",
        className,
      )}
    >
      {format(diff, t)}
    </span>
  );
}
