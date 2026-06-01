import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { legalDocs } from "@/features/legal/registry";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return Object.keys(legalDocs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const doc = legalDocs[slug];
  if (!doc) return { title: "404" };
  return {
    title: locale === "kk" ? doc.titleKk : doc.titleRu,
  };
}

export default async function LegalDocPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const doc = legalDocs[slug];
  if (!doc) notFound();
  const Component = locale === "kk" ? doc.Kk : doc.Ru;
  return <Component />;
}
