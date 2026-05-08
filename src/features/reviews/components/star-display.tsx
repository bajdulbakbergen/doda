import { cn } from "@/shared/lib/cn";

type Props = {
  rating: number; // 0..5
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
} as const;

export function StarDisplay({ rating, size = "md", className }: Props) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <span
      aria-label={`${rating.toFixed(1)} / 5`}
      className={cn("inline-flex items-center gap-0.5 leading-none", SIZES[size], className)}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = i < full || (i === full && hasHalf);
        return (
          <span
            key={i}
            aria-hidden
            className={filled ? "text-amber-500" : "text-foreground/15"}
          >
            ★
          </span>
        );
      })}
    </span>
  );
}
