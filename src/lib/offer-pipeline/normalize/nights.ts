/**
 * Nights normalization — a positive integer, or null when invalid.
 */

import { toNormalizedInt } from "./numbers";

export function normalizeNights(raw: string | number): number | null {
  const n = toNormalizedInt(raw);
  return n !== null && n > 0 ? n : null;
}
