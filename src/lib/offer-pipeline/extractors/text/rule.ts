/**
 * The extraction-rule contract.
 *
 * A rule inspects the raw offer text in isolation and reports only what it is
 * CONFIDENT about. Rules are independent: none reads another rule's output. Each
 * returns a partial set of facts (the field it owns) plus optional warnings.
 * When a rule finds nothing certain it returns empty facts — it never guesses
 * and never emits an "inferred" fact.
 */

import type { Bi, ExtractedOfferFacts } from "@/lib/offer-pipeline/types";
import type { OfferObservations } from "@/lib/offer-pipeline/analysis/types";

export interface RuleResult {
  /** The confident facts this rule owns. Empty when nothing certain was found. */
  facts: Partial<ExtractedOfferFacts>;
  /** Non-blocking notes (e.g. a signal was present but not certain enough). */
  warnings: Bi[];
  /** Repeated explicit values retained without promoting them to extra facts. */
  observations?: OfferObservations;
}

export interface ExtractionRule {
  /** Stable identifier; also the fact key this rule owns (e.g. "price"). */
  readonly key: string;
  /** Inspect the text and return confident facts + warnings. Pure. */
  apply(text: string): RuleResult;
}

/** Convenience: an empty result (nothing found, no warnings). */
export const EMPTY_RESULT: RuleResult = { facts: {}, warnings: [] };
