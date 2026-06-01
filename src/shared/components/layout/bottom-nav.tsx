"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/shared/lib/cn";

type Item = {
  href: string;
  labelKey: "home" | "lots" | "feed" | "messages" | "account" | "signIn";
  icon: React.ReactNode;
  auth?: boolean;
  guestOnly?: boolean;
};

const ITEMS: Item[] = [
  { href: "/", labelKey: "home", icon: <HomeIcon /> },
  { href: "/lots", labelKey: "lots", icon: <LotsIcon /> },
  { href: "/feed", labelKey: "feed", icon: <FeedIcon /> },
  { href: "/messages", labelKey: "messages", icon: <ChatIcon />, auth: true },
  { href: "/account", labelKey: "account", icon: <UserIcon />, auth: true },
  { href: "/auth/sign-in", labelKey: "signIn", icon: <UserIcon />, guestOnly: true },
];

export function BottomNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const visible = ITEMS.filter((item) => {
    if (item.auth && !isAuthenticated) return false;
    if (item.guestOnly && isAuthenticated) return false;
    return true;
  });

  return (
    <nav
      aria-label="Mobile navigation"
      className="border-foreground/10 bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md justify-around">
        {visible.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium leading-none transition-colors",
                  active ? "text-foreground" : "text-foreground/55",
                )}
              >
                <span aria-hidden className={cn("transition-transform", active && "scale-110")}>
                  {item.icon}
                </span>
                <span>{t(item.labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function iconClass() {
  return "size-5";
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass()}>
      <path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2v-9z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function LotsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass()}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 10h10M7 14h6" strokeLinecap="round" />
    </svg>
  );
}

function FeedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass()}>
      <path d="M4 11a8 8 0 018-8M4 4a16 16 0 0116 16" strokeLinecap="round" />
      <circle cx="6" cy="18" r="2" fill="currentColor" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass()}>
      <path d="M21 12a8 8 0 11-3.4-6.5L21 4l-1.2 3.7A7.96 7.96 0 0121 12z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass()}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" strokeLinecap="round" />
    </svg>
  );
}
