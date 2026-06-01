import { Link } from "@/i18n/navigation";

type Props = {
  pathname: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  totalPages: number;
  ariaLabel?: string;
};

function buildHref(pathname: string, params: Record<string, string | undefined>, page: number): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  if (page > 1) sp.set("page", String(page));
  else sp.delete("page");
  const qs = sp.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function Pagination({ pathname, searchParams, page, totalPages, ariaLabel = "Pagination" }: Props) {
  if (totalPages <= 1) return null;
  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);
  return (
    <nav aria-label={ariaLabel} className="mt-8 flex items-center justify-center gap-2 text-sm">
      <Link
        href={buildHref(pathname, searchParams, prev)}
        aria-disabled={page === 1}
        className={`border-foreground/15 hover:bg-foreground/5 inline-flex h-9 items-center justify-center rounded-full border px-3 transition-colors ${
          page === 1 ? "pointer-events-none opacity-40" : ""
        }`}
      >
        ←
      </Link>
      <span className="text-foreground/65 px-2 tabular-nums">
        {page} / {totalPages}
      </span>
      <Link
        href={buildHref(pathname, searchParams, next)}
        aria-disabled={page === totalPages}
        className={`border-foreground/15 hover:bg-foreground/5 inline-flex h-9 items-center justify-center rounded-full border px-3 transition-colors ${
          page === totalPages ? "pointer-events-none opacity-40" : ""
        }`}
      >
        →
      </Link>
    </nav>
  );
}
