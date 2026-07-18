/**
 * Number normalization — Arabic-Indic / Persian digits → ASCII, and tolerant
 * parsing of integers and monetary amounts. Self-contained so the normalization
 * layer does not depend on any specific extractor.
 */

const ARABIC_INDIC_OFFSET = 0x0660; // ٠..٩
const PERSIAN_OFFSET = 0x06f0; // ۰..۹

/** Convert Arabic-Indic and Persian digits to ASCII 0-9 (length preserving). */
export function normalizeArabicDigits(input: string): string {
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0)!;
    if (code >= ARABIC_INDIC_OFFSET && code <= ARABIC_INDIC_OFFSET + 9) {
      out += String(code - ARABIC_INDIC_OFFSET);
    } else if (code >= PERSIAN_OFFSET && code <= PERSIAN_OFFSET + 9) {
      out += String(code - PERSIAN_OFFSET);
    } else {
      out += ch;
    }
  }
  return out;
}

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
