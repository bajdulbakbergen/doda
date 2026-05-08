import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("checkEmailTitle") };
}

export default async function CheckEmailPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <div className="space-y-6 text-center">
      <div
        aria-hidden
        className="bg-foreground/10 mx-auto flex size-14 items-center justify-center rounded-full text-2xl"
      >
        ✉
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("checkEmailTitle")}</h1>
        <p className="text-foreground/60 text-sm leading-relaxed">{t("checkEmailBody")}</p>
      </div>
      <Link
        href="/auth/sign-in"
        className="text-foreground/70 hover:text-foreground inline-block text-sm transition-colors"
      >
        {t("backToSignIn")}
      </Link>
    </div>
  );
}
