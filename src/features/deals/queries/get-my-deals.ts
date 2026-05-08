import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type MyDeal = Database["public"]["Tables"]["deals"]["Row"] & {
  lot: { id: string; title: string };
  customer: { id: string; slug: string; display_name: string; avatar_url: string | null };
  contractor: { id: string; slug: string; display_name: string; avatar_url: string | null };
};

export type DealRole = "customer" | "contractor";

export const getMyDeals = cache(async (): Promise<MyDeal[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("deals")
    .select(
      `*,
       lot:lots!deals_lot_id_fkey(id, title),
       customer:profiles!deals_customer_id_fkey(id, slug, display_name, avatar_url),
       contractor:profiles!deals_contractor_id_fkey(id, slug, display_name, avatar_url)`,
    )
    .or(`customer_id.eq.${user.id},contractor_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];
  return data as MyDeal[];
});
