import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export type NotificationMeta = {
  lot?: { id: string; title: string } | null;
  reviewer?: { slug: string; display_name: string; avatar_url: string | null } | null;
  bidder?: { slug: string; display_name: string; avatar_url: string | null } | null;
  deal?: { id: string } | null;
};

export type EnrichedNotification = Notification & { meta: NotificationMeta };

export const getUnreadNotificationCount = cache(async (): Promise<number> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return count ?? 0;
});

export const getNotifications = cache(async (): Promise<EnrichedNotification[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!notifications || notifications.length === 0) return [];

  const lotIds = new Set<string>();
  const profileIds = new Set<string>();
  const dealIds = new Set<string>();

  for (const n of notifications) {
    const p = (n.payload as Record<string, unknown>) ?? {};
    if (typeof p.lot_id === "string") lotIds.add(p.lot_id);
    if (typeof p.bidder_id === "string") profileIds.add(p.bidder_id);
    if (typeof p.reviewer_id === "string") profileIds.add(p.reviewer_id);
    if (typeof p.sender_id === "string") profileIds.add(p.sender_id);
    if (typeof p.inviter_id === "string") profileIds.add(p.inviter_id);
    if (typeof p.deal_id === "string") dealIds.add(p.deal_id);
  }

  const [lotsRes, profilesRes, dealsRes] = await Promise.all([
    lotIds.size
      ? supabase.from("lots").select("id, title").in("id", [...lotIds])
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    profileIds.size
      ? supabase
          .from("profiles")
          .select("id, slug, display_name, avatar_url")
          .in("id", [...profileIds])
      : Promise.resolve({
          data: [] as {
            id: string;
            slug: string;
            display_name: string;
            avatar_url: string | null;
          }[],
        }),
    dealIds.size
      ? supabase.from("deals").select("id").in("id", [...dealIds])
      : Promise.resolve({ data: [] as { id: string }[] }),
  ]);

  const lotsMap = new Map((lotsRes.data ?? []).map((l) => [l.id, l]));
  const profilesMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
  const dealsMap = new Map((dealsRes.data ?? []).map((d) => [d.id, d]));

  return notifications.map((n) => {
    const p = (n.payload as Record<string, unknown>) ?? {};
    const lotId = typeof p.lot_id === "string" ? p.lot_id : null;
    const bidderId =
      (typeof p.bidder_id === "string" ? p.bidder_id : null) ??
      (typeof p.sender_id === "string" ? p.sender_id : null) ??
      (typeof p.inviter_id === "string" ? p.inviter_id : null);
    const reviewerId = typeof p.reviewer_id === "string" ? p.reviewer_id : null;
    const dealId = typeof p.deal_id === "string" ? p.deal_id : null;

    return {
      ...n,
      meta: {
        lot: lotId ? lotsMap.get(lotId) ?? null : null,
        bidder: bidderId
          ? (() => {
              const pf = profilesMap.get(bidderId);
              return pf ? { slug: pf.slug, display_name: pf.display_name, avatar_url: pf.avatar_url } : null;
            })()
          : null,
        reviewer: reviewerId
          ? (() => {
              const pf = profilesMap.get(reviewerId);
              return pf ? { slug: pf.slug, display_name: pf.display_name, avatar_url: pf.avatar_url } : null;
            })()
          : null,
        deal: dealId ? dealsMap.get(dealId) ?? null : null,
      },
    };
  });
});
