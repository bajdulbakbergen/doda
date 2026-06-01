"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "doda-install-dismissed-at";
const DISMISS_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export function InstallPrompt() {
  const t = useTranslations("pwa.install");
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(DISMISSED_KEY);
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_TTL_MS) {
      setHidden(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (hidden || !event) return null;

  function dismiss() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    }
    setHidden(true);
  }

  async function install() {
    if (!event) return;
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome === "dismissed") {
        dismiss();
      } else {
        setHidden(true);
      }
    } catch {
      dismiss();
    }
  }

  return (
    <div className="fixed bottom-20 inset-x-3 z-50 md:bottom-6 md:right-6 md:left-auto md:max-w-sm">
      <div className="border-foreground/10 bg-background rounded-2xl border p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]">
        <div className="flex items-start gap-3">
          <div className="from-emerald-500 to-emerald-700 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-base font-bold text-white">
            D
          </div>
          <div className="flex-1 space-y-1">
            <div className="text-sm font-semibold">{t("title")}</div>
            <div className="text-foreground/60 text-xs leading-relaxed">{t("body")}</div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t("dismiss")}
            className="text-foreground/40 hover:text-foreground -mt-1 -mr-1 size-7 shrink-0 rounded-full text-lg leading-none transition-colors"
          >
            ×
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={install}
            className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-9 flex-1 items-center justify-center rounded-full text-sm font-medium transition-colors"
          >
            {t("cta")}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="border-foreground/15 hover:bg-foreground/5 inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors"
          >
            {t("later")}
          </button>
        </div>
      </div>
    </div>
  );
}
