import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import { PrivacyControls } from "@/features/account/components/privacy-controls";
import { getCurrentProfile } from "@/features/profile/queries/get-profile";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.privacy" });
  return { title: t("pageTitle") };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect({ href: "/auth/sign-in?next=/account/privacy", locale });
  }

  const supabase = await createClient();
  const { data: deletion } = await supabase
    .from("account_deletion_requests")
    .select("scheduled_for, cancelled_at")
    .eq("user_id", profile.id)
    .maybeSingle();

  const { data: consents } = await supabase
    .from("user_consents")
    .select("document_slug, document_version, accepted_at, source")
    .eq("user_id", profile.id)
    .order("accepted_at", { ascending: false });

  const t = await getTranslations({ locale, namespace: "account.privacy" });

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <nav className="text-foreground/60 mb-4 text-sm">
        <Link href="/account" className="hover:text-foreground transition-colors">
          ← {t("backToAccount")}
        </Link>
      </nav>
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("pageTitle")}</h1>
        <p className="text-foreground/60 text-sm">{t("pageSubtitle")}</p>
      </header>

      <PrivacyControls
        existingDeletion={
          deletion
            ? { scheduledFor: deletion.scheduled_for, cancelledAt: deletion.cancelled_at }
            : null
        }
      />

      <section className="mt-12 space-y-3">
        <h2 className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
          {t("consentsHistory")}
        </h2>
        {!consents || consents.length === 0 ? (
          <p className="text-foreground/60 text-sm">{t("noConsents")}</p>
        ) : (
          <ul className="border-foreground/10 divide-foreground/10 divide-y rounded-xl border text-sm">
            {consents.map((c) => (
              <li
                key={`${c.document_slug}-${c.accepted_at}`}
                className="flex flex-wrap items-center justify-between gap-2 p-3"
              >
                <Link
                  href={`/legal/${c.document_slug}`}
                  className="text-foreground hover:underline"
                >
                  {c.document_slug}
                </Link>
                <span className="text-foreground/55 font-mono text-xs">
                  v{c.document_version} · {new Date(c.accepted_at).toLocaleString("ru-RU")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
