import { startConversationAction } from "../actions/start-conversation";

type Props = {
  otherUserId: string;
  lotId?: string;
  postId?: string;
  label: string;
  variant?: "primary" | "outline";
  className?: string;
};

export function WriteButton({
  otherUserId,
  lotId,
  postId,
  label,
  variant = "outline",
  className,
}: Props) {
  const baseClass =
    variant === "primary"
      ? "bg-foreground text-background hover:bg-foreground/90"
      : "border border-foreground/15 hover:bg-foreground/5";
  return (
    <form action={startConversationAction} className="inline-block">
      <input type="hidden" name="other" value={otherUserId} />
      {lotId ? <input type="hidden" name="lot" value={lotId} /> : null}
      {postId ? <input type="hidden" name="post" value={postId} /> : null}
      <button
        type="submit"
        className={`inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors ${baseClass} ${className ?? ""}`}
      >
        {label}
      </button>
    </form>
  );
}
