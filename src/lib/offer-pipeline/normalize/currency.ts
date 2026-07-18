/**
 * Currency normalization — map any recognized currency form (Arabic word,
 * dotted abbreviation, symbol, or ISO code, in any case) to a canonical ISO
 * code. Unrecognized input is returned trimmed/upper-cased (best effort) so a
 * fact is never silently corrupted.
 */

const ISO = new Set(["SAR", "USD", "AED", "EUR"]);

export function normalizeCurrencyCode(raw: string): string {
  const trimmed = raw.trim();
  const upper = trimmed.toUpperCase();
  if (ISO.has(upper)) return upper;

  if (/ريال|﷼|ر\s?\.\s?س|(?<![A-Za-z])SR(?![A-Za-z])/i.test(trimmed)) return "SAR";
  if (/دولار|\$|(?<![A-Za-z])USD(?![A-Za-z])/i.test(trimmed)) return "USD";
  if (/درهم|د\s?\.\s?إ|(?<![A-Za-z])AED(?![A-Za-z])/i.test(trimmed)) return "AED";
  if (/يورو|€|(?<![A-Za-z])EUR(?![A-Za-z])/i.test(trimmed)) return "EUR";

  return upper;
}
