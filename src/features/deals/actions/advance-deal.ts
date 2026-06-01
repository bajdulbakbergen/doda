"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type DealActionState =
  | { status: "idle" }
  | { status: "error"; errorKey: string }
  | { status: "success" };

export const dealActionIdleState: DealActionState = { status: "idle" };

const KNOWN_ERRORS = new Set([
  "unauthorized",
  "deal_not_found",
  "not_a_participant",
  "invalid_transition",
  "deal_already_finalized",
  "only_customer_confirms",
  "only_contractor_confirms",
]);

export async function advanceDealAction(
  _prev: DealActionState,
  formData: FormData,
): Promise<DealActionState> {
  const dealId = String(formData.get("dealId") ?? "");
  const newStatus = String(formData.get("newStatus") ?? "");

  if (!dealId || !newStatus) {
    return { status: "error", errorKey: "missing_params" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("advance_deal_status", {
    p_deal_id: dealId,
    p_new_status: newStatus as Database["public"]["Enums"]["deal_status"],
  });

  if (error) {
    const key = KNOWN_ERRORS.has(error.message) ? error.message : "unknown";
    return { status: "error", errorKey: key };
  }

  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/account/deals");
  return { status: "success" };
}
