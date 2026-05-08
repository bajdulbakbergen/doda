import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type PostDetail = Database["public"]["Tables"]["posts"]["Row"] & {
  author: {
    id: string;
    slug: string;
    display_name: string;
    avatar_url: string | null;
    is_verified: boolean;
    bio: string | null;
  } | null;
  category: { name_ru: string; name_kk: string; slug: string } | null;
  linked_lot: { id: string; title: string } | null;
  likes_count: number;
  saves_count: number;
  liked_by_me: boolean;
  saved_by_me: boolean;
};

export const getPostById = cache(async (id: string): Promise<PostDetail | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      `*,
       author:profiles!posts_author_id_fkey(id, slug, display_name, avatar_url, is_verified, bio),
       category:categories!posts_category_id_fkey(name_ru, name_kk, slug),
       linked_lot:lots!posts_linked_lot_id_fkey(id, title),
       post_interactions(user_id, type)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const myId = user?.id ?? null;

  const interactions =
    (data.post_interactions as Array<{ user_id: string; type: "like" | "save" }> | null) ?? [];
  let likes = 0;
  let saves = 0;
  let likedByMe = false;
  let savedByMe = false;
  for (const i of interactions) {
    if (i.type === "like") {
      likes++;
      if (myId && i.user_id === myId) likedByMe = true;
    } else {
      saves++;
      if (myId && i.user_id === myId) savedByMe = true;
    }
  }

  const { post_interactions: _ignored, ...rest } = data;
  void _ignored;

  return {
    ...rest,
    likes_count: likes,
    saves_count: saves,
    liked_by_me: likedByMe,
    saved_by_me: savedByMe,
  } as PostDetail;
});
