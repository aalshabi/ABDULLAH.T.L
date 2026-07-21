/**
 * Number normalization — tolerant parsing of integers and monetary amounts.
 * Digit conversion comes from the canonical pipeline util (single source).
 */

import { toWesternDigits } from "@/lib/offer-pipeline/digits";

/** Convert Arabic-Indic and Persian digits to ASCII 0-9 (length preserving). */
export const normalizeArabicDigits = toWesternDigits;

function toPositive(n: number): number | null {
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Normalize a positive integer from a number or a (possibly Arabic-digit) string. */
export function toNormalizedInt(raw: string | number): number | null {
  if (typeof raw === "number") {
    return Number.isFinite(raw) && raw > 0 ? Math.trunc(raw) : null;
  }
  const s = normalizeArabicDigits(raw).replace(/[,٬'\s]/g, "");
  if (!/^\d+$/.test(s)) return null;
  return toPositive(Number(s));
}

/** A non-negative integer (e.g. children count), from number or string. */
export function toNormalizedCount(raw: string | number): number | null {
  if (typeof raw === "number") {
    return Number.isFinite(raw) && raw >= 0 ? Math.trunc(raw) : null;
  }
  const s = normalizeArabicDigits(raw).replace(/[,٬'\s]/g, "");
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Normalize a positive monetary amount, tolerating grouping and decimals. */
export function toNormalizedAmount(raw: string | number): number | null {
  if (typeof raw === "number") return toPositive(raw);
  const s = normalizeArabicDigits(raw).replace(/\s/g, "");
  if (/^\d{1,3}([.,٬']\d{3})+$/.test(s)) return toPositive(Number(s.replace(/[.,٬']/g, "")));
  if (/^\d+[.,]\d{1,2}$/.test(s)) return toPositive(Number(s.replace(",", ".")));
  if (/^\d+$/.test(s)) return toPositive(Number(s));
  return null;
}
