import "server-only";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminProfile = {
  id: string;
  display_name: string;
  slug: string;
};

/**
 * Возвращает профиль текущего юзера если он админ, иначе 404
 * (не 403 — чтобы не светить факт существования админ-URL).
 */
export async function requireAdmin(): Promise<AdminProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, slug, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_admin) notFound();

  return { id: profile.id, display_name: profile.display_name, slug: profile.slug };
}
