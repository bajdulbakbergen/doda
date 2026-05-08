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

export type ConversationListItem = {
  id: string;
  last_message_at: string;
  lot: { id: string; title: string } | null;
  post: { id: string; title: string } | null;
  otherParty: ProfileRef | null;
  lastMessage: {
    body: string;
    sender_id: string;
    created_at: string;
  } | null;
  unreadCount: number;
};

type RawMessage = Pick<
  Database["public"]["Tables"]["messages"]["Row"],
  "id" | "body" | "created_at" | "sender_id"
>;

export const getMyConversations = cache(async (): Promise<ConversationListItem[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `*,
       participants:conversation_participants(user_id, last_read_at,
         profile:profiles!conversation_participants_user_id_fkey(id, slug, display_name, avatar_url, is_verified)),
       messages(id, body, created_at, sender_id),
       lot:lots!conversations_lot_id_fkey(id, title),
       post:posts!conversations_post_id_fkey(id, title)`,
    )
    .order("last_message_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((row) => {
    const participants = (row.participants ?? []) as Array<{
      user_id: string;
      last_read_at: string | null;
      profile: ProfileRef | null;
    }>;
    const me = participants.find((p) => p.user_id === user.id);
    const other = participants.find((p) => p.user_id !== user.id);
    const messages = (row.messages ?? []) as RawMessage[];
    messages.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    const last = messages[0] ?? null;
    const myLastRead = me?.last_read_at ? new Date(me.last_read_at).getTime() : 0;
    const unread = messages.filter(
      (m) => m.sender_id !== user.id && new Date(m.created_at).getTime() > myLastRead,
    ).length;

    return {
      id: row.id,
      last_message_at: row.last_message_at,
      lot: row.lot ?? null,
      post: row.post ?? null,
      otherParty: other?.profile ?? null,
      lastMessage: last
        ? { body: last.body, sender_id: last.sender_id, created_at: last.created_at }
        : null,
      unreadCount: unread,
    };
  });
});

export type ConversationDetail = {
  id: string;
  lot: { id: string; title: string } | null;
  post: { id: string; title: string } | null;
  participants: ProfileRef[];
  myLastRead: string | null;
};

export const getConversationDetail = cache(
  async (conversationId: string): Promise<ConversationDetail | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("conversations")
      .select(
        `id,
         lot:lots!conversations_lot_id_fkey(id, title),
         post:posts!conversations_post_id_fkey(id, title),
         participants:conversation_participants(user_id, last_read_at,
           profile:profiles!conversation_participants_user_id_fkey(id, slug, display_name, avatar_url, is_verified))`,
      )
      .eq("id", conversationId)
      .maybeSingle();

    if (!data) return null;
    const participants = (data.participants ?? []) as Array<{
      user_id: string;
      last_read_at: string | null;
      profile: ProfileRef | null;
    }>;
    const me = participants.find((p) => p.user_id === user.id);
    if (!me) return null;

    return {
      id: data.id,
      lot: data.lot ?? null,
      post: data.post ?? null,
      participants: participants.map((p) => p.profile).filter((p): p is ProfileRef => !!p),
      myLastRead: me.last_read_at,
    };
  },
);

export const getMessagesForConversation = cache(
  async (conversationId: string): Promise<RawMessage[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("messages")
      .select("id, body, created_at, sender_id")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(500);
    return (data ?? []) as RawMessage[];
  },
);
