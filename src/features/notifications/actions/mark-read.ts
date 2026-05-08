"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markAllReadAction() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_notifications_read", { p_ids: undefined });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/notifications");
  return { ok: true as const };
}

export async function markReadAction(ids: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_notifications_read", { p_ids: ids });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/notifications");
  return { ok: true as const };
}
