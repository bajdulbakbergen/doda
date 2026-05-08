import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/shared/ui/avatar";
import { formatPrice } from "@/shared/lib/format";
import type { PostWithMeta } from "../queries/get-posts";
import { PostTypeBadge } from "./post-type-badge";

type Props = { post: PostWithMeta; locale: string };

export function PostCard({ post, locale }: Props) {
  const t = useTranslations("posts.card");
  const categoryName = post.category
    ? locale === "kk"
      ? post.category.name_kk
      : post.category.name_ru
    : null;
  const cover = post.images[0];

  return (
    <Link
      href={`/posts/${post.id}`}
      className="border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.04] block overflow-hidden rounded-2xl border transition-colors"
    >
      {cover ? (
        <div className="relative aspect-[16/10] w-full bg-black/5">
          <Image
            src={cover}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            unoptimized
          />
        </div>
      ) : null}
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <PostTypeBadge type={post.type} />
          {categoryName ? <span className="text-foreground/50">{categoryName}</span> : null}
          {post.region ? (
            <>
              <span className="text-foreground/30">·</span>
              <span className="text-foreground/60">{post.region}</span>
            </>
          ) : null}
        </div>
        <h3 className="text-base font-semibold leading-snug">{post.title}</h3>
        {post.body ? (
          <p className="text-foreground/70 line-clamp-2 text-sm">{post.body}</p>
        ) : null}

        {post.type === "product" && (post.price != null || post.price_max != null) ? (
          <div className="text-sm">
            {post.price != null && post.price_max != null && post.price_max !== post.price ? (
              <span className="font-semibold">
                {formatPrice(post.price, post.currency)} – {formatPrice(post.price_max, post.currency)}
              </span>
            ) : (
              <span className="font-semibold">
                {formatPrice(post.price ?? post.price_max ?? 0, post.currency)}
              </span>
            )}
          </div>
        ) : null}

        <div className="border-foreground/10 flex items-center justify-between border-t pt-3 text-xs">
          {post.author ? (
            <div className="flex items-center gap-2">
              <Avatar src={post.author.avatar_url} alt={post.author.display_name} size={20} />
              <span className="text-foreground/70">{post.author.display_name}</span>
            </div>
          ) : null}
          <div className="text-foreground/60 flex items-center gap-3">
            <span>♥ {post.likes_count}</span>
            <span>★ {post.saves_count}</span>
          </div>
        </div>
        <span className="sr-only">{t("openPost")}</span>
      </div>
    </Link>
  );
}
