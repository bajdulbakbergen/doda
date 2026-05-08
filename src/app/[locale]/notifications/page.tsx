import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import { MarkAllReadButton } from "@/features/notifications/components/mark-all-read-button";
import { getNotifications } from "@/features/notifications/queries/get-notifications";
import { getCurrentProfile } from "@/features/profile/queries/get-profile";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "notifications" });
  return { title: t("pageTitle") };
}

export default async function NotificationsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect({ href: "/auth/sign-in?next=/notifications", locale });
  }

  const [notifications, t] = await Promise.all([
    getNotifications(),
    getTranslations({ locale, namespace: "notifications" }),
  ]);

  // Помечаем все непрочитанные как прочитанные при заходе на страницу.
  const hasUnread = notifications.some((n) => !n.read_at);
  if (hasUnread) {
    const supabase = await createClient();
    await supabase.rpc("mark_notifications_read", { p_ids: undefined });
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{t("pageTitle")}</h1>
          <p className="text-foreground/60 text-sm">{t("pageSubtitle")}</p>
        </div>
        {notifications.length > 0 ? <MarkAllReadButton /> : null}
      </header>

      {notifications.length === 0 ? (
        <div className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-12 text-center">
          <p className="text-foreground/60">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationItem key={n.id} item={n} />
          ))}
        </div>
      )}
    </div>
  );
}
