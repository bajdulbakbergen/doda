import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-static";

export default async function OfflinePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <div
        aria-hidden
        className="bg-foreground/5 mb-6 flex size-16 items-center justify-center rounded-full text-2xl"
      >
        📡
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Нет подключения</h1>
      <p className="text-foreground/60 mt-2 text-sm">
        Похоже, вы offline. Проверьте интернет-соединение и попробуйте обновить страницу.
      </p>
      <Link
        href="/"
        className="bg-foreground text-background hover:bg-foreground/90 mt-8 inline-flex h-10 items-center rounded-full px-5 text-sm font-medium transition-colors"
      >
        Перезагрузить
      </Link>
    </div>
  );
}
