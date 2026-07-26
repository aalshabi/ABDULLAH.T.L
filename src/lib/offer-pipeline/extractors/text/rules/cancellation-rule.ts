/**
 * CancellationRule — extracts the cancellation/refund terms EXACTLY as stated.
 * The value is the matched phrase itself (never paraphrased, never interpreted
 * into a policy class), so the user always sees the offer's own wording.
 */

import type { ExtractionRule, RuleResult } from "../rule";
import { exact } from "../utils";

const POLICY =
  /(?:إلغاء\s*مجاني|الإلغاء\s*مجاني|قابل\s*لل(?:إلغاء|استرداد)|غير\s*قابل\s*لل(?:إلغاء|استرداد)|غير\s*مسترد(?:ة)?|سياسة\s*الإلغاء[^.\n]{0,40}|رسوم\s*إلغاء|free\s*cancellation|non[-\s]?refundable|refundable|cancellation\s*policy[^.\n]{0,40}|cancellation\s*fees?)/i;

export const cancellationRule: ExtractionRule = {
  key: "cancellationPolicy",
  apply(text: string): RuleResult {
    const m = POLICY.exec(text);
    if (!m) return { facts: {}, warnings: [] };

    const evidence = text.slice(m.index, m.index + m[0].length).trim();
    if (!evidence) return { facts: {}, warnings: [] };

    return { facts: { cancellationPolicy: exact(evidence, evidence) }, warnings: [] };
  },
};
