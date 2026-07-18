/**
 * BaggageRule — extracts an explicit baggage allowance as a short descriptive
 * string: a weight ("20kg"), "none", or "cabin". Only explicit signals accepted.
 */

import type { ExtractionRule, RuleResult } from "../rule";
import { exact, toWesternDigits } from "../utils";

// A checked-bag weight, e.g. "20 كجم", "٢٠kg", "20 كيلو".
const WEIGHT = /(\d{1,3})\s*(?:كجم|كغم|كيلو(?:جرام|غرام)?|kg|kilos?)/i;
// No baggage included.
const NONE = /بدون\s*(?:أمتعة|حقائب|شنط)|no\s*(?:checked\s*)?(?:baggage|luggage)|بلا\s*أمتعة/i;
// Cabin/hand baggage only.
const CABIN = /حقيبة\s*يد|أمتعة\s*يدوية|cabin\s*(?:bag|baggage)|hand\s*luggage|carry[-\s]?on/i;

export const baggageRule: ExtractionRule = {
  key: "baggage",
  apply(text: string): RuleResult {
    const norm = toWesternDigits(text);

    const none = NONE.exec(norm);
    if (none) {
      return { facts: { baggage: exact("none", text.slice(none.index, none.index + none[0].length)) }, warnings: [] };
    }

    const weight = WEIGHT.exec(norm);
    if (weight) {
      const evidence = text.slice(weight.index, weight.index + weight[0].length);
      return { facts: { baggage: exact(`${weight[1]}kg`, evidence) }, warnings: [] };
    }

    const cabin = CABIN.exec(norm);
    if (cabin) {
      return { facts: { baggage: exact("cabin", text.slice(cabin.index, cabin.index + cabin[0].length)) }, warnings: [] };
    }

    return { facts: {}, warnings: [] };
  },
};
