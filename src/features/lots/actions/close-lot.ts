"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CloseLotState =
  | { status: "idle" }
  | { status: "error"; errorKey: string }
  | { status: "success" };

export const closeLotIdleState: CloseLotState = { status: "idle" };

export async function closeLotAction(
  _prev: CloseLotState,
  formData: FormData,
): Promise<CloseLotState> {
  const lotId = String(formData.get("lotId") ?? "");
  if (!lotId) return { status: "error", errorKey: "lot_not_found" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("close_lot", { p_lot_id: lotId });

  if (error) {
    return { status: "error", errorKey: error.message };
  }

  revalidatePath(`/lots/${lotId}`);
  revalidatePath("/lots");
  return { status: "success" };
}
