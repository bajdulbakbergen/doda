"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function inviteToLotAction(formData: FormData) {
  const lotId = String(formData.get("lotId") ?? "");
  const inviteeId = String(formData.get("inviteeId") ?? "");

  if (!lotId || !inviteeId) return { ok: false as const, error: "missing_params" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "unauthorized" };

  const { error } = await supabase.from("lot_invites").insert({
    lot_id: lotId,
    inviter_id: user.id,
    invitee_id: inviteeId,
  });

  if (error) {
    if (error.code === "23505") return { ok: false as const, error: "already_invited" };
    return { ok: false as const, error: error.message };
  }

  revalidatePath(`/lots/${lotId}`);
  return { ok: true as const };
}
