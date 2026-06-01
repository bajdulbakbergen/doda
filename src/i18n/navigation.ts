import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

const navigation = createNavigation(routing);

export const { Link, usePathname, useRouter, getPathname } = navigation;

/**
 * Обёртка над `navigation.redirect` с явным `never`. Без неё TypeScript
 * (по крайней мере 5.x) не сужает типы после redirect внутри Server Actions
 * и `if (!x) redirect(...)` ветвей - destructured тип теряет `never`.
 */
export function redirect(args: { href: string; locale: string }): never {
  navigation.redirect(args);
  // Недостижимо: redirect внутри уже выбросил RedirectError.
  // Явный throw, чтобы TS однозначно увидел `never`.
  throw new Error("unreachable");
}
