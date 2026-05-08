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

  const { data: existing } = await supabase
    .from("post_interactions")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .eq("type", type)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("post_interactions")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .eq("type", type);
    revalidatePath(`/posts/${postId}`);
    revalidatePath("/feed");
    return { ok: true, nowActive: false };
  }

  await supabase.from("post_interactions").insert({
    user_id: user.id,
    post_id: postId,
    type,
  });

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/feed");
  return { ok: true, nowActive: true };
}
