import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type PostWithMeta = Database["public"]["Tables"]["posts"]["Row"] & {
  author: {
    id: string;
    slug: string;
    display_name: string;
    avatar_url: string | null;
    is_verified: boolean;
  } | null;
  category: { name_ru: string; name_kk: string; slug: string } | null;
  likes_count: number;
  saves_count: number;
  liked_by_me: boolean;
  saved_by_me: boolean;
};

const FRESH_BOOST_MS = 48 * 60 * 60 * 1000;

export type PostFilters = {
  type?: Database["public"]["Enums"]["post_type"];
  authorId?: string;
};

async function fetchPostsRaw(filters: PostFilters) {
  const supabase = await createClient();
  let q = supabase
    .from("posts")
    .select(
      `*,
       author:profiles!posts_author_id_fkey(id, slug, display_name, avatar_url, is_verified),
       category:categories!posts_category_id_fkey(name_ru, name_kk, slug),
       post_interactions(user_id, type)`,
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters.type) q = q.eq("type", filters.type);
  if (filters.authorId) q = q.eq("author_id", filters.authorId);

  const { data } = await q;
  return data ?? [];
}

function enrich(
  rows: Awaited<ReturnType<typeof fetchPostsRaw>>,
  myUserId: string | null,
): PostWithMeta[] {
  return rows.map((row) => {
    const interactions =
      (row.post_interactions as Array<{ user_id: string; type: "like" | "save" }> | null) ?? [];
    let likesCount = 0;
    let savesCount = 0;
    let likedByMe = false;
    let savedByMe = false;
    for (const i of interactions) {
      if (i.type === "like") {
        likesCount++;
        if (myUserId && i.user_id === myUserId) likedByMe = true;
      } else if (i.type === "save") {
        savesCount++;
        if (myUserId && i.user_id === myUserId) savedByMe = true;
      }
    }
    const { post_interactions: _ignored, ...rest } = row;
    void _ignored;
    return {
      ...rest,
      likes_count: likesCount,
      saves_count: savesCount,
      liked_by_me: likedByMe,
      saved_by_me: savedByMe,
    };
  });
}

export const getFeedPosts = cache(async (filters: PostFilters = {}): Promise<PostWithMeta[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const myId = user?.id ?? null;

  const rows = await fetchPostsRaw(filters);
  const enriched = enrich(rows, myId);

  // Score: likes + 1.5*saves + boost для свежих 48ч
  const now = Date.now();
  return enriched
    .map((p) => ({
      ...p,
      _score:
        p.likes_count +
        p.saves_count * 1.5 +
        (now - new Date(p.created_at).getTime() < FRESH_BOOST_MS ? 5 : 0),
    }))
    .sort((a, b) => b._score - a._score || (b.created_at > a.created_at ? 1 : -1))
    .slice(0, 50)
    .map(({ _score: _s, ...p }) => {
      void _s;
      return p;
    });
});

export const getPostsByAuthor = cache(async (authorId: string): Promise<PostWithMeta[]> => {
  const rows = await fetchPostsRaw({ authorId });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return enrich(rows, user?.id ?? null);
});
