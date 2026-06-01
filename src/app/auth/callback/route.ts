import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const LOCALES = new Set(["ru", "kk"]);
const DEFAULT_LOCALE = "ru";

function detectLocale(request: NextRequest): string {
  // 1) NEXT_LOCALE cookie выставлен next-intl middleware
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && LOCALES.has(cookieLocale)) return cookieLocale;
  // 2) Accept-Language как fallback
  const accept = request.headers.get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const tag = part.trim().split("-")[0].toLowerCase();
    if (LOCALES.has(tag)) return tag;
  }
  return DEFAULT_LOCALE;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next") ?? "/";
  // Защита от open redirect: только относительные пути.
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";
  const locale = detectLocale(request);

  // Если в next уже есть префикс локали - не дублируем. Иначе добавляем.
  const localizedNext =
    LOCALES.has(next.split("/")[1] ?? "") ? next : `/${locale}${next === "/" ? "" : next}`;

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}/auth/sign-in?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/${locale}/auth/sign-in?error=callback_failed`);
  }

  return NextResponse.redirect(`${origin}${localizedNext}`);
}
