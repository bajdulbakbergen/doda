import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Vercel cron endpoint - каждые 15 минут:
 * см. vercel.json. Рассылает уведомления "лот закрывается через час"
 * активным bidder-ам и владельцу. Дедупликация - на стороне SQL-функции.
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

  const { data, error } = await admin.rpc("process_closing_soon_notifications");
  if (error) {
    console.error("[cron/process-closing-soon] failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, notified: data ?? 0 });
}
