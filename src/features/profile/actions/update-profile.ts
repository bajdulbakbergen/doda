"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState =
  | { status: "idle" }
  | { status: "error"; errorKey: string }
  | { status: "success" };

export const profileIdleState: ProfileFormState = { status: "idle" };

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/;
const ALLOWED_LOCALES = ["ru", "kk", "en"] as const;

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", errorKey: "unauthorized" };

  const displayName = String(formData.get("displayName") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const bio = String(formData.get("bio") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const preferredLocale = String(formData.get("preferredLocale") ?? "");

  if (!displayName || displayName.length > 80) {
    return { status: "error", errorKey: "displayNameInvalid" };
  }
  if (!SLUG_RE.test(slug)) {
    return { status: "error", errorKey: "slugInvalid" };
  }
  if (bio.length > 1000) {
    return { status: "error", errorKey: "bioTooLong" };
  }
  if (city.length > 80) {
    return { status: "error", errorKey: "cityTooLong" };
  }
  if (!ALLOWED_LOCALES.includes(preferredLocale as (typeof ALLOWED_LOCALES)[number])) {
    return { status: "error", errorKey: "localeInvalid" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      slug,
      bio: bio || null,
      city: city || null,
      preferred_locale: preferredLocale,
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { status: "error", errorKey: "slugTaken" };
    }
    return { status: "error", errorKey: "unknown" };
  }

  revalidatePath("/account");
  revalidatePath(`/u/${slug}`);
  return { status: "success" };
}
