"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/cn";

type Props = {
  title: string;
  url: string;
  text?: string;
  variant?: "icon" | "labeled";
  className?: string;
};

/**
 * Use Web Share API on supported devices (mobile в основном),
 * fallback на clipboard copy с toast-индикацией.
 * Лёгкая тактильная отдача (если устройство поддерживает Vibration API).
 */
export function ShareButton({ title, url, text, variant = "icon", className }: Props) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    // Haptic feedback на устройствах с Vibration API
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(8);
      } catch {
        /* noop */
      }
    }

    const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    const shareData: ShareData = { title, url: absoluteUrl, text: text ?? title };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // AbortError = user cancelled → молча выходим
        if (err instanceof Error && err.name === "AbortError") return;
        // другие ошибки - fallback на clipboard
      }
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked, silently noop */
    }
  }

  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={cn(
          "border-foreground/15 hover:bg-foreground/5 inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
          className,
        )}
      >
        <ShareIcon />
        <span>{copied ? t("copied") : t("shareButton")}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={t("shareButton")}
      className={cn(
        "hover:bg-foreground/5 relative inline-flex size-9 items-center justify-center rounded-full transition-colors",
        className,
      )}
    >
      <ShareIcon />
      {copied ? (
        <span className="bg-foreground text-background pointer-events-none absolute top-full right-0 mt-1 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-medium">
          {t("copied")}
        </span>
      ) : null}
    </button>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4">
      <path
        d="M12 15V3m0 0l-4 4m4-4l4 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
