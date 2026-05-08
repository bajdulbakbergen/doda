import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { Alert } from "@/shared/ui/alert";
import { Link } from "@/i18n/navigation";
import { LotForm } from "@/features/lots/components/lot-form";
import { getCategories } from "@/features/lots/queries/get-categories";
import { getCurrentProfile } from "@/features/profile/queries/get-profile";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lots.form" });
  return { title: t("pageTitle") };
}

export default async function NewLotPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect({ href: "/auth/sign-in?next=/lots/new", locale });
  }

  const t = await getTranslations({ locale, namespace: "lots.form" });

  if (!profile.is_verified) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        <header className="mb-6 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{t("pageTitle")}</h1>
        </header>
        <Alert variant="warning">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{t("notVerifiedBanner")}</span>
            <Link
              href="/account/verification"
              className="font-medium underline underline-offset-2"
            >
              {t("verifyCta")} →
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  const categories = await getCategories();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("pageTitle")}</h1>
        <p className="text-foreground/60 text-sm">{t("pageSubtitle")}</p>
      </header>
      <LotForm categories={categories} locale={locale} />
    </div>
  );
}
