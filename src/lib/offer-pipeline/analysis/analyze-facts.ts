/**
 * Facts Analysis orchestrator — assembles the deterministic OfferAnalysis from
 * the (normalized) ExtractedOfferFacts. Pure: no LLM, no randomness, no I/O.
 * Optional `observations` supply multiple values per field for contradiction
 * detection; when omitted, they are derived from the facts (≤ 1 each).
 */

import type { ExtractedOfferFacts } from "@/lib/offer-pipeline/types";
import type { OfferAnalysis, OfferObservations } from "./types";
import { buildConfirmedFacts } from "./confirmed-facts";
import { detectContradictions } from "./contradictions";
import { buildMissingFields } from "./missing-fields";
import { buildChecklist } from "./checklist";
import { buildSuggestedQuestions } from "./questions";
import { computeCompleteness } from "./completeness";

export function analyzeFacts(
  facts: ExtractedOfferFacts,
  observations?: OfferObservations
): OfferAnalysis {
  const contradictions = detectContradictions(facts, observations);
  const missingFields = buildMissingFields(facts);
  const checklist = buildChecklist(facts, contradictions);

  return {
    confirmedFacts: buildConfirmedFacts(facts),
    missingFields,
    contradictions,
    checklist,
    suggestedQuestions: buildSuggestedQuestions(missingFields, checklist),
    completeness: computeCompleteness(facts),
  };
}
