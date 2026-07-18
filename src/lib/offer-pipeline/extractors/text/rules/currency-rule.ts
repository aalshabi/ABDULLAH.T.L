/**
 * CurrencyRule — detects the currency stated in the offer, independently of any
 * price. When exactly one currency family appears, it is extracted. When two or
 * more different currencies appear, the result is ambiguous, so nothing is
 * extracted and a warning is added instead.
 */

import type { ExtractionRule, RuleResult } from "../rule";
import { detectCurrencies, exact } from "../utils";

export const currencyRule: ExtractionRule = {
  key: "currency",
  apply(text: string): RuleResult {
    const hits = detectCurrencies(text);
    if (hits.length === 0) return { facts: {}, warnings: [] };

    const codes = new Set(hits.map((h) => h.code));
    if (codes.size > 1) {
      return {
        facts: {},
        warnings: [
          {
            ar: "ذُكرت أكثر من عملة، فلم تُستخرج عملة مؤكدة.",
            en: "More than one currency was mentioned; no single currency extracted.",
          },
        ],
      };
    }

    const first = hits[0];
    return { facts: { currency: exact(first.code, first.token) }, warnings: [] };
  },
};
