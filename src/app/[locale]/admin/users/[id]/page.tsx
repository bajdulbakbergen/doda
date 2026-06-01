import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/shared/ui/avatar";
import { getAdminUserDetail } from "@/features/admin/queries/get-admin-stats";

export const metadata: Metadata = { title: "Admin · Профиль", robots: { index: false, follow: false } };

type Props = { params: Promise<{ id: string }> };

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const detail = await getAdminUserDetail(id);
  if (!detail) notFound();

  const { profile, consents, verifications, recentActions, deletionRequest } = detail;

  return (
    <div className="space-y-10">
      <nav className="text-foreground/60 text-sm">
        <Link href="/admin/users" className="hover:text-foreground transition-colors">
          ← К списку
        </Link>
      </nav>

      <header className="flex flex-wrap items-start gap-6">
        <Avatar src={profile.avatar_url} alt={profile.display_name} size={64} />
        <div className="flex-1 space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">{profile.display_name}</h1>
          <div className="text-foreground/55 text-xs">
            <span className="font-mono">@{profile.slug}</span>
            {" · "}
            <span className="font-mono">{profile.id}</span>
            {" · "}
            <span>зарегистрирован {new Date(profile.created_at).toLocaleDateString("ru-RU")}</span>
          </div>
          {profile.city ? <div className="text-foreground/65 text-sm">{profile.city}</div> : null}
          {profile.bio ? <p className="text-foreground/75 text-sm">{profile.bio}</p> : null}
        </div>
        <div className="flex flex-wrap gap-1">
          {profile.is_verified ? (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              ✓ Verified
            </span>
          ) : null}
          {profile.is_admin ? (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              ★ Admin
            </span>
          ) : null}
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-foreground/55 text-xs font-medium uppercase tracking-wider">
          Журнал согласий (доказательная база)
        </h2>
        {consents.length === 0 ? (
          <p className="text-foreground/60 text-sm">Согласий нет.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="border-foreground/10 text-foreground/55 border-y text-xs uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Документ</th>
                <th className="px-3 py-2 text-left font-medium">Версия</th>
                <th className="px-3 py-2 text-left font-medium">Принят</th>
                <th className="px-3 py-2 text-left font-medium">Источник</th>
                <th className="px-3 py-2 text-left font-medium">IP</th>
              </tr>
            </thead>
            <tbody className="divide-foreground/5 divide-y">
              {consents.map((c, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">
                    <Link
                      href={`/legal/${c.document_slug}`}
                      className="text-foreground hover:underline"
                      target="_blank"
                    >
                      {c.document_slug}
                    </Link>
                  </td>
                  <td className="text-foreground/70 px-3 py-2 font-mono text-xs">
                    {c.document_version}
                  </td>
                  <td className="text-foreground/70 px-3 py-2 font-mono text-xs">
                    {new Date(c.accepted_at).toLocaleString("ru-RU")}
                  </td>
                  <td className="text-foreground/55 px-3 py-2 text-xs">{c.source}</td>
                  <td className="text-foreground/55 px-3 py-2 font-mono text-xs">
                    {c.ip ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-foreground/55 text-xs font-medium uppercase tracking-wider">
          Верификации
        </h2>
        {verifications.length === 0 ? (
          <p className="text-foreground/60 text-sm">Заявок на верификацию нет.</p>
        ) : (
          <div className="space-y-2">
            {verifications.map((v) => (
              <div key={v.id} className="border-foreground/10 rounded-xl border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">
                    {v.entity_type} · {v.legal_name}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                      v.status === "approved"
                        ? "bg-emerald-100 text-emerald-900"
                        : v.status === "rejected"
                          ? "bg-red-100 text-red-900"
                          : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
                <div className="text-foreground/65 mt-1 text-xs">
                  БИН: <span className="font-mono">{v.bin}</span> · подано{" "}
                  {new Date(v.submitted_at).toLocaleDateString("ru-RU")}
                </div>
                {v.reviewer_notes ? (
                  <div className="text-foreground/70 mt-2 text-xs italic">
                    Комментарий ревьюера: {v.reviewer_notes}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {deletionRequest ? (
        <section className="space-y-3">
          <h2 className="text-foreground/55 text-xs font-medium uppercase tracking-wider">
            Запрос на удаление аккаунта
          </h2>
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm dark:border-red-900 dark:bg-red-950/30">
            <div>
              Запрошено: {new Date(deletionRequest.requested_at).toLocaleString("ru-RU")}
            </div>
            <div>
              Запланировано на:{" "}
              {new Date(deletionRequest.scheduled_for).toLocaleDateString("ru-RU")}
            </div>
            {deletionRequest.cancelled_at ? (
              <div className="mt-1 text-emerald-700 dark:text-emerald-300">
                Отменено: {new Date(deletionRequest.cancelled_at).toLocaleString("ru-RU")}
              </div>
            ) : null}
            {deletionRequest.reason ? (
              <div className="text-foreground/65 mt-1 italic">
                Причина: {deletionRequest.reason}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-foreground/55 text-xs font-medium uppercase tracking-wider">
          Аудит действий (последние 50)
        </h2>
        {recentActions.length === 0 ? (
          <p className="text-foreground/60 text-sm">Действий нет.</p>
        ) : (
          <ul className="space-y-1">
            {recentActions.map((a) => (
              <li
                key={a.id}
                className="border-foreground/10 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-xs"
              >
                <span className="font-mono">{a.action}</span>
                <span className="text-foreground/55">
                  {a.target_type ?? "-"}
                  {a.target_id ? ` · ${a.target_id.slice(0, 8)}…` : ""}
                </span>
                <span className="text-foreground/55 font-mono">
                  {new Date(a.created_at).toLocaleString("ru-RU")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
