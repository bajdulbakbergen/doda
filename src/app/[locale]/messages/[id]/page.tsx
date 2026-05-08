import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import { Avatar } from "@/shared/ui/avatar";
import { MessageThreadRealtime } from "@/features/messages/components/message-thread-realtime";
import { MessageForm } from "@/features/messages/components/message-form";
import { InvitePicker } from "@/features/lot-invites/components/invite-picker";
import {
  getConversationDetail,
  getMessagesForConversation,
} from "@/features/messages/queries/get-conversations";
import { getMyPrivateOpenLots } from "@/features/lot-invites/queries/get-my-private-lots";
import { getInvitesForBidder } from "@/features/lot-invites/queries/get-invites";
import { getCurrentProfile } from "@/features/profile/queries/get-profile";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "messages.thread" });
  return { title: t("title") };
}

export default async function MessageThreadPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  if (!profile) redirect({ href: "/auth/sign-in?next=/messages", locale });

  const detail = await getConversationDetail(id);
  if (!detail) notFound();

  const [messages, t] = await Promise.all([
    getMessagesForConversation(id),
    getTranslations({ locale, namespace: "messages.thread" }),
  ]);

  const otherParty = detail.participants.find((p) => p.id !== profile.id);
  if (!otherParty) notFound();

  const [myPrivateLots, otherInvites] = await Promise.all([
    getMyPrivateOpenLots(),
    getInvitesForBidder(otherParty.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <nav className="text-foreground/60 mb-4 text-sm">
        <Link href="/messages" className="hover:text-foreground transition-colors">
          ← {t("backToList")}
        </Link>
      </nav>

      <header className="border-foreground/10 mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <Link
          href={`/u/${otherParty.slug}`}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Avatar src={otherParty.avatar_url} alt={otherParty.display_name} size={44} />
          <div>
            <div className="font-semibold">{otherParty.display_name}</div>
            <div className="text-foreground/50 text-xs">@{otherParty.slug}</div>
          </div>
        </Link>

        {detail.lot ? (
          <Link
            href={`/lots/${detail.lot.id}`}
            className="border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.04] rounded-xl border px-3 py-2 text-xs transition-colors"
          >
            <div className="text-foreground/50 uppercase tracking-wider">{t("contextLot")}</div>
            <div className="text-foreground font-medium">{detail.lot.title}</div>
          </Link>
        ) : detail.post ? (
          <Link
            href={`/posts/${detail.post.id}`}
            className="border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.04] rounded-xl border px-3 py-2 text-xs transition-colors"
          >
            <div className="text-foreground/50 uppercase tracking-wider">{t("contextPost")}</div>
            <div className="text-foreground font-medium">{detail.post.title}</div>
          </Link>
        ) : null}
      </header>

      {myPrivateLots.length > 0 ? (
        <div className="mb-6">
          <InvitePicker
            invitableLots={myPrivateLots.filter(
              (lot) => !otherInvites.some((inv) => inv.lot_id === lot.id),
            )}
            inviteeId={otherParty.id}
            inviteeName={otherParty.display_name}
          />
        </div>
      ) : null}

      <MessageThreadRealtime
        conversationId={detail.id}
        initialMessages={messages}
        myUserId={profile.id}
        participants={detail.participants}
      />

      <div className="mt-4">
        <MessageForm conversationId={detail.id} />
      </div>
    </div>
  );
}
