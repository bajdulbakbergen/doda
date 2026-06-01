import { useFormatter } from "next-intl";
import { Avatar } from "@/shared/ui/avatar";
import { Link } from "@/i18n/navigation";
import { StarDisplay } from "./star-display";
import type { ReviewWithReviewer } from "../queries/get-reviews";

export function ReviewCard({ review }: { review: ReviewWithReviewer }) {
  const format = useFormatter();
  const date = format.dateTime(new Date(review.created_at), {
    dateStyle: "medium",
  });

  return (
    <article className="border-foreground/10 bg-foreground/[0.02] space-y-3 rounded-2xl border p-4">
      <header className="flex items-center gap-3">
        {review.reviewer ? (
          <Link
            href={`/u/${review.reviewer.slug}`}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <Avatar
              src={review.reviewer.avatar_url}
              alt={review.reviewer.display_name}
              size={32}
            />
            <span className="text-sm font-medium">{review.reviewer.display_name}</span>
          </Link>
        ) : (
          <span className="text-foreground/60 text-sm">-</span>
        )}
        <span className="text-foreground/40 text-xs">{date}</span>
        <div className="ml-auto">
          <StarDisplay rating={review.rating} size="sm" />
        </div>
      </header>
      {review.comment ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{review.comment}</p>
      ) : null}
    </article>
  );
}
