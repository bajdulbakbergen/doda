import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { PostHogProvider } from "@/shared/components/analytics/posthog-provider";
import "../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Все страницы под [locale] рендерим per-request: Header читает сессию через
// cookies(), protected routes делают redirect() при отсутствии профиля.
// Без этого build падает на prerender /ru/account, /ru/messages и т.д.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="bg-background text-foreground flex min-h-full flex-col font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PostHogProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </PostHogProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
