/**
 * Build the list of fields that are absent from the offer, each tagged with its
 * requirement (required / recommended / context-dependent).
 */

import type { ExtractedOfferFacts } from "@/lib/offer-pipeline/types";
import type { MissingField } from "./types";
import { FIELDS, isFieldPresent } from "./required-fields";

export function buildMissingFields(facts: ExtractedOfferFacts): MissingField[] {
  return FIELDS.filter((field) => !isFieldPresent(field, facts)).map((field) => ({
    key: field.key,
    label: field.label,
    requirement: field.requirement,
  }));
}
