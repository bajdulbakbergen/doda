import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Props = {
  title: string;
  version: string;
  publishedAt: string;
  children: ReactNode;
};

/**
 * Универсальный layout для юр. документа: шапка с заголовком/версией/датой,
 * типографика prose-like для длинных текстов, sticky table-of-contents в идеале -
 * пока без неё, добавим если документы вырастут.
 */
export function LegalDocLayout({ title, version, publishedAt, children }: Props) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <nav className="text-foreground/60 mb-6 text-sm">
        <Link href="/" className="hover:text-foreground transition-colors">
          ← На главную
        </Link>
      </nav>
      <header className="border-foreground/10 mb-10 border-b pb-6">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {title}
        </h1>
        <div className="text-foreground/55 mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
          <span>Версия {version}</span>
          <span>Действует с {publishedAt}</span>
        </div>
      </header>
      <article className="legal-prose space-y-5 text-[15px] leading-relaxed">
        {children}
      </article>
    </div>
  );
}
