/**
 * Board normalization — map any meal-plan form to a canonical code
 * (RO/BB/HB/FB/AI). Unrecognized input is returned trimmed/upper-cased.
 */

const CODES = new Set(["RO", "BB", "HB", "FB", "AI"]);

export function normalizeBoardCode(raw: string): string {
  const trimmed = raw.trim();
  const upper = trimmed.toUpperCase();
  if (CODES.has(upper)) return upper;

  const s = trimmed.toLowerCase();
  if (/all[-\s]?inclusive|شامل\s*كلي|الكل\s*شامل/.test(s)) return "AI";
  if (/full[-\s]?board|إقامة\s*كاملة|جميع\s*الوجبات|ثلاث\s*وجبات/.test(s)) return "FB";
  if (/half[-\s]?board|نصف\s*إقامة|إفطار\s*و?عشاء/.test(s)) return "HB";
  if (/bed\s*(?:and|&|\+)?\s*breakfast|breakfast|إفطار/.test(s)) return "BB";
  if (/room\s*only|بدون\s*وجبات|بدون\s*إفطار/.test(s)) return "RO";

  return upper;
}
