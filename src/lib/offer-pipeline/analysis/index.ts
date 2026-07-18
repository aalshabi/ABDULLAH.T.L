/**
 * Facts Analysis Engine — public surface.
 */

export { analyzeFacts } from "./analyze-facts";
export { detectContradictions } from "./contradictions";
export { buildConfirmedFacts } from "./confirmed-facts";
export { buildMissingFields } from "./missing-fields";
export { buildChecklist } from "./checklist";
export { buildSuggestedQuestions } from "./questions";
export { computeCompleteness } from "./completeness";
export { FIELDS, REQUIRED_FIELDS, isFieldPresent } from "./required-fields";
export type {
  OfferAnalysis,
  OfferObservations,
  ConfirmedFact,
  MissingField,
  Contradiction,
  ContradictionCode,
  ChecklistItem,
  ChecklistStatus,
  SuggestedQuestion,
  OfferCompleteness,
  CompletenessField,
  FieldRequirement,
} from "./types";
