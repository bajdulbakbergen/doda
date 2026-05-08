import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type InvitableLot = {
  id: string;
  title: string;
  status: string;
  deadline_at: string;
};

export const getMyPrivateOpenLots = cache(async (): Promise<InvitableLot[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("lots")
    .select("id, title, status, deadline_at")
    .eq("owner_id", user.id)
    .eq("is_private", true)
    .in("status", ["open", "closing"])
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
});
