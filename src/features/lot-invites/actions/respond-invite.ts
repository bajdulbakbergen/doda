"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function acceptInviteAction(formData: FormData) {
  const inviteId = String(formData.get("inviteId") ?? "");
  if (!inviteId) return { ok: false as const, error: "missing_params" };

  const supabase = await createClient();
  const { error, data } = await supabase
    .from("lot_invites")
    .update({ accepted_at: new Date().toISOString(), declined_at: null })
    .eq("id", inviteId)
    .select("lot_id")
    .single();

  if (error || !data) return { ok: false as const, error: error?.message ?? "unknown" };

  revalidatePath(`/lots/${data.lot_id}`);
  return { ok: true as const };
}

export async function declineInviteAction(formData: FormData) {
  const inviteId = String(formData.get("inviteId") ?? "");
  if (!inviteId) return { ok: false as const, error: "missing_params" };

  const supabase = await createClient();
  const { error, data } = await supabase
    .from("lot_invites")
    .update({ declined_at: new Date().toISOString(), accepted_at: null })
    .eq("id", inviteId)
    .select("lot_id")
    .single();

  if (error || !data) return { ok: false as const, error: error?.message ?? "unknown" };

  revalidatePath(`/lots/${data.lot_id}`);
  return { ok: true as const };
}
