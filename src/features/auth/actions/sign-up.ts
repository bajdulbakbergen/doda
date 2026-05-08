"use server";

import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
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

  if (!email || !password) return { status: "error", errorKey: "missingFields" };
  if (!EMAIL_RE.test(email)) return { status: "error", errorKey: "invalidEmail" };
  if (password.length < 8) return { status: "error", errorKey: "passwordTooShort" };
  if (displayName.length > 80) return { status: "error", errorKey: "displayNameTooLong" };

  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin") ?? headerList.get("x-forwarded-host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const baseUrl = origin?.startsWith("http") ? origin : origin ? `${proto}://${origin}` : "";

  const { error } = await supabase.auth.signUp({
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
    // Лог в Vercel Functions logs для отладки
    console.error("[signUp] Supabase auth error:", error.message, error);
    return { status: "error", errorKey: mapAuthError(error.message) };
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
