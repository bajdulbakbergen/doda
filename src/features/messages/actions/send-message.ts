"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SendMessageState =
  | { status: "idle" }
  | { status: "error"; errorKey: string }
  | { status: "success" };

export const sendMessageIdleState: SendMessageState = { status: "idle" };

export async function sendMessageAction(
  _prev: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const conversationId = String(formData.get("conversationId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!conversationId) return { status: "error", errorKey: "no_conversation" };
  if (body.length < 1 || body.length > 4000) {
    return { status: "error", errorKey: "body_invalid" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", errorKey: "unauthorized" };

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body,
  });

  if (error) return { status: "error", errorKey: "send_failed" };

  revalidatePath(`/messages/${conversationId}`);
  return { status: "success" };
}
