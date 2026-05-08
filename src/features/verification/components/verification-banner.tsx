import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Alert } from "@/shared/ui/alert";
import type { Verification } from "../queries/get-verification";

type Props = {
  verification: Verification | null;
  isVerified: boolean;
};

export async function VerificationBanner({ verification, isVerified }: Props) {
  const t = await getTranslations("verification");

  if (isVerified) return null;

  if (verification?.status === "pending") {
    return <Alert variant="info">{t("banner.pending")}</Alert>;
  }

  return (
    <Alert variant="warning">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>{t("banner.notVerified")}</span>
        <Link
          href="/account/verification"
          className="font-medium underline underline-offset-2"
        >
          {t("banner.startCta")} →
        </Link>
      </div>
    </Alert>
  );
}
