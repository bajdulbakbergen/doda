"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { AuthFormState } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function forgotPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email || !EMAIL_RE.test(email)) {
    return { status: "error", errorKey: "invalidEmail" };
  }

  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin") ?? headerList.get("x-forwarded-host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const baseUrl = origin?.startsWith("http") ? origin : origin ? `${proto}://${origin}` : "";

  // НЕ раскрываем существование email — всегда возвращаем success.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/callback?next=/auth/reset-password`,
  });

  return { status: "success", messageKey: "passwordResetSent" };
}
