import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "border-foreground/15 bg-background text-foreground placeholder:text-foreground/40",
        "focus-visible:border-foreground/40 focus-visible:ring-foreground/10 focus-visible:ring-2 focus-visible:outline-none",
        "w-full rounded-xl border px-4 py-3 text-sm transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
