import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import { AvatarUpload } from "@/features/profile/components/avatar-upload";
import { ProfileEditForm } from "@/features/profile/components/profile-edit-form";
import { getCurrentProfile } from "@/features/profile/queries/get-profile";
import { getCurrentVerification } from "@/features/verification/queries/get-verification";
import { VerificationBanner } from "@/features/verification/components/verification-banner";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("pageTitle") };
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect({ href: "/auth/sign-in?next=/account", locale });
  }

  const verification = await getCurrentVerification();
  const t = await getTranslations({ locale, namespace: "account" });

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("pageTitle")}</h1>
          <p className="text-foreground/60 mt-1 text-sm">{t("pageSubtitle")}</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-sm">
          <Link
            href={`/u/${profile.slug}`}
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            {t("viewPublic")} →
          </Link>
          <Link
            href="/account/security"
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            {t("securityLink")} →
          </Link>
        </div>
      </header>

      <div className="mb-6">
        <VerificationBanner verification={verification} isVerified={profile.is_verified} />
      </div>

      <div className="space-y-10">
        <section className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-6">
          <AvatarUpload currentUrl={profile.avatar_url} displayName={profile.display_name} />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{t("profileSection")}</h2>
          <ProfileEditForm profile={profile} />
        </section>
      </div>
    </div>
  );
}
