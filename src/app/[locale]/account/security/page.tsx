import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { MfaSection } from "@/features/auth/components/mfa-section";
import { getCurrentProfile } from "@/features/profile/queries/get-profile";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "security" });
  return { title: t("pageTitle") };
}

export default async function SecurityPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  if (!profile) redirect({ href: "/auth/sign-in?next=/account/security", locale });

  const t = await getTranslations({ locale, namespace: "security" });

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="mb-10 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("pageTitle")}</h1>
        <p className="text-foreground/60 text-sm">{t("pageSubtitle")}</p>
      </header>

      <MfaSection />
    </div>
  );
}
