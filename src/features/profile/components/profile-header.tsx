import { useTranslations, useFormatter } from "next-intl";
import { Avatar } from "@/shared/ui/avatar";
import type { Profile } from "../queries/get-profile";

export function ProfileHeader({ profile }: { profile: Profile }) {
  const t = useTranslations("profile");
  const format = useFormatter();
  const memberSince = format.dateTime(new Date(profile.created_at), {
    year: "numeric",
    month: "long",
  });

  return (
    <header className="border-foreground/10 flex flex-col items-start gap-6 border-b pb-8 sm:flex-row sm:items-center">
      <Avatar src={profile.avatar_url} alt={profile.display_name} size={96} />

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{profile.display_name}</h1>
          {profile.is_verified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              <span aria-hidden>✓</span>
              {t("verified")}
            </span>
          ) : null}
        </div>

        <div className="text-foreground/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-mono text-xs">@{profile.slug}</span>
          {profile.city ? <span>{profile.city}</span> : null}
          <span>{t("memberSince", { date: memberSince })}</span>
        </div>

        {profile.bio ? (
          <p className="text-foreground/80 mt-2 text-sm leading-relaxed">{profile.bio}</p>
        ) : null}
      </div>
    </header>
  );
}
