import { useTranslations } from "next-intl";
import type { Database } from "@/lib/supabase/types";
import { cn } from "@/shared/lib/cn";

type Status = Database["public"]["Enums"]["lot_status"];

const styles: Record<Status, string> = {
  draft: "bg-foreground/10 text-foreground/70",
  open: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  closing: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  closed: "bg-foreground/10 text-foreground/70",
  cancelled: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
};

export function LotStatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const t = useTranslations("lots.status");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status],
        className,
      )}
    >
      {t(status)}
    </span>
  );
}
