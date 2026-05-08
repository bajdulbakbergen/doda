"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReviewFormState =
  | { status: "idle" }
  | { status: "error"; errorKey: string }
  | { status: "success" };

export const reviewIdleState: ReviewFormState = { status: "idle" };

export async function submitReviewAction(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const dealId = String(formData.get("dealId") ?? "");
  const revieweeId = String(formData.get("revieweeId") ?? "");
  const ratingRaw = String(formData.get("rating") ?? "");
  const comment = String(formData.get("comment") ?? "").trim();

  if (!dealId || !revieweeId) return { status: "error", errorKey: "missing_params" };
  const rating = Number.parseInt(ratingRaw, 10);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { status: "error", errorKey: "rating_invalid" };
  }
  if (comment.length > 1000) return { status: "error", errorKey: "comment_too_long" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", errorKey: "unauthorized" };

  const { error } = await supabase.from("reviews").insert({
    deal_id: dealId,
    reviewer_id: user.id,
    reviewee_id: revieweeId,
    rating,
    comment: comment || null,
  });

  if (error) {
    if (error.code === "23505") return { status: "error", errorKey: "already_reviewed" };
    if (error.code === "42501") return { status: "error", errorKey: "deal_not_closed" };
    return { status: "error", errorKey: "unknown" };
  }

  revalidatePath(`/deals/${dealId}`);
  // Revalidate reviewee's public profile (we don't know slug here; revalidate by tag in future).
  return { status: "success" };
}
