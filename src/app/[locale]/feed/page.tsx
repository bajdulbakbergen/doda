import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { PostCard } from "@/features/posts/components/post-card";
import { getFeedPosts } from "@/features/posts/queries/get-posts";
import { getCurrentProfile } from "@/features/profile/queries/get-profile";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "feed" });
  return { title: t("title") };
}

const TYPES = ["case", "product", "news", "media"] as const;

export default async function FeedPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "feed" });
  const tType = await getTranslations({ locale, namespace: "posts.type" });

  const filterType = TYPES.includes(search.type as (typeof TYPES)[number])
    ? (search.type as (typeof TYPES)[number])
    : undefined;

  const [posts, profile] = await Promise.all([
    getFeedPosts({ type: filterType }),
    getCurrentProfile(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-foreground/60 mt-1 text-sm">{t("subtitle")}</p>
        </div>
        {profile?.is_verified ? (
          <Link href="/posts/new">
            <Button>{t("createCta")}</Button>
          </Link>
        ) : null}
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/feed"
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
            !filterType
              ? "border-foreground bg-foreground text-background"
              : "border-foreground/15 hover:bg-foreground/5"
          }`}
        >
          {t("filters.all")}
        </Link>
        {TYPES.map((type) => (
          <Link
            key={type}
            href={`/feed?type=${type}`}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              filterType === type
                ? "border-foreground bg-foreground text-background"
                : "border-foreground/15 hover:bg-foreground/5"
            }`}
          >
            {tType(type)}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-12 text-center">
          <p className="text-foreground/60">{t("empty")}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
