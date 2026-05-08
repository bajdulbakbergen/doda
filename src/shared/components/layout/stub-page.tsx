import { Link } from "@/i18n/navigation";

type Props = {
  title: string;
  body?: string;
  comingSoonLabel: string;
  backLabel: string;
};

export function StubPage({ title, body, comingSoonLabel, backLabel }: Props) {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16 sm:py-24">
      <div className="space-y-4">
        <span className="border-foreground/15 bg-foreground/[0.03] inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
          <span className="size-1.5 rounded-full bg-amber-500" />
          {comingSoonLabel}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {body ? (
          <p className="text-foreground/70 text-base leading-relaxed">{body}</p>
        ) : null}
      </div>
      <Link
        href="/"
        className="text-foreground/70 hover:text-foreground mt-10 inline-block text-sm transition-colors"
      >
        ← {backLabel}
      </Link>
    </div>
  );
}
