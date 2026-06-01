import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { env } from "@/lib/env";

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // 1) intl сначала: возможный redirect / rewrite на /[locale]/*
  const response = intlMiddleware(request);

  // Если intl сделал redirect - пропускаем рефреш сессии (cookies всё равно
  // уйдут на нужном URL после редиректа).
  if (response.headers.get("location")) {
    return response;
  }

  // 2) Рефрешим Supabase-сессию: auto-refresh токенов и проброс cookies.
  // НЕ выполняйте логику между createServerClient и getUser, иначе сессия
  // может рассинхронизироваться.
  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!api|auth/callback|_next|_vercel|.*\\..*).*)"],
};
