export const siteConfig = {
  name: "Doda",
  description: "B2B тендерно-аукционная платформа Казахстана",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  defaultCity: "Астана",
  currency: "KZT",
  currencySymbol: "₸",
  supportEmail: "support@doda.kz",
} as const;
