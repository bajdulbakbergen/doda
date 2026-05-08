"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DealActionState =
  | { status: "idle" }
  | { status: "error"; errorKey: string }
  | { status: "success" };

export const cancelDealIdleState: DealActionState = { status: "idle" };

export async function cancelDealAction(
  _prev: DealActionState,
  formData: FormData,
): Promise<DealActionState> {
  const dealId = String(formData.get("dealId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!dealId) return { status: "error", errorKey: "missing_params" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_deal", {
    p_deal_id: dealId,
    p_reason: reason || "",
  });

  if (error) return { status: "error", errorKey: error.message };

  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/account/deals");
  return { status: "success" };
}
