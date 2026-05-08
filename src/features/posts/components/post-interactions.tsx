"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/shared/lib/cn";
import { toggleInteractionAction } from "../actions/toggle-interaction";

type Props = {
  postId: string;
  isAuthenticated: boolean;
  initialLiked: boolean;
  initialSaved: boolean;
  initialLikesCount: number;
  initialSavesCount: number;
};

export function PostInteractions({
  postId,
  isAuthenticated,
  initialLiked,
  initialSaved,
  initialLikesCount,
  initialSavesCount,
}: Props) {
  const t = useTranslations("posts.interactions");
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [likes, setLikes] = useState(initialLikesCount);
  const [saves, setSaves] = useState(initialSavesCount);
  const [pending, startTransition] = useTransition();

  function toggle(type: "like" | "save") {
    if (!isAuthenticated) {
      router.push("/auth/sign-in");
      return;
    }
    // Оптимистичное обновление
    if (type === "like") {
      setLiked((v) => !v);
      setLikes((c) => (liked ? c - 1 : c + 1));
    } else {
      setSaved((v) => !v);
      setSaves((c) => (saved ? c - 1 : c + 1));
    }
    startTransition(async () => {
      await toggleInteractionAction(postId, type);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => toggle("like")}
        aria-pressed={liked}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
          liked
            ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
            : "border-foreground/15 hover:bg-foreground/5",
        )}
      >
        <span aria-hidden>{liked ? "♥" : "♡"}</span>
        <span className="tabular-nums">{likes}</span>
        <span className="sr-only">{t("like")}</span>
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => toggle("save")}
        aria-pressed={saved}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
          saved
            ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
            : "border-foreground/15 hover:bg-foreground/5",
        )}
      >
        <span aria-hidden>{saved ? "★" : "☆"}</span>
        <span className="tabular-nums">{saves}</span>
        <span className="sr-only">{t("save")}</span>
      </button>
    </div>
  );
}
