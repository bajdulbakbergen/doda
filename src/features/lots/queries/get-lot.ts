import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type LotDetail = Database["public"]["Tables"]["lots"]["Row"] & {
  category: { id: string; slug: string; name_ru: string; name_kk: string };
  owner: {
    id: string;
    slug: string;
    display_name: string;
    avatar_url: string | null;
    is_verified: boolean;
    city: string | null;
  };
};

export const getLotById = cache(async (id: string): Promise<LotDetail | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lots")
    .select(
      `*,
       category:categories!lots_category_id_fkey(id, slug, name_ru, name_kk),
       owner:profiles!lots_owner_id_fkey(id, slug, display_name, avatar_url, is_verified, city)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as LotDetail;
});
