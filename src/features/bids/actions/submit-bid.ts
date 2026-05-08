"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type BidFormState =
  | { status: "idle" }
  | { status: "error"; errorKey: string }
  | { status: "success" };

export const bidIdleState: BidFormState = { status: "idle" };

const KNOWN_ERRORS = new Set([
  "unauthorized",
  "lot_not_found",
  "lot_not_open",
  "lot_expired",
  "owner_cannot_bid",
  "not_verified",
  "invalid_amount",
  "amount_above_max",
  "amount_above_starting",
  "step_too_small",
  "max_changes_reached",
  "amount_unchanged",
]);

export async function submitBidAction(
  _prev: BidFormState,
  formData: FormData,
): Promise<BidFormState> {
  const lotId = String(formData.get("lotId") ?? "");
  const amountRaw = String(formData.get("amount") ?? "").trim();

  if (!lotId) return { status: "error", errorKey: "lot_not_found" };
  const amount = Number(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) {
    return { status: "error", errorKey: "invalid_amount" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_bid", {
    p_lot_id: lotId,
    p_amount: amount,
  });

  if (error) {
    const key = KNOWN_ERRORS.has(error.message) ? error.message : "unknown";
    return { status: "error", errorKey: key };
  }

  revalidatePath(`/lots/${lotId}`);
  return { status: "success" };
}
