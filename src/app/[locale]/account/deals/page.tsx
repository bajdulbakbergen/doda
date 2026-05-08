import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { DealCard } from "@/features/deals/components/deal-card";
import { getMyDeals } from "@/features/deals/queries/get-my-deals";
import { getCurrentProfile } from "@/features/profile/queries/get-profile";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "deals.list" });
  return { title: t("title") };
}

export default async function MyDealsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect({ href: "/auth/sign-in?next=/account/deals", locale });
  }

  const [deals, t] = await Promise.all([
    getMyDeals(),
    getTranslations({ locale, namespace: "deals.list" }),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-foreground/60 text-sm">{t("subtitle")}</p>
      </header>

      {deals.length === 0 ? (
        <div className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-12 text-center">
          <p className="text-foreground/60">{t("empty")}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} currentUserId={profile.id} />
          ))}
        </div>
      )}
    </div>
  );
}
