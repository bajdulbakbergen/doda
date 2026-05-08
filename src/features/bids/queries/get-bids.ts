import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type BidWithBidder = Database["public"]["Tables"]["bids"]["Row"] & {
  bidder: {
    id: string;
    slug: string;
    display_name: string;
    avatar_url: string | null;
    is_verified: boolean;
  } | null;
};

export const getActiveBidsForLot = cache(async (lotId: string): Promise<BidWithBidder[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bids")
    .select(
      `*, bidder:profiles!bids_bidder_id_fkey(id, slug, display_name, avatar_url, is_verified)`,
    )
    .eq("lot_id", lotId)
    .eq("is_active", true)
    .order("amount", { ascending: true });

  if (error || !data) return [];
  return data as BidWithBidder[];
});
