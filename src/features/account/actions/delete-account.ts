"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DeleteAccountState =
  | { status: "idle" }
  | { status: "error"; errorKey: string }
  | { status: "success"; scheduledFor: string };

export const deleteAccountIdleState: DeleteAccountState = { status: "idle" };

export async function requestAccountDeletionAction(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const confirm = String(formData.get("confirm") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (confirm !== "УДАЛИТЬ") {
    return { status: "error", errorKey: "confirmMismatch" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", errorKey: "unauthorized" };

  const { data, error } = await supabase
    .from("account_deletion_requests")
    .upsert(
      {
        user_id: user.id,
        reason: reason || null,
        cancelled_at: null,
      },
      { onConflict: "user_id" },
    )
    .select("scheduled_for")
    .single();

  if (error || !data) {
    console.error("[deleteAccount] failed:", error?.message);
    return { status: "error", errorKey: "unknown" };
  }

  revalidatePath("/account/privacy");
  return { status: "success", scheduledFor: data.scheduled_for };
}

export async function cancelAccountDeletionAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "unauthorized" };

  const { error } = await supabase
    .from("account_deletion_requests")
    .update({ cancelled_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/account/privacy");
  return { ok: true as const };
}
