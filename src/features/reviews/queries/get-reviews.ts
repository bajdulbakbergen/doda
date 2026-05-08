import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type ReviewWithReviewer = Database["public"]["Tables"]["reviews"]["Row"] & {
  reviewer: {
    id: string;
    slug: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  deal: { id: string; lot_id: string } | null;
};

export const getReviewsForProfile = cache(
  async (revieweeId: string): Promise<ReviewWithReviewer[]> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `*,
         reviewer:profiles!reviews_reviewer_id_fkey(id, slug, display_name, avatar_url),
         deal:deals!reviews_deal_id_fkey(id, lot_id)`,
      )
      .eq("reviewee_id", revieweeId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return data as ReviewWithReviewer[];
  },
);

export const getMyReviewForDeal = cache(
  async (dealId: string): Promise<Database["public"]["Tables"]["reviews"]["Row"] | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("deal_id", dealId)
      .eq("reviewer_id", user.id)
      .maybeSingle();
    return data;
  },
);

export const getReviewsForDeal = cache(async (dealId: string): Promise<ReviewWithReviewer[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `*,
       reviewer:profiles!reviews_reviewer_id_fkey(id, slug, display_name, avatar_url),
       deal:deals!reviews_deal_id_fkey(id, lot_id)`,
    )
    .eq("deal_id", dealId);
  if (error || !data) return [];
  return data as ReviewWithReviewer[];
});
