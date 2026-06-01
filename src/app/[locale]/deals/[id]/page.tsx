import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { Avatar } from "@/shared/ui/avatar";
import { formatPrice } from "@/shared/lib/format";
import { DealStatusTimeline } from "@/features/deals/components/deal-status-timeline";
import { DealActions } from "@/features/deals/components/deal-actions";
import { ReviewForm } from "@/features/reviews/components/review-form";
import { ReviewCard } from "@/features/reviews/components/review-card";
import { getDealById } from "@/features/deals/queries/get-deal";
import { getReviewsForDeal } from "@/features/reviews/queries/get-reviews";
import { getCurrentProfile } from "@/features/profile/queries/get-profile";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "deals" });
  return { title: t("detail.title") };
}

export default async function DealDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect({ href: "/auth/sign-in", locale });
  }

  const deal = await getDealById(id);
  if (!deal) notFound();

  const isCustomer = deal.customer_id === profile.id;
  const isContractor = deal.contractor_id === profile.id;
  const isParticipant = isCustomer || isContractor;

  // Закрытые сделки можно смотреть гостям если лот не приватный.
  if (!isParticipant && (deal.status !== "closed" || deal.lot.is_private)) {
    notFound();
  }

  const reviews = await getReviewsForDeal(deal.id);
  const t = await getTranslations({ locale, namespace: "deals.detail" });
  const tRoles = await getTranslations({ locale, namespace: "deals" });

  const counterparty = isCustomer ? deal.contractor : deal.customer;
  const myReviewExists = isParticipant
    ? reviews.some((r) => r.reviewer_id === profile.id)
    : false;
  const canReview = isParticipant && deal.status === "closed" && !myReviewExists;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <nav className="text-foreground/60 mb-4 text-sm">
        <Link href={`/lots/${deal.lot.id}`} className="hover:text-foreground transition-colors">
          ← {t("backToLot")}
        </Link>
      </nav>

      <header className="mb-8 space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">{deal.lot.title}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link
            href={`/u/${deal.customer.slug}`}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Avatar src={deal.customer.avatar_url} alt={deal.customer.display_name} size={24} />
            <span>
              <span className="text-foreground/50 text-xs">{tRoles("roleCustomer")}</span>{" "}
              <span className="font-medium">{deal.customer.display_name}</span>
            </span>
          </Link>
          <span className="text-foreground/30">↔</span>
          <Link
            href={`/u/${deal.contractor.slug}`}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Avatar
              src={deal.contractor.avatar_url}
              alt={deal.contractor.display_name}
              size={24}
            />
            <span>
              <span className="text-foreground/50 text-xs">{tRoles("roleContractor")}</span>{" "}
              <span className="font-medium">{deal.contractor.display_name}</span>
            </span>
          </Link>
        </div>
        <div className="text-3xl font-semibold tabular-nums">
          {formatPrice(deal.amount, deal.currency)}
        </div>
      </header>

      <section className="mb-8 space-y-4">
        <h2 className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
          {t("statusSection")}
        </h2>
        <DealStatusTimeline status={deal.status} />
        {deal.cancelled_reason ? (
          <div className="text-foreground/70 rounded-xl bg-red-50 px-4 py-3 text-sm dark:bg-red-950/30">
            <strong>{t("cancelReason")}:</strong> {deal.cancelled_reason}
          </div>
        ) : null}
      </section>

      {isParticipant && deal.status !== "closed" && deal.status !== "cancelled" ? (
        <section className="border-foreground/10 bg-foreground/[0.02] mb-8 rounded-2xl border p-5">
          <h2 className="mb-4 text-base font-semibold">{t("actionsSection")}</h2>
          <DealActions
            dealId={deal.id}
            status={deal.status}
            role={isCustomer ? "customer" : "contractor"}
          />
        </section>
      ) : null}

      {canReview ? (
        <section className="border-foreground/10 bg-foreground/[0.02] mb-8 rounded-2xl border p-5">
          <ReviewForm
            dealId={deal.id}
            revieweeId={counterparty.id}
            revieweeName={counterparty.display_name}
          />
        </section>
      ) : null}

      {reviews.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
            {t("reviewsSection")}
          </h2>
          <div className="space-y-2">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
