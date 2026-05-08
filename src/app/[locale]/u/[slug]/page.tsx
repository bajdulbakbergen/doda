import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ProfileHeader } from "@/features/profile/components/profile-header";
import { BidderHistory } from "@/features/profile/components/bidder-history";
import { getProfileBySlug, getCurrentProfile } from "@/features/profile/queries/get-profile";
import { getBidderHistory } from "@/features/lots/queries/get-bidder-history";
import { getRatingStats } from "@/features/reviews/queries/get-rating-stats";
import { getReviewsForProfile } from "@/features/reviews/queries/get-reviews";
import { getPostsByAuthor } from "@/features/posts/queries/get-posts";
import { RatingSummary } from "@/features/reviews/components/rating-summary";
import { ReviewCard } from "@/features/reviews/components/review-card";
import { PostCard } from "@/features/posts/components/post-card";
import { WriteButton } from "@/features/messages/components/write-button";
import { JsonLd, profileJsonLd } from "@/shared/components/seo/json-ld";
import { siteConfig } from "@/config/site";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug);
  if (!profile) return { title: "404" };

  return {
    title: profile.display_name,
    description: profile.bio ?? `${profile.display_name} на ${siteConfig.name}`,
    openGraph: {
      title: profile.display_name,
      description: profile.bio ?? undefined,
      images: profile.avatar_url ? [profile.avatar_url] : undefined,
      type: "profile",
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const profile = await getProfileBySlug(slug);
  if (!profile) notFound();

  const [history, stats, reviews, posts, viewer, t] = await Promise.all([
    getBidderHistory(profile.id),
    getRatingStats(profile.id),
    getReviewsForProfile(profile.id),
    getPostsByAuthor(profile.id),
    getCurrentProfile(),
    getTranslations({ locale, namespace: "profile" }),
  ]);

  const isOwnProfile = viewer?.id === profile.id;
  const tNav = await getTranslations({ locale, namespace: "nav" });

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <JsonLd data={profileJsonLd(profile)} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <ProfileHeader profile={profile} />
        </div>
        {viewer && !isOwnProfile ? (
          <WriteButton
            otherUserId={profile.id}
            label={tNav("messages")}
            variant="primary"
          />
        ) : null}
      </div>

      <div className="mt-8">
        <RatingSummary stats={stats} />
      </div>

      {posts.length > 0 ? (
        <section className="mt-10 space-y-3">
          <h2 className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
            {t("postsSection")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <BidderHistory items={history} locale={locale} />

        <section className="space-y-3">
          <h2 className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
            {t("reviewsSection")}
          </h2>
          {reviews.length === 0 ? (
            <div className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-6">
              <p className="text-foreground/60 text-sm">{t("reviewsEmpty")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
