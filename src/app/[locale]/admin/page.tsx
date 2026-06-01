import type { Metadata } from "next";
import { getAdminStats } from "@/features/admin/queries/get-admin-stats";

export const metadata: Metadata = { title: "Admin · Дашборд", robots: { index: false, follow: false } };

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const tiles = [
    { label: "Всего пользователей", value: stats.totalUsers, hint: `из них ${stats.verifiedUsers} верифицированных` },
    { label: "Pending верификаций", value: stats.pendingVerifications, hint: "требуют решения" },
    { label: "Всего лотов", value: stats.totalLots, hint: `${stats.openLots} открытых` },
    { label: "Всего сделок", value: stats.totalDeals, hint: `${stats.closedDeals} завершено` },
    { label: "Записей в журнале согласий", value: stats.totalConsents, hint: "доказательная база" },
    { label: "Заявок на удаление аккаунта", value: stats.pendingDeletions, hint: "в очереди" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Дашборд</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="border-foreground/10 bg-foreground/[0.02] rounded-2xl border p-5"
          >
            <div className="text-foreground/55 text-xs font-medium uppercase tracking-wider">
              {tile.label}
            </div>
            <div className="mt-2 text-3xl font-semibold tabular-nums">{tile.value}</div>
            <div className="text-foreground/55 mt-1 text-xs">{tile.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
