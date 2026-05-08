"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthFormState } from "../types";

export async function resetPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) return { status: "error", errorKey: "passwordTooShort" };
  if (password !== confirm) return { status: "error", errorKey: "passwordMismatch" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "error", errorKey: "sessionExpired" };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { status: "error", errorKey: "unknown" };

  const locale = await getLocale();
  redirect({ href: "/", locale });
}
