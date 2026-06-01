"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/cn";

const STORAGE_KEY = "doda-cookie-consent";
const TTL_DAYS = 365;

type CookieChoice = {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  acceptedAt: number;
};

function loadChoice(): CookieChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieChoice;
    const ageMs = Date.now() - parsed.acceptedAt;
    if (ageMs > TTL_DAYS * 24 * 60 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveChoice(choice: CookieChoice) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
}

export function CookieConsentBanner() {
  const t = useTranslations("cookies.banner");
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    const existing = loadChoice();
    if (!existing) setVisible(true);
  }, []);

  function acceptAll() {
    saveChoice({ necessary: true, functional: true, analytics: true, acceptedAt: Date.now() });
    setVisible(false);
  }

  function acceptNecessary() {
    saveChoice({
      necessary: true,
      functional: false,
      analytics: false,
      acceptedAt: Date.now(),
    });
    setVisible(false);
  }

  function saveSettings() {
    saveChoice({ necessary: true, functional, analytics, acceptedAt: Date.now() });
    setVisible(false);
    setShowSettings(false);
  }

  if (!visible) return null;

  if (showSettings) {
    return (
      <div className="fixed inset-x-3 bottom-3 z-[60] md:bottom-6 md:left-6 md:right-6 md:max-w-2xl md:mx-auto">
        <div className="border-foreground/15 bg-background space-y-4 rounded-2xl border p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.3)]">
          <div className="space-y-1">
            <h3 className="text-base font-semibold">{t("settingsTitle")}</h3>
            <p className="text-foreground/65 text-xs">{t("settingsHint")}</p>
          </div>

          <div className="space-y-3">
            <CategoryRow
              title={t("cats.necessary.title")}
              desc={t("cats.necessary.desc")}
              checked={true}
              disabled
            />
            <CategoryRow
              title={t("cats.functional.title")}
              desc={t("cats.functional.desc")}
              checked={functional}
              onChange={setFunctional}
            />
            <CategoryRow
              title={t("cats.analytics.title")}
              desc={t("cats.analytics.desc")}
              checked={analytics}
              onChange={setAnalytics}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={saveSettings}
              className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-10 flex-1 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors"
            >
              {t("save")}
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="border-foreground/15 hover:bg-foreground/5 inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors"
            >
              {t("back")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] md:bottom-6 md:left-6 md:right-6 md:max-w-2xl md:mx-auto">
      <div className="border-foreground/15 bg-background space-y-4 rounded-2xl border p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.3)]">
        <div className="space-y-1">
          <div className="text-sm font-semibold">{t("title")}</div>
          <p className="text-foreground/70 text-xs leading-relaxed">
            {t.rich("body", {
              policy: (chunks) => (
                <Link href="/legal/cookies" className="text-foreground underline underline-offset-2">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={acceptAll}
            className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-10 flex-1 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors sm:flex-initial sm:px-6"
          >
            {t("acceptAll")}
          </button>
          <button
            type="button"
            onClick={acceptNecessary}
            className="border-foreground/15 hover:bg-foreground/5 inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors"
          >
            {t("acceptNecessary")}
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="text-foreground/70 hover:text-foreground inline-flex h-10 items-center justify-center rounded-full px-2 text-sm font-medium transition-colors"
          >
            {t("settings")}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  title,
  desc,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "border-foreground/10 flex cursor-pointer items-start gap-3 rounded-xl border p-3",
        disabled && "cursor-default opacity-70",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 size-4"
      />
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-foreground/60 text-xs leading-relaxed">{desc}</div>
      </div>
    </label>
  );
}
