import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

const variants = {
  info: "border-foreground/10 bg-foreground/5 text-foreground",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
} as const;

type AlertProps = {
  variant?: keyof typeof variants;
  children: ReactNode;
  className?: string;
};

export function Alert({ variant = "info", className, children }: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn("rounded-xl border px-4 py-3 text-sm", variants[variant], className)}
    >
      {children}
    </div>
  );
}
