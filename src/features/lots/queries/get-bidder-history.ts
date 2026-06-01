import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type BidderHistoryItem = {
  bid: Database["public"]["Tables"]["bids"]["Row"];
  lot: Pick<
    Database["public"]["Tables"]["lots"]["Row"],
    "id" | "title" | "status" | "winner_bid_id" | "currency" | "deadline_at"
  > & {
    category: { name_ru: string; name_kk: string } | null;
  };
};

/**
 * Все ставки подрядчика по публичным лотам.
 * Скрываем приватные лоты - они не должны утекать.
 */
export const getBidderHistory = cache(
  async (bidderId: string): Promise<BidderHistoryItem[]> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bids")
      .select(
        `*,
         lot:lots!bids_lot_id_fkey(id, title, status, winner_bid_id, currency, deadline_at, is_private,
           category:categories!lots_category_id_fkey(name_ru, name_kk))`,
      )
      .eq("bidder_id", bidderId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data
      .filter((row) => row.lot && !row.lot.is_private)
      .map((row) => {
        const lotRow = row.lot!;
        return {
          bid: {
            id: row.id,
            lot_id: row.lot_id,
            bidder_id: row.bidder_id,
            amount: row.amount,
            change_count: row.change_count,
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at,
          },
          lot: {
            id: lotRow.id,
            title: lotRow.title,
            status: lotRow.status,
            winner_bid_id: lotRow.winner_bid_id,
            currency: lotRow.currency,
            deadline_at: lotRow.deadline_at,
            category: lotRow.category,
          },
        };
      });
  },
);
