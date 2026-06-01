import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { VerificationReviewForm } from "@/features/admin/components/verification-review-form";

export const metadata: Metadata = {
  title: "Admin · Верификации",
  robots: { index: false, follow: false },
};

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

export default async function AdminVerificationsPage() {
  const supabase = await createClient();
  const { data: pending } = await supabase
    .from("verifications")
    .select(
      `*, profile:profiles!verifications_user_id_fkey(id, slug, display_name, avatar_url)`,
    )
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });

  // Подписываем URL-ы документов параллельно одним батчем.
  const allPaths: string[] = [];
  for (const v of pending ?? []) {
    if (Array.isArray(v.document_paths)) allPaths.push(...(v.document_paths as string[]));
  }
  const signedByPath = new Map<string, string>();
  if (allPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("verification-docs")
      .createSignedUrls(allPaths, SIGNED_URL_TTL_SECONDS);
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) signedByPath.set(s.path, s.signedUrl);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Заявки на верификацию{" "}
        <span className="text-foreground/40 text-base">({pending?.length ?? 0})</span>
      </h1>

      {!pending || pending.length === 0 ? (
        <p className="text-foreground/60 text-sm">Pending заявок нет.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((v) => {
            const p = v.profile as {
              id: string;
              slug: string;
              display_name: string;
            } | null;
            const paths = (v.document_paths as string[]) ?? [];
            return (
              <div
                key={v.id}
                className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-foreground/55 text-xs uppercase tracking-wider">
                      {v.entity_type}
                    </div>
                    <div className="mt-0.5 text-base font-semibold">{v.legal_name}</div>
                    <div className="text-foreground/65 mt-1 text-xs">
                      БИН: <span className="font-mono">{v.bin}</span>
                      {p ? (
                        <>
                          {" · "}
                          <Link
                            href={`/admin/users/${p.id}`}
                            className="text-foreground/80 hover:underline"
                          >
                            @{p.slug}
                          </Link>
                        </>
                      ) : null}
                    </div>
                    <div className="text-foreground/55 mt-1 font-mono text-xs">
                      Подано {new Date(v.submitted_at).toLocaleString("ru-RU")}
                    </div>
                  </div>
                  {paths.length > 0 ? (
                    <div className="text-foreground/65 max-w-xs space-y-1 text-xs">
                      <div className="text-foreground/55 mb-1 uppercase tracking-wider text-[10px]">
                        Документы ({paths.length})
                      </div>
                      <ul className="space-y-1">
                        {paths.map((path, i) => {
                          const url = signedByPath.get(path);
                          const filename = path.split("/").pop() ?? path;
                          return (
                            <li key={i}>
                              {url ? (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-foreground hover:underline"
                                >
                                  📎 {filename}
                                </a>
                              ) : (
                                <span className="text-foreground/40">📎 {filename} (не доступен)</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                      <div className="text-foreground/40 text-[10px]">
                        Ссылки действительны {SIGNED_URL_TTL_SECONDS / 60} мин
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4">
                  <VerificationReviewForm verificationId={v.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
