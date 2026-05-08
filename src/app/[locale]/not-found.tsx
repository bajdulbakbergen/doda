import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <div className="text-foreground/30 text-7xl font-semibold tracking-tight">404</div>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Страница не найдена</h1>
      <p className="text-foreground/60 mt-2 text-sm">
        Возможно, лот или профиль были удалены, или вы перешли по неактуальной ссылке.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/lots"
          className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium transition-colors"
        >
          Перейти к лотам
        </Link>
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
