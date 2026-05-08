import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { ConversationListItem } from "@/features/messages/components/conversation-list-item";
import { getMyConversations } from "@/features/messages/queries/get-conversations";
import { getCurrentProfile } from "@/features/profile/queries/get-profile";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "messages.list" });
  return { title: t("title") };
}

export default async function MessagesListPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  if (!profile) redirect({ href: "/auth/sign-in?next=/messages", locale });

  const [conversations, t] = await Promise.all([
    getMyConversations(),
    getTranslations({ locale, namespace: "messages.list" }),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-foreground/60 text-sm">{t("subtitle")}</p>
      </header>

      {conversations.length === 0 ? (
        <div className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-12 text-center">
          <p className="text-foreground/60">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <ConversationListItem key={c.id} item={c} />
          ))}
        </div>
      )}
    </div>
  );
}
