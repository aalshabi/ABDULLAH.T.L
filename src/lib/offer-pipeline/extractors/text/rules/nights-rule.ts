/**
 * NightsRule — extracts an explicit number of nights. Only "nights"/"ليالٍ"
 * units are accepted; a count of days is NOT treated as nights (no inference).
 */

import type { ExtractionRule, RuleResult } from "../rule";
import { exact, toWesternDigits } from "../utils";

// e.g. "5 ليالٍ", "٥ ليال", "لمدة 5 ليالي", "5 nights", "5-night"
const NIGHTS = /(\d{1,3})[\s-]*(?:ليال(?:ٍ|ي)?|ليلة|nights?)/i;

export const nightsRule: ExtractionRule = {
  key: "nights",
  apply(text: string): RuleResult {
    const norm = toWesternDigits(text);
    const m = NIGHTS.exec(norm);
    if (!m) return { facts: {}, warnings: [] };

    // A signed count ("-5 ليالٍ") is not a valid night count: the pattern
    // captures digits only, so the sign is checked explicitly.
    const preceding = norm[m.index - 1];
    if (preceding === "-" || preceding === "−") return { facts: {}, warnings: [] };

    const nights = Number(m[1]);
    if (!Number.isInteger(nights) || nights <= 0) return { facts: {}, warnings: [] };

    const evidence = text.slice(m.index, m.index + m[0].length);
    return { facts: { nights: exact(nights, evidence) }, warnings: [] };
  },
};
