"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveVerificationAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  if (!id) return { ok: false as const, error: "missing_id" };
  if (!notes) return { ok: false as const, error: "notes_required" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("verifications")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewer_notes: notes || null,
    })
    .eq("id", id);

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/verifications");
  return { ok: true as const };
}

export async function rejectVerificationAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  if (!id || !notes) return { ok: false as const, error: "notes_required" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("verifications")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewer_notes: notes,
    })
    .eq("id", id);

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/verifications");
  return { ok: true as const };
}
