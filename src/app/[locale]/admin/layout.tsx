import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/features/admin/queries/require-admin";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="border-foreground/10 mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="text-base font-semibold">
            Admin
          </Link>
          <span className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            Restricted
          </span>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link
            href="/admin"
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            Дашборд
          </Link>
          <Link
            href="/admin/users"
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            Пользователи
          </Link>
          <Link
            href="/admin/verifications"
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            Верификации
          </Link>
          <Link
            href="/"
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            ← На сайт
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
