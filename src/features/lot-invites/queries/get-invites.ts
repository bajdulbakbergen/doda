import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Invite = Database["public"]["Tables"]["lot_invites"]["Row"];

export type InviteWithMeta = Invite & {
  lot: { id: string; title: string; deadline_at: string } | null;
  inviter: { id: string; slug: string; display_name: string; avatar_url: string | null } | null;
};

/**
 * Все приглашения для конкретного приглашаемого. Используем чтобы проверять,
 * нужно ли показывать пикер «Пригласить» в чате.
 */
export const getInvitesForBidder = cache(async (bidderId: string): Promise<Invite[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lot_invites")
    .select("*")
    .eq("invitee_id", bidderId)
    .is("declined_at", null);
  return data ?? [];
});

/**
 * Моё приглашение на конкретный лот (если есть).
 */
export const getMyInviteForLot = cache(async (lotId: string): Promise<Invite | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("lot_invites")
    .select("*")
    .eq("lot_id", lotId)
    .eq("invitee_id", user.id)
    .maybeSingle();
  return data;
});

/**
 * Список входящих приглашений для текущего юзера (для /account/invites например).
 */
export const getMyIncomingInvites = cache(async (): Promise<InviteWithMeta[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("lot_invites")
    .select(
      `*,
       lot:lots!lot_invites_lot_id_fkey(id, title, deadline_at),
       inviter:profiles!lot_invites_inviter_id_fkey(id, slug, display_name, avatar_url)`,
    )
    .eq("invitee_id", user.id)
    .is("declined_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []) as InviteWithMeta[];
});
