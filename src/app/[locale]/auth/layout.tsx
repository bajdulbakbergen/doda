import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-6 py-12 sm:py-20">
      <Link href="/" className="mb-8 text-lg font-semibold tracking-tight">
        {siteConfig.name}
      </Link>
      <div className="border-foreground/10 bg-foreground/[0.02] w-full rounded-3xl border p-8 sm:p-10">
        {children}
      </div>
    </div>
  );
}
