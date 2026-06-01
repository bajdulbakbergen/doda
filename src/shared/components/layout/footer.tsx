import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { operator } from "@/config/operator";

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
        { href: "/legal/content-rules", label: t("contentRules") },
        { href: "/legal/cookies", label: t("cookies") },
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
          <div className="text-foreground/55 mt-3 space-y-0.5 text-xs">
            <div>
              <strong>{operator.legalName}</strong>
            </div>
            <div>БИН: {operator.bin}</div>
            <div className="leading-relaxed">{operator.legalAddress}</div>
            <div className="pt-1">
              <a
                href={`mailto:${operator.supportEmail}`}
                className="hover:text-foreground transition-colors"
              >
                {operator.supportEmail}
              </a>
            </div>
            <div>{operator.phone}</div>
          </div>
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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-4">
          <div className="text-foreground/50 text-xs">
            © {new Date().getFullYear()} {operator.legalName}. {t("rights")}
          </div>
          {operator.pdRegistryNumber ? (
            <div className="text-foreground/45 text-xs">
              {t("pdRegistry")}: {operator.pdRegistryNumber}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
