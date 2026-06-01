import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { legalDocs } from "@/features/legal/registry";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return Object.keys(legalDocs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = legalDocs[slug];
  if (!doc) return { title: "404" };
  // Юр. документы - только русская редакция (валидно по ЗРК «О языках» для частных сервисов).
  return { title: doc.titleRu };
}

export default async function LegalDocPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const doc = legalDocs[slug];
  if (!doc) notFound();
  // Всегда рендерим русскую редакцию, независимо от выбранного локаля интерфейса.
  // Казахские версии (doc.Kk) оставлены в коде на случай если в будущем
  // понадобятся, но не используются.
  const Component = doc.Ru;
  return <Component />;
}
