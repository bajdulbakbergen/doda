import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/shared/ui/avatar";
import { siteConfig } from "@/config/site";
import { getCurrentProfile } from "@/features/profile/queries/get-profile";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { NotificationsBell } from "@/features/notifications/components/notifications-bell";
import { LocaleSwitcher } from "./locale-switcher";

export async function Header() {
  const t = await getTranslations("nav");
  const profile = await getCurrentProfile();

  const links = [
    { href: "/lots", label: t("lots") },
    { href: "/feed", label: t("feed") },
    { href: "/categories", label: t("categories") },
  ];
  const authedLinks = [
    { href: "/messages", label: t("messages") },
    { href: "/account/deals", label: t("deals") },
  ];

  return (
    <header
      className="border-foreground/10 bg-background/85 sticky top-0 z-40 border-b backdrop-blur"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        <Link href="/" className="text-base font-semibold tracking-tight">
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-5 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {profile
            ? authedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-foreground/70 hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))
            : null}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block">
            <LocaleSwitcher />
          </div>
          {profile ? (
            <>
              <NotificationsBell userId={profile.id} />
              <Link
                href="/lots/new"
                className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-9 items-center rounded-full px-3 text-sm font-medium transition-colors sm:px-4"
              >
                <span className="hidden sm:inline">{t("createLot")}</span>
                <span className="sm:hidden" aria-label={t("createLot")}>
                  +
                </span>
              </Link>
              <Link
                href="/account"
                className="hover:bg-foreground/5 -mr-1 hidden items-center gap-2 rounded-full p-1 transition-colors sm:inline-flex sm:pr-3"
                aria-label={t("account")}
              >
                <Avatar src={profile.avatar_url} alt={profile.display_name} size={28} />
                <span className="hidden text-sm md:inline">{profile.display_name}</span>
              </Link>
              <SignOutButton className="hidden md:inline-flex" />
            </>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="text-foreground/70 hover:text-foreground hidden text-sm transition-colors sm:inline"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/auth/sign-up"
                className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors"
              >
                {t("signUp")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
