"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export type LotFormState =
  | { status: "idle" }
  | { status: "error"; errorKey: string };

export const lotIdleState: LotFormState = { status: "idle" };

const MIN_DEADLINE_OFFSET_MS = 5 * 60 * 1000;

export async function createLotAction(
  _prev: LotFormState,
  formData: FormData,
): Promise<LotFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", errorKey: "unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_verified")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_verified) {
    return { status: "error", errorKey: "notVerified" };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const region = String(formData.get("region") ?? "").trim();
  const deadlineAt = String(formData.get("deadlineAt") ?? "");
  const startingPriceRaw = String(formData.get("startingPrice") ?? "").trim();
  const maxPriceRaw = String(formData.get("maxPrice") ?? "").trim();
  const isPrivate = formData.get("isPrivate") === "on";

  if (title.length < 5 || title.length > 200) {
    return { status: "error", errorKey: "titleInvalid" };
  }
  if (description.length < 20 || description.length > 5000) {
    return { status: "error", errorKey: "descriptionInvalid" };
  }
  if (!categoryId) return { status: "error", errorKey: "categoryRequired" };
  if (region.length < 2 || region.length > 100) {
    return { status: "error", errorKey: "regionInvalid" };
  }

  const deadline = new Date(deadlineAt);
  if (Number.isNaN(deadline.getTime())) {
    return { status: "error", errorKey: "deadlineInvalid" };
  }
  if (deadline.getTime() - Date.now() < MIN_DEADLINE_OFFSET_MS) {
    return { status: "error", errorKey: "deadlineTooSoon" };
  }

  const startingPrice = startingPriceRaw ? Number(startingPriceRaw) : null;
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : null;

  if (startingPrice !== null && (Number.isNaN(startingPrice) || startingPrice <= 0)) {
    return { status: "error", errorKey: "priceInvalid" };
  }
  if (maxPrice !== null && (Number.isNaN(maxPrice) || maxPrice <= 0)) {
    return { status: "error", errorKey: "priceInvalid" };
  }
  if (startingPrice !== null && maxPrice !== null && maxPrice < startingPrice) {
    return { status: "error", errorKey: "priceConsistency" };
  }

  const { data: lot, error } = await supabase
    .from("lots")
    .insert({
      owner_id: user.id,
      title,
      description,
      category_id: categoryId,
      region,
      deadline_at: deadline.toISOString(),
      starting_price: startingPrice,
      max_price: maxPrice,
      is_private: isPrivate,
      status: "open",
    })
    .select("id")
    .single();

  if (error || !lot) {
    return { status: "error", errorKey: "createFailed" };
  }

  revalidatePath("/lots");
  const locale = await getLocale();
  redirect({ href: `/lots/${lot.id}`, locale });
}
