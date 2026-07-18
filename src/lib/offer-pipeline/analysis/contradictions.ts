/**
 * Deterministic, provable contradiction detection. A contradiction is reported
 * ONLY when observations genuinely disagree (distinct final prices, conflicting
 * currency, differing night counts, conflicting board, conflicting baggage, or
 * a boolean inclusion asserted both true and false).
 *
 * severity is "critical" ONLY when the conflict fundamentally blocks
 * understanding the offer — currently just multiple different final prices.
 */

import type { ExtractedOfferFacts } from "@/lib/offer-pipeline/types";
import type { Contradiction, OfferObservations } from "./types";

/** Derive per-field observation lists from a single facts object (≤ 1 each). */
function deriveObservations(facts: ExtractedOfferFacts): Required<OfferObservations> {
  const currencies: { code: string; evidence: string }[] = [];
  if (facts.currency) currencies.push({ code: facts.currency.value, evidence: facts.currency.evidence });
  if (facts.price) currencies.push({ code: facts.price.value.currency, evidence: facts.price.evidence });

  return {
    prices: facts.price
      ? [{ amount: facts.price.value.amount, currency: facts.price.value.currency, evidence: facts.price.evidence }]
      : [],
    currencies,
    nights: facts.nights ? [{ value: facts.nights.value, evidence: facts.nights.evidence }] : [],
    boards: facts.board ? [{ value: facts.board.value, evidence: facts.board.evidence }] : [],
    baggage: facts.baggage ? [{ value: facts.baggage.value, evidence: facts.baggage.evidence }] : [],
    insurance: facts.insurance ? [{ value: facts.insurance.value, evidence: facts.insurance.evidence }] : [],
    visa: facts.visa ? [{ value: facts.visa.value, evidence: facts.visa.evidence }] : [],
    transfers: facts.transfer ? [{ value: facts.transfer.value.included, evidence: facts.transfer.evidence }] : [],
  };
}

function distinct<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function detectContradictions(
  facts: ExtractedOfferFacts,
  observations?: OfferObservations
): Contradiction[] {
  const derived = deriveObservations(facts);
  const obs = { ...derived, ...(observations ?? {}) };
  const out: Contradiction[] = [];

  // multiple different final prices (by amount) → critical
  if (distinct(obs.prices.map((p) => p.amount)).length > 1) {
    out.push({
      code: "multiple_prices",
      message: { ar: "توجد أكثر من قيمة سعر نهائي مختلفة.", en: "More than one different final price is stated." },
      evidence: obs.prices.map((p) => p.evidence),
      severity: "critical",
    });
  }

  // conflicting currency for the price
  if (distinct(obs.currencies.map((c) => c.code)).length > 1) {
    out.push({
      code: "conflicting_currency",
      message: { ar: "العملة المذكورة متعارضة.", en: "The stated currency is conflicting." },
      evidence: obs.currencies.map((c) => c.evidence),
      severity: "warning",
    });
  }

  // differing night counts
  if (distinct(obs.nights.map((n) => n.value)).length > 1) {
    out.push({
      code: "conflicting_nights",
      message: { ar: "عدد الليالي مذكور بقيمتين مختلفتين.", en: "The number of nights is stated with two different values." },
      evidence: obs.nights.map((n) => n.evidence),
      severity: "warning",
    });
  }

  // conflicting board types
  if (distinct(obs.boards.map((b) => b.value)).length > 1) {
    out.push({
      code: "conflicting_board",
      message: { ar: "نوع الوجبة مذكور بشكلين متعارضين.", en: "The board type is stated in two conflicting ways." },
      evidence: obs.boards.map((b) => b.evidence),
      severity: "warning",
    });
  }

  // conflicting baggage
  if (distinct(obs.baggage.map((b) => b.value)).length > 1) {
    out.push({
      code: "conflicting_baggage",
      message: { ar: "الأمتعة مذكورة بشكلين متعارضين.", en: "Baggage is stated in two conflicting ways." },
      evidence: obs.baggage.map((b) => b.evidence),
      severity: "warning",
    });
  }

  // boolean inclusions asserted both true and false
  pushBooleanConflict(out, obs.insurance, "conflicting_insurance", {
    ar: "التأمين مذكور مشمولًا وغير مشمول.",
    en: "Insurance is stated as both included and excluded.",
  });
  pushBooleanConflict(out, obs.visa, "conflicting_visa", {
    ar: "التأشيرة مذكورة مشمولة وغير مشمولة.",
    en: "Visa is stated as both included and excluded.",
  });
  pushBooleanConflict(out, obs.transfers, "conflicting_transfers", {
    ar: "التحويلات مذكورة مشمولة وغير مشمولة.",
    en: "Transfers are stated as both included and excluded.",
  });

  return out;
}

function pushBooleanConflict(
  out: Contradiction[],
  items: { value: boolean; evidence: string }[],
  code: Contradiction["code"],
  message: { ar: string; en: string }
) {
  const hasTrue = items.some((i) => i.value === true);
  const hasFalse = items.some((i) => i.value === false);
  if (hasTrue && hasFalse) {
    out.push({ code, message, evidence: items.map((i) => i.evidence), severity: "warning" });
  }
}
