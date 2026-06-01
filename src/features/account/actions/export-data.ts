"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Возвращает все данные пользователя в виде JSON-строки для скачивания.
 * Соответствует требованию ст. 26 ЗРК «О ПД» — право на доступ к своим данным.
 */
export async function exportMyDataAction(): Promise<
  { ok: true; filename: string; data: string } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  // Параллельно собираем все связанные данные.
  const [profile, consents, lots, bids, deals, reviewsAuthored, reviewsReceived, posts, messages, verifications] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("user_consents").select("*").eq("user_id", user.id),
      supabase.from("lots").select("*").eq("owner_id", user.id),
      supabase.from("bids").select("*").eq("bidder_id", user.id),
      supabase
        .from("deals")
        .select("*")
        .or(`customer_id.eq.${user.id},contractor_id.eq.${user.id}`),
      supabase.from("reviews").select("*").eq("reviewer_id", user.id),
      supabase.from("reviews").select("*").eq("reviewee_id", user.id),
      supabase.from("posts").select("*").eq("author_id", user.id),
      supabase.from("messages").select("*").eq("sender_id", user.id),
      supabase.from("verifications").select("*").eq("user_id", user.id),
    ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    user: { id: user.id, email: user.email, created_at: user.created_at },
    profile: profile.data,
    consents: consents.data ?? [],
    lots: lots.data ?? [],
    bids: bids.data ?? [],
    deals: deals.data ?? [],
    reviews: {
      authored: reviewsAuthored.data ?? [],
      received: reviewsReceived.data ?? [],
    },
    posts: posts.data ?? [],
    messages: messages.data ?? [],
    verifications: verifications.data ?? [],
  };

  const filename = `doda-data-export-${user.id}-${new Date().toISOString().slice(0, 10)}.json`;
  return { ok: true, filename, data: JSON.stringify(payload, null, 2) };
}
