import { setRequestLocale, getTranslations } from "next-intl/server";
import { SignInForm } from "@/features/auth/components/sign-in-form";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("signInTitle") };
}

export default async function SignInPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { next } = await searchParams;
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t("signInTitle")}</h1>
        <p className="text-foreground/60 text-sm">{t("signInSubtitle")}</p>
      </div>
      <SignInForm next={next} />
    </div>
  );
}
