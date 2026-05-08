import { useTranslations } from "next-intl";
import type { Database } from "@/lib/supabase/types";
import { cn } from "@/shared/lib/cn";

type Status = Database["public"]["Enums"]["deal_status"];

const ORDER: Status[] = ["proposed", "contracted", "paid", "delivered", "closed"];

export function DealStatusTimeline({ status }: { status: Status }) {
  const t = useTranslations("deals.status");

  const isCancelled = status === "cancelled";
  const currentIdx = isCancelled ? -1 : ORDER.indexOf(status);

  return (
    <div className="space-y-4">
      <ol className="flex items-center gap-1">
        {ORDER.map((step, idx) => {
          const isPast = !isCancelled && idx < currentIdx;
          const isCurrent = !isCancelled && idx === currentIdx;
          const isFuture = isCancelled || idx > currentIdx;

          return (
            <li key={step} className="flex flex-1 items-center gap-1 last:flex-none">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  isPast && "border-emerald-500 bg-emerald-500 text-white",
                  isCurrent && "border-foreground bg-foreground text-background",
                  isFuture && "border-foreground/15 text-foreground/40",
                )}
              >
                {isPast ? "✓" : idx + 1}
              </div>
              {idx < ORDER.length - 1 ? (
                <div
                  className={cn(
                    "h-px flex-1 transition-colors",
                    isPast ? "bg-emerald-500" : "bg-foreground/15",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-5 gap-1 text-center">
        {ORDER.map((step, idx) => (
          <div
            key={step}
            className={cn(
              "text-xs leading-tight",
              !isCancelled && idx <= currentIdx
                ? "text-foreground/80 font-medium"
                : "text-foreground/50",
            )}
          >
            {t(step)}
          </div>
        ))}
      </div>

      {isCancelled ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          {t("cancelled")}
        </div>
      ) : null}
    </div>
  );
}
