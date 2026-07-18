/**
 * Baggage normalization — canonicalize a baggage allowance to "<n>kg", "none",
 * or "cabin". Unrecognized input is returned trimmed (best effort).
 */

import { normalizeArabicDigits } from "./numbers";

export function normalizeBaggage(raw: string): string {
  const s = normalizeArabicDigits(raw).toLowerCase().trim();

  if (/بدون\s*(?:أمتعة|حقائب|شنط)|بلا\s*أمتعة|no\s*(?:checked\s*)?(?:baggage|luggage)|^none$/.test(s)) {
    return "none";
  }

  const weight = s.match(/(\d{1,3})\s*(?:كجم|كغم|كيلو(?:جرام|غرام)?|kg|kilos?)/);
  if (weight) return `${Number(weight[1])}kg`;

  if (/حقيبة\s*يد|أمتعة\s*يدوية|cabin\s*(?:bag|baggage)?|hand\s*luggage|carry[-\s]?on/.test(s)) {
    return "cabin";
  }

  return raw.trim();
}
