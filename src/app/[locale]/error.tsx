"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/navigation";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <div
        aria-hidden
        className="bg-foreground/5 mb-6 flex size-16 items-center justify-center rounded-full text-2xl"
      >
        ⚠
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Что-то пошло не так</h1>
      <p className="text-foreground/60 mt-2 text-sm">
        Мы уже знаем об ошибке. Попробуйте обновить страницу или вернуться на главную.
      </p>
      {error.digest ? (
        <code className="bg-foreground/5 mt-4 rounded-lg px-2 py-1 font-mono text-xs">
          {error.digest}
        </code>
      ) : null}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium transition-colors"
        >
          Попробовать снова
        </button>
        <Link
          href="/"
          className="border-foreground/15 hover:bg-foreground/5 inline-flex h-10 items-center rounded-full border px-5 text-sm font-medium transition-colors"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
