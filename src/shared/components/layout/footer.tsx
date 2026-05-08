import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";

export function Footer() {
  const t = useTranslations("footer");

  const sections = [
    {
      title: t("company"),
      links: [
        { href: "/about", label: t("about") },
        { href: "/contacts", label: t("contacts") },
      ],
    },
    {
      title: t("legal"),
      links: [
        { href: "/legal/terms", label: t("termsOfUse") },
        { href: "/legal/privacy", label: t("privacyPolicy") },
        { href: "/legal/offer", label: t("publicOffer") },
        { href: "/legal/personal-data", label: t("personalDataConsent") },
        { href: "/legal/tenders-rules", label: t("tendersRules") },
        { href: "/legal/disputes", label: t("disputeResolution") },
      ],
    },
    {
      title: t("support"),
      links: [{ href: "/help", label: t("help") }],
    },
  ];

  return (
    <footer className="border-foreground/10 mt-16 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <div className="text-base font-semibold">{siteConfig.name}</div>
          <p className="text-foreground/60 text-sm leading-relaxed">{siteConfig.description}</p>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <div className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
              {section.title}
            </div>
            <ul className="space-y-2 text-sm">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-foreground/10 border-t">
        <div className="text-foreground/50 mx-auto max-w-6xl px-6 py-4 text-xs">
          © {new Date().getFullYear()} {siteConfig.name}. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
