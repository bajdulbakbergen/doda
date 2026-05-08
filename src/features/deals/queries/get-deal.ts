import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ProfileRef = {
  id: string;
  slug: string;
  display_name: string;
  avatar_url: string | null;
  is_verified: boolean;
};

export type DealWithMeta = Database["public"]["Tables"]["deals"]["Row"] & {
  lot: { id: string; title: string; is_private: boolean; currency: string };
  customer: ProfileRef;
  contractor: ProfileRef;
};

export const getDealById = cache(async (id: string): Promise<DealWithMeta | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select(
      `*,
       lot:lots!deals_lot_id_fkey(id, title, is_private, currency),
       customer:profiles!deals_customer_id_fkey(id, slug, display_name, avatar_url, is_verified),
       contractor:profiles!deals_contractor_id_fkey(id, slug, display_name, avatar_url, is_verified)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as DealWithMeta;
});

export const getDealByLotId = cache(async (lotId: string): Promise<DealWithMeta | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select(
      `*,
       lot:lots!deals_lot_id_fkey(id, title, is_private, currency),
       customer:profiles!deals_customer_id_fkey(id, slug, display_name, avatar_url, is_verified),
       contractor:profiles!deals_contractor_id_fkey(id, slug, display_name, avatar_url, is_verified)`,
    )
    .eq("lot_id", lotId)
    .maybeSingle();

  if (error || !data) return null;
  return data as DealWithMeta;
});
