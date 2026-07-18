/**
 * Normalization Engine — canonicalizes the VALUES of already-extracted facts
 * (currency codes, numbers, board plans, baggage units, nights) and dedupes
 * warnings. It runs between extraction and analysis and is independent of any
 * specific extractor.
 *
 * Invariants (guaranteed by construction below):
 *  - `evidence` is preserved exactly (never rewritten).
 *  - `confidenceType` is preserved exactly (never changed).
 *  - No fact is invented; a fact whose value cannot be normalized is dropped
 *    rather than replaced with a guess.
 *  - This module does NO extraction, analysis, I/O, or persistence.
 */

import type { Bi, ExtractedOfferFacts, Fact, OfferTravelers } from "@/lib/offer-pipeline/types";
import { normalizeCurrencyCode } from "./currency";
import { normalizeBoardCode } from "./board";
import { normalizeBaggage } from "./baggage";
import { normalizeNights } from "./nights";
import { toNormalizedAmount, toNormalizedCount, toNormalizedInt } from "./numbers";
import { dedupeBi } from "./dedupe";

/** Re-wrap a fact with a new value, preserving evidence and confidenceType. */
function withValue<T>(fact: Fact<unknown>, value: T): Fact<T> {
  return { value, evidence: fact.evidence, confidenceType: fact.confidenceType };
}

/** Canonicalize the values of an ExtractedOfferFacts. Evidence/confidence kept. */
export function normalizeFacts(facts: ExtractedOfferFacts): ExtractedOfferFacts {
  const out: ExtractedOfferFacts = {};

  if (facts.price) {
    const amount = toNormalizedAmount(facts.price.value.amount);
    if (amount !== null) {
      out.price = withValue(facts.price, {
        amount,
        currency: normalizeCurrencyCode(facts.price.value.currency),
      });
    }
  }

  if (facts.currency) {
    out.currency = withValue(facts.currency, normalizeCurrencyCode(facts.currency.value));
  }

  if (facts.nights) {
    const n = normalizeNights(facts.nights.value);
    if (n !== null) out.nights = withValue(facts.nights, n);
  }

  if (facts.travelers) {
    const value: OfferTravelers = {};
    if (facts.travelers.value.adults !== undefined) {
      const a = toNormalizedInt(facts.travelers.value.adults);
      if (a !== null) value.adults = a;
    }
    if (facts.travelers.value.children !== undefined) {
      const c = toNormalizedCount(facts.travelers.value.children);
      if (c !== null) value.children = c;
    }
    if (value.adults !== undefined || value.children !== undefined) {
      out.travelers = withValue(facts.travelers, value);
    }
  }

  if (facts.board) out.board = withValue(facts.board, normalizeBoardCode(facts.board.value));
  if (facts.baggage) out.baggage = withValue(facts.baggage, normalizeBaggage(facts.baggage.value));

  // Boolean/structured facts are already canonical — carried through untouched.
  if (facts.flight) out.flight = facts.flight;
  if (facts.transfer) out.transfer = facts.transfer;
  if (facts.insurance) out.insurance = facts.insurance;
  if (facts.visa) out.visa = facts.visa;
  if (facts.destination) out.destination = withValue(facts.destination, facts.destination.value.trim());

  return out;
}

/**
 * Normalize a full extraction output: canonicalize the fact values and dedupe
 * the warnings list.
 */
export function normalizeExtraction(input: { facts: ExtractedOfferFacts; warnings: Bi[] }): {
  facts: ExtractedOfferFacts;
  warnings: Bi[];
} {
  return { facts: normalizeFacts(input.facts), warnings: dedupeBi(input.warnings) };
}

export { normalizeCurrencyCode, normalizeBoardCode, normalizeBaggage, normalizeNights, dedupeBi };
export { normalizeArabicDigits, toNormalizedInt, toNormalizedAmount, toNormalizedCount } from "./numbers";
