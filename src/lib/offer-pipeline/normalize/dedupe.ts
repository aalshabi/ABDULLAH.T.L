/**
 * Deduplication helpers used by the normalization layer. Order is preserved
 * (first occurrence wins).
 */

import type { Bi } from "@/lib/offer-pipeline/types";

/** Remove duplicate bilingual entries (same ar + en). */
export function dedupeBi(items: Bi[]): Bi[] {
  const seen = new Set<string>();
  const out: Bi[] = [];
  for (const item of items) {
    const key = [item.ar, item.en].join("\n");
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}
