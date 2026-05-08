"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function startConversationAction(formData: FormData) {
  const otherUser = String(formData.get("other") ?? "");
  const lotId = String(formData.get("lot") ?? "").trim() || null;
  const postId = String(formData.get("post") ?? "").trim() || null;

  if (!otherUser) {
    const locale = await getLocale();
    redirect({ href: "/", locale });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const locale = await getLocale();
  if (!user) {
    redirect({ href: "/auth/sign-in?next=/messages", locale });
  }

  const { data, error } = await supabase.rpc("start_conversation", {
    p_other_user: otherUser,
    p_lot_id: lotId ?? undefined,
    p_post_id: postId ?? undefined,
  });

  if (error || !data) {
    redirect({ href: "/messages", locale });
  }

  redirect({ href: `/messages/${data.id}`, locale });
}
