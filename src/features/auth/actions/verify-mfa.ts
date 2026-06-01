"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthFormState } from "../types";

const CODE_RE = /^\d{6}$/;

export async function verifyMfaAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const factorId = String(formData.get("factorId") ?? "");
  const challengeId = String(formData.get("challengeId") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  const next = String(formData.get("next") ?? "/");

  if (!factorId || !challengeId) return { status: "error", errorKey: "unknown" };
  if (!CODE_RE.test(code)) return { status: "error", errorKey: "invalidMfaCode" };

  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code,
  });

  if (error) {
    console.error("[verifyMfa] verify failed:", error.message);
    return { status: "error", errorKey: "invalidMfaCode" };
  }

  const locale = await getLocale();
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  redirect({ href: safeNext, locale });
}
