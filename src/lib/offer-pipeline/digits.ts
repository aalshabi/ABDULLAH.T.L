/**
 * Canonical Arabic-Indic / Persian → ASCII digit conversion.
 *
 * The mapping is 1:1 per code unit, so string length and character indices are
 * PRESERVED — a match found on the converted copy has the same indices in the
 * original text (used to slice authentic evidence). This is the single source
 * of digit normalization for the whole pipeline; both the text extractor and
 * the normalization layer import it.
 */

const ARABIC_INDIC_OFFSET = 0x0660; // ٠..٩
const PERSIAN_OFFSET = 0x06f0; // ۰..۹

export function toWesternDigits(input: string): string {
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
