import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/shared/ui/avatar";
import { formatPrice } from "@/shared/lib/format";
import { LotStatusBadge } from "@/features/lots/components/lot-status-badge";
import { LotDeadline } from "@/features/lots/components/lot-deadline";
import { JsonLd, lotJsonLd } from "@/shared/components/seo/json-ld";
import { CloseLotForm } from "@/features/lots/components/lot-actions";
import { BidsListRealtime } from "@/features/bids/components/bids-list-realtime";
import { BidForm } from "@/features/bids/components/bid-form";
import { WriteButton } from "@/features/messages/components/write-button";
import { InviteBanner } from "@/features/lot-invites/components/invite-banner";
import { getLotById } from "@/features/lots/queries/get-lot";
import { getActiveBidsForLot } from "@/features/bids/queries/get-bids";
import { getCurrentProfile } from "@/features/profile/queries/get-profile";
import { getMyInviteForLot } from "@/features/lot-invites/queries/get-invites";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lot = await getLotById(id);
  return lot ? { title: lot.title, description: lot.description.slice(0, 160) } : { title: "404" };
}

export default async function LotDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [lot, bids, profile] = await Promise.all([
    getLotById(id),
    getActiveBidsForLot(id),
    getCurrentProfile(),
  ]);

  if (!lot) notFound();

  const myInvite = lot.is_private ? await getMyInviteForLot(lot.id) : null;

  const t = await getTranslations({ locale, namespace: "lots" });
  const tDetail = await getTranslations({ locale, namespace: "lots.detail" });

  const isOwner = profile?.id === lot.owner.id;
  const isInvitedAccepted = !!myInvite?.accepted_at;
  const isVerified = profile?.is_verified ?? false;
  const myBid = bids.find((b) => b.bidder_id === profile?.id) ?? null;
  const lowestBid = bids[0]?.amount ?? null;
  // Server component, рендерится по запросу — Date.now() даёт время запроса.
  // eslint-disable-next-line react-hooks/purity
  const deadlinePassed = new Date(lot.deadline_at).getTime() <= Date.now();
  const canBid =
    !!profile &&
    isVerified &&
    !isOwner &&
    lot.status === "open" &&
    !deadlinePassed &&
    (!lot.is_private || isInvitedAccepted);
  const canClose = isOwner && (lot.status === "open" || lot.status === "closing");
  const canSelectWinner = isOwner && lot.status === "closed" && !lot.winner_bid_id && bids.length > 0;
  const categoryName = locale === "kk" ? lot.category.name_kk : lot.category.name_ru;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <JsonLd data={lotJsonLd(lot, lot.owner.display_name)} />
      <nav className="text-foreground/60 mb-6 text-sm">
        <Link href="/lots" className="hover:text-foreground transition-colors">
          ← {t("backToCatalog")}
        </Link>
      </nav>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <LotStatusBadge status={lot.status} />
          <Link
            href={`/categories/${lot.category.slug}`}
            className="text-foreground/60 hover:text-foreground transition-colors"
          >
            {categoryName}
          </Link>
          <span className="text-foreground/40">·</span>
          <span className="text-foreground/60">{lot.region}</span>
          {lot.is_private ? (
            <>
              <span className="text-foreground/40">·</span>
              <span className="font-medium text-amber-700 dark:text-amber-300">
                {tDetail("privateBadge")}
              </span>
            </>
          ) : null}
        </div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {lot.title}
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/u/${lot.owner.slug}`}
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Avatar src={lot.owner.avatar_url} alt={lot.owner.display_name} size={32} />
            <div className="text-sm">
              <div className="font-medium">{lot.owner.display_name}</div>
              {lot.owner.city ? (
                <div className="text-foreground/50 text-xs">{lot.owner.city}</div>
              ) : null}
            </div>
          </Link>
          {profile && !isOwner ? (
            <WriteButton
              otherUserId={lot.owner.id}
              lotId={lot.id}
              label={tDetail("askQuestion")}
            />
          ) : null}
        </div>

        {myInvite ? (
          <InviteBanner
            inviteId={myInvite.id}
            status={myInvite.accepted_at ? "accepted" : "pending"}
          />
        ) : null}
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-6">
            <h2 className="text-foreground/50 mb-3 text-xs font-medium uppercase tracking-wider">
              {tDetail("descriptionSection")}
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{lot.description}</p>
          </section>

          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">{tDetail("bidsSection")}</h2>
              <span className="text-foreground/50 text-xs">
                {tDetail("bidsCount", { count: bids.length })}
              </span>
            </div>
            <BidsListRealtime
              lotId={lot.id}
              initialBids={bids}
              currency={lot.currency}
              currentUserId={profile?.id ?? null}
              ownerId={lot.owner.id}
              canSelectWinner={canSelectWinner}
              winnerBidId={lot.winner_bid_id}
            />
          </section>
        </div>

        <aside className="space-y-4">
          <div className="border-foreground/10 bg-foreground/[0.02] space-y-3 rounded-2xl border p-5">
            <div className="text-foreground/50 text-xs font-medium uppercase tracking-wider">
              {tDetail("deadlineLabel")}
            </div>
            <div className="text-2xl font-semibold tabular-nums">
              <LotDeadline deadlineISO={lot.deadline_at} />
            </div>
            {lot.starting_price != null ? (
              <div className="text-foreground/60 text-sm">
                {tDetail("startingPrice")}{" "}
                <span className="text-foreground font-medium">
                  {formatPrice(lot.starting_price, lot.currency)}
                </span>
              </div>
            ) : null}
            {lot.max_price != null ? (
              <div className="text-foreground/60 text-sm">
                {tDetail("maxPrice")}{" "}
                <span className="text-foreground font-medium">
                  {formatPrice(lot.max_price, lot.currency)}
                </span>
              </div>
            ) : null}
          </div>

          {canBid ? (
            <div className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-5">
              <h3 className="mb-4 text-sm font-semibold">{tDetail("bidFormTitle")}</h3>
              <BidForm
                lotId={lot.id}
                currency={lot.currency}
                lowestBid={lowestBid}
                startingPrice={lot.starting_price}
                myCurrentAmount={myBid?.amount ?? null}
                myChangeCount={myBid?.change_count ?? 0}
              />
            </div>
          ) : !profile ? (
            <div className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-5 text-sm">
              <Link href="/auth/sign-in" className="font-medium underline underline-offset-2">
                {tDetail("signInToBid")}
              </Link>
            </div>
          ) : !isVerified && !isOwner ? (
            <div className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-5 text-sm">
              <Link
                href="/account/verification"
                className="font-medium underline underline-offset-2"
              >
                {tDetail("verifyToBid")}
              </Link>
            </div>
          ) : isOwner ? (
            <div className="border-foreground/10 bg-foreground/[0.02] space-y-3 rounded-2xl border p-5">
              <h3 className="text-sm font-semibold">{tDetail("ownerControls")}</h3>
              {canClose ? <CloseLotForm lotId={lot.id} /> : null}
              {canSelectWinner ? (
                <p className="text-foreground/60 text-xs">{tDetail("selectWinnerHint")}</p>
              ) : null}
              {lot.winner_bid_id ? (
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  ✓ {tDetail("winnerSelected")}
                </p>
              ) : null}
            </div>
          ) : deadlinePassed || lot.status === "closed" ? (
            <div className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-5 text-sm">
              <p className="text-foreground/70">{tDetail("biddingEnded")}</p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
