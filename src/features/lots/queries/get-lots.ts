import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Lot = Database["public"]["Tables"]["lots"]["Row"];

export type LotWithMeta = Lot & {
  category: { slug: string; name_ru: string; name_kk: string } | null;
  owner: { slug: string; display_name: string; avatar_url: string | null; is_verified: boolean } | null;
  bid_count: number;
  lowest_bid: number | null;
};

export type LotFilters = {
  categorySlug?: string;
  region?: string;
  status?: Database["public"]["Enums"]["lot_status"];
  page?: number;
  pageSize?: number;
};

export type PagedLots = {
  lots: LotWithMeta[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const DEFAULT_PAGE_SIZE = 20;

export const getLots = cache(async (filters: LotFilters = {}): Promise<PagedLots> => {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("lots")
    .select(
      `*,
       category:categories!lots_category_id_fkey(slug, name_ru, name_kk),
       owner:profiles!lots_owner_id_fkey(slug, display_name, avatar_url, is_verified),
       bids(amount, is_active)`,
      { count: "exact" },
    )
    .eq("is_private", false)
    .order("deadline_at", { ascending: true })
    .range(from, to);

  if (filters.status) {
    query = query.eq("status", filters.status);
  } else {
    query = query.in("status", ["open", "closing", "closed"]);
  }

  if (filters.region) {
    query = query.ilike("region", `%${filters.region}%`);
  }

  if (filters.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle();
    if (!cat) {
      return { lots: [], total: 0, page, pageSize, totalPages: 0 };
    }
    query = query.eq("category_id", cat.id);
  }

  const { data, error, count } = await query;
  if (error || !data) return { lots: [], total: 0, page, pageSize, totalPages: 0 };

  const lots = data.map((row) => {
    const rawBids = row.bids as Array<{ amount: number; is_active: boolean }> | null;
    const activeBids = (rawBids ?? []).filter((b) => b.is_active);
    const lowest = activeBids.length
      ? Math.min(...activeBids.map((b) => Number(b.amount)))
      : null;
    const { bids: _bids, ...rest } = row;
    void _bids;
    return {
      ...rest,
      bid_count: activeBids.length,
      lowest_bid: lowest,
    };
  });

  const total = count ?? 0;
  return {
    lots,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
});
