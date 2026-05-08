/**
 * Минимальный класс-конкатенатор без зависимостей.
 * Если позже понадобятся варианты с конфликтующими классами Tailwind,
 * мигрируем на `clsx` + `tailwind-merge`.
 */
export function cn(
  ...inputs: Array<string | number | boolean | null | undefined>
): string {
  return inputs.filter((v): v is string | number => typeof v === "string" || typeof v === "number")
    .join(" ")
    .trim()
    .replace(/\s+/g, " ");
}
