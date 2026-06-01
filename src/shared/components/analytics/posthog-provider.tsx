"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.posthog.com";
const COOKIE_KEY = "doda-cookie-consent";

type Consent = { analytics?: boolean };

function readAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(COOKIE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Consent;
    return parsed.analytics === true;
  } catch {
    return false;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("doda:cookie-consent-changed", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("doda:cookie-consent-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasConsent = useSyncExternalStore(
    subscribe,
    readAnalyticsConsent,
    () => false,
  );

  useEffect(() => {
    if (!POSTHOG_KEY || initialized.current || typeof window === "undefined") return;
    if (!hasConsent) return;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
    });
    initialized.current = true;
  }, [hasConsent]);

  useEffect(() => {
    if (!initialized.current || !hasConsent) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, hasConsent]);

  return <>{children}</>;
}
