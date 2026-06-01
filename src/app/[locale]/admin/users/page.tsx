import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getAdminUsers } from "@/features/admin/queries/get-admin-stats";

export const metadata: Metadata = { title: "Admin · Пользователи", robots: { index: false, follow: false } };

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        Пользователи <span className="text-foreground/40 text-base">({users.length})</span>
      </h1>

      <div className="border-foreground/10 overflow-hidden rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-foreground/[0.03] text-foreground/55 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Пользователь</th>
              <th className="px-4 py-3 text-left font-medium">Статус</th>
              <th className="px-4 py-3 text-left font-medium">Согласия</th>
              <th className="px-4 py-3 text-left font-medium">Регистрация</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-foreground/5 divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-foreground/[0.02]">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.display_name}</div>
                  <div className="text-foreground/50 text-xs">@{u.slug}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.is_verified ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="bg-foreground/10 text-foreground/60 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium">
                        Не верифицирован
                      </span>
                    )}
                    {u.is_admin ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                        ★ Admin
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums">{u.consents_count}</td>
                <td className="text-foreground/65 px-4 py-3 font-mono text-xs">
                  {new Date(u.created_at).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-foreground/70 hover:text-foreground text-xs"
                  >
                    Подробнее →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
