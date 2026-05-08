"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SelectWinnerState =
  | { status: "idle" }
  | { status: "error"; errorKey: string }
  | { status: "success" };

export const selectWinnerIdleState: SelectWinnerState = { status: "idle" };

export async function selectWinnerAction(
  _prev: SelectWinnerState,
  formData: FormData,
): Promise<SelectWinnerState> {
  const lotId = String(formData.get("lotId") ?? "");
  const bidId = String(formData.get("bidId") ?? "");
  if (!lotId || !bidId) return { status: "error", errorKey: "missing_params" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("select_winner", {
    p_lot_id: lotId,
    p_bid_id: bidId,
  });

  if (error) {
    return { status: "error", errorKey: error.message };
  }

  revalidatePath(`/lots/${lotId}`);
  return { status: "success" };
}
