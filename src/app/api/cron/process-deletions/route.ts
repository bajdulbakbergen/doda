import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Vercel cron endpoint - ежедневно в 04:00 (Europe/Almaty ~ UTC+5):
 * см. vercel.json. Обрабатывает истёкшие 30-дневные запросы на удаление.
 *
 * Защита: header Authorization: Bearer ${CRON_SECRET}.
 * Vercel cron автоматически подставляет этот header, если CRON_SECRET выставлен в env.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "supabase_env_missing" }, { status: 500 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.rpc("process_account_deletions");
  if (error) {
    console.error("[cron/process-deletions] failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    processed: Array.isArray(data) ? data.length : 0,
    items: data ?? [],
  });
}
