import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Verification = Database["public"]["Tables"]["verifications"]["Row"];

/**
 * Возвращает текущую активную верификацию (pending/approved) пользователя.
 * Rejected заявки игнорируются — пользователь может подать заново.
 */
export const getCurrentVerification = cache(async (): Promise<Verification | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("verifications")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["pending", "approved"])
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ?? null;
});
