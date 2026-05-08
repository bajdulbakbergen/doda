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
    const m = error.message.toLowerCase();
    if (m.includes("invalid login")) {
      return { status: "error", errorKey: "invalidCredentials" };
    }
    if (m.includes("email not confirmed")) {
      return { status: "error", errorKey: "emailNotConfirmed" };
    }
    return { status: "error", errorKey: "unknown" };
  }

  const locale = await getLocale();
  // Защита от open redirect — допускаем только относительные пути.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  redirect({ href: safeNext, locale });
}
