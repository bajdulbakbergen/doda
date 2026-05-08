import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { StubPage } from "@/shared/components/layout/stub-page";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "stubs.help" });
  return { title: t("title") };
}

export default async function HelpPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "stubs" });
  return (
    <StubPage
      title={t("help.title")}
      body={t("help.body")}
      comingSoonLabel={t("comingSoon")}
      backLabel={t("backHome")}
    />
  );
}
