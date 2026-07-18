/**
 * Completeness = present / required over the REQUIRED fields only, with the
 * explicit list of counted fields. No opaque score, no ratio detached from the
 * fields. The required=0 case is handled explicitly (present 0, empty fields) so
 * there is never a division by zero downstream.
 */

import type { ExtractedOfferFacts } from "@/lib/offer-pipeline/types";
import type { OfferCompleteness } from "./types";
import { REQUIRED_FIELDS, isFieldPresent } from "./required-fields";

export function computeCompleteness(facts: ExtractedOfferFacts): OfferCompleteness {
  const fields = REQUIRED_FIELDS.map((field) => ({ key: field.key, present: isFieldPresent(field, facts) }));
  const present = fields.filter((f) => f.present).length;
  return { present, required: fields.length, fields };
}
