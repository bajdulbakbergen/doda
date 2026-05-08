import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { StubPage } from "@/shared/components/layout/stub-page";

const ALLOWED = ["terms", "privacy", "offer", "personal-data", "tenders-rules", "disputes"] as const;
type Slug = (typeof ALLOWED)[number];

type Props = { params: Promise<{ locale: string; slug: string }> };

function isAllowed(slug: string): slug is Slug {
  return (ALLOWED as readonly string[]).includes(slug);
}

// Маппинг URL-slug → ключ перевода (kebab-case → camelCase)
const SLUG_TO_KEY: Record<Slug, string> = {
  terms: "terms",
  privacy: "privacy",
  offer: "offer",
  "personal-data": "personalData",
  "tenders-rules": "tendersRules",
  disputes: "disputes",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isAllowed(slug)) return { title: "404" };
  const key = SLUG_TO_KEY[slug];
  const t = await getTranslations({ locale, namespace: "stubs.legal" });
  return { title: t(`${key}.title`) };
}

export default async function LegalStubPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!isAllowed(slug)) notFound();

  const key = SLUG_TO_KEY[slug];
  const t = await getTranslations({ locale, namespace: "stubs" });

  return (
    <StubPage
      title={t(`legal.${key}.title`)}
      body={t(`legal.${key}.body`)}
      comingSoonLabel={t("comingSoon")}
      backLabel={t("backHome")}
    />
  );
}
