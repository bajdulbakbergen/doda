import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations, getFormatter } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/shared/ui/avatar";
import { formatPrice } from "@/shared/lib/format";
import { PostTypeBadge } from "@/features/posts/components/post-type-badge";
import { PostInteractions } from "@/features/posts/components/post-interactions";
import { JsonLd, postJsonLd } from "@/shared/components/seo/json-ld";
import { getPostById } from "@/features/posts/queries/get-post";
import { getCurrentProfile } from "@/features/profile/queries/get-profile";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return { title: "404" };
  return {
    title: post.title,
    description: post.body?.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.body?.slice(0, 160),
      images: post.images,
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const post = await getPostById(id);
  if (!post) notFound();

  const profile = await getCurrentProfile();
  const t = await getTranslations({ locale, namespace: "posts.detail" });
  const format = await getFormatter({ locale });
  const date = format.dateTime(new Date(post.created_at), { dateStyle: "long" });
  const categoryName = post.category
    ? locale === "kk"
      ? post.category.name_kk
      : post.category.name_ru
    : null;

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-10">
      <JsonLd data={postJsonLd(post, post.author?.display_name)} />
      <nav className="text-foreground/60 mb-4 text-sm">
        <Link href="/feed" className="hover:text-foreground transition-colors">
          ← {t("backToFeed")}
        </Link>
      </nav>

      <header className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <PostTypeBadge type={post.type} />
          {categoryName ? <span className="text-foreground/60">{categoryName}</span> : null}
          {post.region ? (
            <>
              <span className="text-foreground/30">·</span>
              <span className="text-foreground/60">{post.region}</span>
            </>
          ) : null}
          <span className="text-foreground/30">·</span>
          <span className="text-foreground/60">{date}</span>
        </div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        {post.author ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/u/${post.author.slug}`}
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <Avatar src={post.author.avatar_url} alt={post.author.display_name} size={40} />
              <div>
                <div className="text-sm font-medium">{post.author.display_name}</div>
                {post.author.bio ? (
                  <div className="text-foreground/60 line-clamp-1 text-xs">{post.author.bio}</div>
                ) : null}
              </div>
            </Link>
            {post.author.id !== profile?.id ? (
              <form action={`/messages/start?other=${post.author.id}&post=${post.id}`}>
                <button
                  type="submit"
                  className="border-foreground/15 hover:bg-foreground/5 inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors"
                >
                  {t("writeAuthor")}
                </button>
              </form>
            ) : null}
          </div>
        ) : null}
      </header>

      {post.images.length > 0 ? (
        <div className="mb-6 space-y-3">
          {post.images.map((src, i) => (
            <div key={src} className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-black/5">
              <Image
                src={src}
                alt={`${post.title} ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                unoptimized
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      ) : null}

      {post.type === "product" && (post.price != null || post.price_max != null) ? (
        <div className="border-foreground/10 bg-foreground/[0.02] mb-6 rounded-2xl border p-5">
          <div className="text-foreground/50 mb-1 text-xs font-medium uppercase tracking-wider">
            {t("priceSection")}
          </div>
          <div className="text-2xl font-semibold">
            {post.price != null && post.price_max != null && post.price_max !== post.price
              ? `${formatPrice(post.price, post.currency)} – ${formatPrice(post.price_max, post.currency)}`
              : formatPrice(post.price ?? post.price_max ?? 0, post.currency)}
          </div>
        </div>
      ) : null}

      {post.body ? (
        <div className="prose-fallback mb-6 whitespace-pre-wrap text-base leading-relaxed">
          {post.body}
        </div>
      ) : null}

      {post.linked_lot ? (
        <div className="mb-6">
          <Link
            href={`/lots/${post.linked_lot.id}`}
            className="border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.04] inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors"
          >
            <span className="text-foreground/50 text-xs uppercase tracking-wider">
              {t("linkedLot")}
            </span>
            <span className="font-medium">{post.linked_lot.title}</span>
          </Link>
        </div>
      ) : null}

      <footer className="border-foreground/10 mt-8 flex items-center justify-between border-t pt-6">
        <PostInteractions
          postId={post.id}
          isAuthenticated={!!profile}
          initialLiked={post.liked_by_me}
          initialSaved={post.saved_by_me}
          initialLikesCount={post.likes_count}
          initialSavesCount={post.saves_count}
        />
      </footer>
    </article>
  );
}
