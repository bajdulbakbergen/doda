import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";

const STATIC_PATHS = ["", "/lots", "/feed", "/categories"];

function localizedUrls(path: string): MetadataRoute.Sitemap[number]["alternates"] {
  return {
    languages: Object.fromEntries(
      routing.locales.map((locale) => [
        locale,
        locale === routing.defaultLocale
          ? `${siteConfig.url}${path}`
          : `${siteConfig.url}/${locale}${path}`,
      ]),
    ),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: lots }, { data: profiles }, { data: posts }, { data: cats }] = await Promise.all([
    supabase
      .from("lots")
      .select("id, updated_at")
      .eq("is_private", false)
      .in("status", ["open", "closing", "closed"])
      .in("moderation_status", ["approved", "auto_approved"])
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("profiles")
      .select("slug, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5000),
    supabase
      .from("posts")
      .select("id, updated_at")
      .eq("is_published", true)
      .in("moderation_status", ["approved", "auto_approved"])
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase.from("categories").select("slug, created_at"),
  ]);

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${siteConfig.url}${path || "/"}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: path === "" ? 1.0 : 0.8,
    alternates: localizedUrls(path),
  }));

  const lotEntries: MetadataRoute.Sitemap = (lots ?? []).map((lot) => ({
    url: `${siteConfig.url}/lots/${lot.id}`,
    lastModified: new Date(lot.updated_at),
    changeFrequency: "hourly" as const,
    priority: 0.7,
  }));

  const profileEntries: MetadataRoute.Sitemap = (profiles ?? []).map((p) => ({
    url: `${siteConfig.url}/u/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const postEntries: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${siteConfig.url}/posts/${post.id}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const categoryEntries: MetadataRoute.Sitemap = (cats ?? []).map((cat) => ({
    url: `${siteConfig.url}/categories/${cat.slug}`,
    lastModified: new Date(cat.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.5,
    alternates: localizedUrls(`/categories/${cat.slug}`),
  }));

  return [...staticEntries, ...categoryEntries, ...lotEntries, ...profileEntries, ...postEntries];
}
