import { setRequestLocale, getTranslations } from "next-intl/server";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("signUpTitle") };
}

export default async function SignUpPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t("signUpTitle")}</h1>
        <p className="text-foreground/60 text-sm">{t("signUpSubtitle")}</p>
      </div>
      <SignUpForm />
    </div>
  );
}
