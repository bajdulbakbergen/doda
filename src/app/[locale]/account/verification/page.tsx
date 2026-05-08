import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { Alert } from "@/shared/ui/alert";
import { VerificationForm } from "@/features/verification/components/verification-form";
import { getCurrentVerification } from "@/features/verification/queries/get-verification";
import { getCurrentProfile } from "@/features/profile/queries/get-profile";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "verification" });
  return { title: t("pageTitle") };
}

export default async function VerificationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect({ href: "/auth/sign-in?next=/account/verification", locale });
  }

  const verification = await getCurrentVerification();
  const t = await getTranslations({ locale, namespace: "verification" });

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("pageTitle")}</h1>
        <p className="text-foreground/60 text-sm leading-relaxed">{t("pageSubtitle")}</p>
      </header>

      {profile.is_verified ? (
        <Alert variant="success">{t("status.approved")}</Alert>
      ) : verification?.status === "pending" ? (
        <Alert variant="info">{t("status.pending")}</Alert>
      ) : verification?.status === "rejected" ? (
        <div className="space-y-6">
          <Alert variant="error">
            <div className="space-y-1">
              <p>{t("status.rejected")}</p>
              {verification.reviewer_notes ? (
                <p className="text-xs opacity-80">{verification.reviewer_notes}</p>
              ) : null}
            </div>
          </Alert>
          <VerificationForm />
        </div>
      ) : (
        <VerificationForm />
      )}
    </div>
  );
}
