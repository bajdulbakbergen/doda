"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { legalDocs } from "@/features/legal/registry";

/**
 * Записывает согласие на Cookie Policy для авторизованного пользователя.
 * Для анонимных пользователей выбор фиксируется только в localStorage (см. cookie-consent-banner.tsx).
 * После авторизации (signin/signup) клиент должен заново вызвать этот action, чтобы доказательная
 * база содержала server-side запись с IP + User-Agent.
 */
export async function recordCookieConsentAction(choice: {
  functional: boolean;
  analytics: boolean;
}): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    null;
  const userAgent = headerList.get("user-agent");

  const cookieDoc = legalDocs.cookies;
  if (!cookieDoc) return { ok: false };

  const { error } = await supabase.from("user_consents").insert({
    user_id: user.id,
    document_slug: "cookies",
    document_version: cookieDoc.version,
    source: "cookie_banner",
    ip,
    user_agent: userAgent,
  });

  if (error) {
    console.error("[recordCookieConsent] failed:", error.message, "choice=", choice);
    return { ok: false };
  }
  return { ok: true };
}
