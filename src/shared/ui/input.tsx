import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "border-foreground/15 bg-background text-foreground placeholder:text-foreground/40",
        "focus-visible:border-foreground/40 focus-visible:ring-foreground/10 focus-visible:ring-2 focus-visible:outline-none",
        "h-11 w-full rounded-xl border px-4 text-sm transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
