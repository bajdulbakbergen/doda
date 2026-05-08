import { useTranslations } from "next-intl";
import type { Database } from "@/lib/supabase/types";
import { cn } from "@/shared/lib/cn";

type PostType = Database["public"]["Enums"]["post_type"];

const styles: Record<PostType, string> = {
  case: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  product: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  news: "bg-foreground/10 text-foreground/70",
  media: "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200",
};

export function PostTypeBadge({ type, className }: { type: PostType; className?: string }) {
  const t = useTranslations("posts.type");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[type],
        className,
      )}
    >
      {t(type)}
    </span>
  );
}
