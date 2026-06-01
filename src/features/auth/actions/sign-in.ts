"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthFormState } from "../types";

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!email || !password) return { status: "error", errorKey: "missingFields" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[signIn] Supabase auth error:", error.message, error);
    const m = error.message.toLowerCase();
    if (m.includes("invalid login")) {
      return { status: "error", errorKey: "invalidCredentials" };
    }
    if (m.includes("email not confirmed")) {
      return { status: "error", errorKey: "emailNotConfirmed" };
    }
    return { status: "error", errorKey: "unknown" };
  }

  // MFA step-up: если у пользователя есть верифицированный TOTP-фактор,
  // signInWithPassword даёт сессию aal1, но nextLevel требует aal2.
  // Тогда не редиректим - возвращаем factorId+challengeId, форма докручивает TOTP-кодом.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel === "aal1") {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totp = factors?.totp?.find((f) => f.status === "verified");
    if (totp) {
      const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({
        factorId: totp.id,
      });
      if (chErr || !challenge) {
        console.error("[signIn] mfa.challenge failed:", chErr?.message);
        return { status: "error", errorKey: "unknown" };
      }
      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
      return {
        status: "mfa_required",
        factorId: totp.id,
        challengeId: challenge.id,
        next: safeNext,
      };
    }
  }

  const locale = await getLocale();
  // Защита от open redirect - допускаем только относительные пути.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  redirect({ href: safeNext, locale });
}
