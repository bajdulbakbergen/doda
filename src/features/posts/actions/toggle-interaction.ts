"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type InteractionType = Database["public"]["Enums"]["post_interaction_type"];

export async function toggleInteractionAction(
  postId: string,
  type: InteractionType,
): Promise<{ ok: boolean; nowActive: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, nowActive: false };

  const { data: existing, error: selectError } = await supabase
    .from("post_interactions")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .eq("type", type)
    .maybeSingle();

  if (selectError) {
    console.error("[toggleInteraction] select failed:", selectError.message);
    return { ok: false, nowActive: false };
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from("post_interactions")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .eq("type", type);
    if (deleteError) {
      console.error("[toggleInteraction] delete failed:", deleteError.message);
      return { ok: false, nowActive: true };
    }
    revalidatePath(`/posts/${postId}`);
    revalidatePath("/feed");
    return { ok: true, nowActive: false };
  }

  const { error: insertError } = await supabase.from("post_interactions").insert({
    user_id: user.id,
    post_id: postId,
    type,
  });
  if (insertError) {
    console.error("[toggleInteraction] insert failed:", insertError.message);
    return { ok: false, nowActive: false };
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/feed");
  return { ok: true, nowActive: true };
}
