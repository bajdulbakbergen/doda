import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { Header } from "@/shared/components/layout/header";
import { Footer } from "@/shared/components/layout/footer";
import { BottomNav } from "@/shared/components/layout/bottom-nav";
import { PostHogProvider } from "@/shared/components/analytics/posthog-provider";
import { ServiceWorkerRegister } from "@/shared/components/pwa/service-worker-register";
import { InstallPrompt } from "@/shared/components/pwa/install-prompt";
import { CookieConsentBanner } from "@/features/legal/components/cookie-consent-banner";
import { getCurrentProfile } from "@/features/profile/queries/get-profile";
import "../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.webmanifest",
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
  const [messages, profile] = await Promise.all([getMessages(), getCurrentProfile()]);

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="bg-background text-foreground flex min-h-full flex-col font-sans pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PostHogProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <BottomNav isAuthenticated={!!profile} />
            <CookieConsentBanner />
            <InstallPrompt />
            <ServiceWorkerRegister />
          </PostHogProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
