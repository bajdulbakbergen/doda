/**
 * Форматирование денег. Дефолт KZT, разделитель тысяч - неразрывный пробел.
 */
export function formatPrice(amount: number | null | undefined, currency = "KZT"): string {
  if (amount == null) return "-";
  const formatted = new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount);
  const symbol = currency === "KZT" ? "₸" : currency;
  return `${formatted} ${symbol}`;
}

/**
 * Минимальный шаг ставки: max(1000 ₸, 0.5% от текущей лучшей).
 */
export function calculateMinStep(lowestBid: number | null | undefined): number {
  if (lowestBid == null) return 0;
  return Math.max(1000, lowestBid * 0.005);
}

/**
 * Максимальная допустимая сумма следующей ставки.
 * Если активных ставок нет - возвращаем `startingPrice` (или null если он не задан).
 */
export function calculateMaxAllowed(
  lowestBid: number | null | undefined,
  startingPrice: number | null | undefined,
): number | null {
  if (lowestBid != null) {
    return Math.floor(lowestBid - calculateMinStep(lowestBid));
  }
  return startingPrice ?? null;
}
