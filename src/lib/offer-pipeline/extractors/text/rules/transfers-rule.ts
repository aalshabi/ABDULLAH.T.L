/**
 * TransfersRule — extracts whether airport transfers are included. Explicit
 * negation → false; an explicit provided transfer (private/shared/included) →
 * true. A bare mention without status is not extracted (warning instead).
 */

import type { ExtractionRule, RuleResult } from "../rule";
import { detectInclusion } from "../signals";
import { exact } from "../utils";

const EXCLUDE = /(?:التوصيل|المواصلات|النقل|transfers?)[^.،\n]{0,20}?(?:غير\s*مشمول|غير\s*شامل|not\s*included|excluded)|بدون\s*(?:توصيل|مواصلات|نقل)|no\s*transfers?/i;
const INCLUDE = /(?:استقبال\s*و?توصيل|توصيل\s*(?:من\s*و?إلى\s*)?المطار|توصيل\s*خاص|مواصلات\s*مشمولة|النقل\s*مشمول)|(?:airport\s*)?transfers?[^.\n]{0,20}?included|includes?\s*(?:airport\s*)?transfers?|private\s*transfers?|shared\s*(?:shuttle|transfer)/i;
const MENTION = /توصيل|مواصلات|transfers?/i;

export const transfersRule: ExtractionRule = {
  key: "transfer",
  apply(text: string): RuleResult {
    const hit = detectInclusion(text, INCLUDE, EXCLUDE);
    if (hit) return { facts: { transfer: exact({ included: hit.value }, hit.evidence) }, warnings: [] };

    if (MENTION.test(text)) {
      return {
        facts: {},
        warnings: [
          {
            ar: "ذُكر التوصيل دون توضيح إن كان مشمولًا، فلم تُستخرج حقيقة.",
            en: "Transfer was mentioned without stating inclusion; no fact extracted.",
          },
        ],
      };
    }

    return { facts: {}, warnings: [] };
  },
};
