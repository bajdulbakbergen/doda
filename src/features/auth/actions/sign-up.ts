"use server";

import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { REGISTRABLE_CONSENTS, getConsentVersion } from "@/features/legal/registry";
import type { AuthFormState } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  // Юр. согласия — обязательные чекбоксы
  const acceptTerms = formData.get("acceptTerms") === "on";
  const acceptPersonalData = formData.get("acceptPersonalData") === "on";

  if (!email || !password) return { status: "error", errorKey: "missingFields" };
  if (!EMAIL_RE.test(email)) return { status: "error", errorKey: "invalidEmail" };
  if (password.length < 8) return { status: "error", errorKey: "passwordTooShort" };
  if (displayName.length > 80) return { status: "error", errorKey: "displayNameTooLong" };
  if (!acceptTerms || !acceptPersonalData) {
    return { status: "error", errorKey: "consentsRequired" };
  }

  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin") ?? headerList.get("x-forwarded-host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const baseUrl = origin?.startsWith("http") ? origin : origin ? `${proto}://${origin}` : "";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback?next=/account`,
      data: {
        display_name: displayName || email.split("@")[0],
      },
    },
  });

  if (error) {
    console.error("[signUp] Supabase auth error:", error.message, error);
    return { status: "error", errorKey: mapAuthError(error.message) };
  }

  // Фиксируем согласия в журнале (доказательная база)
  // record_signup_consent — SECURITY DEFINER функция с grace-window 10 минут от создания auth.users.
  const userId = data.user?.id;
  if (userId) {
    for (const slug of REGISTRABLE_CONSENTS) {
      const version = getConsentVersion(slug);
      const { error: consentError } = await supabase.rpc("record_signup_consent", {
        p_user_id: userId,
        p_document_slug: slug,
        p_document_version: version,
      });
      if (consentError) {
        console.error("[signUp] consent record failed:", slug, consentError.message);
        // не блокируем регистрацию — согласие зафиксировано на UI, в худшем случае
        // зарегистрируем повторно из callback
      }
    }
  }

  const locale = await getLocale();
  redirect({ href: "/auth/check-email", locale });
}

function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists")) return "emailTaken";
  if (m.includes("password")) return "passwordWeak";
  if (m.includes("rate limit")) return "rateLimit";
  return "unknown";
}
