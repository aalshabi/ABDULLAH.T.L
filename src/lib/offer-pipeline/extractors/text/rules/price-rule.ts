/**
 * PriceRule — extracts a monetary amount that is directly adjacent to a
 * currency token (either order), yielding a complete `price` fact. A bare
 * number with no adjacent currency is intentionally NOT extracted (ambiguous).
 */

import type { OfferPrice } from "@/lib/offer-pipeline/types";
import type { OfferObservations } from "@/lib/offer-pipeline/analysis/types";
import type { ExtractionRule, RuleResult } from "../rule";
import {
  AMOUNT_PATTERN,
  CURRENCY_ALT,
  exact,
  parseAmount,
  toWesternDigits,
  tokenToCurrencyCode,
} from "../utils";

const AMOUNT_THEN_CURRENCY = new RegExp(`(${AMOUNT_PATTERN})\\s*(${CURRENCY_ALT})`, "gi");
const CURRENCY_THEN_AMOUNT = new RegExp(`(${CURRENCY_ALT})\\s*(${AMOUNT_PATTERN})`, "gi");
const FINAL_PRICE_LABEL =
  /(?:السعر\s+(?:النهائي|الإجمالي)|(?:final|total)\s+price)\s*[:：\-–—]?\s*$/i;
const CLAUSE_BOUNDARY = /[،,؛;.!?\n]/;

type PriceObservation = NonNullable<OfferObservations["prices"]>[number];

interface PriceMatch extends PriceObservation {
  index: number;
}

function collectMatches(
  normalizedText: string,
  originalText: string,
  pattern: RegExp,
  amountGroup: number,
  currencyGroup: number
): PriceMatch[] {
  pattern.lastIndex = 0;
  const matches: PriceMatch[] = [];

  for (const match of normalizedText.matchAll(pattern)) {
    const amount = parseAmount(match[amountGroup] ?? "");
    const currency = tokenToCurrencyCode(match[currencyGroup] ?? "");
    if (amount === null || currency === null || match.index === undefined) continue;

    matches.push({
      amount,
      currency,
      evidence: originalText.slice(match.index, match.index + match[0].length),
      index: match.index,
    });
  }

  return matches;
}

function hasFinalPriceContext(text: string, matchIndex: number): boolean {
  const clausePrefix = text
    .slice(0, matchIndex)
    .split(CLAUSE_BOUNDARY)
    .at(-1);
  return FINAL_PRICE_LABEL.test(clausePrefix ?? "");
}

/**
 * Collect final/total prices when they are explicitly labelled. Without such a
 * label, preserve the existing single-price extraction fallback. This avoids
 * treating itemized hotel, flight, or fee amounts as competing final prices.
 */
export function extractPriceObservations(text: string): PriceObservation[] {
  const normalizedText = toWesternDigits(text);
  const allMatches = [
    ...collectMatches(normalizedText, text, AMOUNT_THEN_CURRENCY, 1, 2),
    ...collectMatches(normalizedText, text, CURRENCY_THEN_AMOUNT, 2, 1),
  ].sort((left, right) => left.index - right.index);
  const finalPriceMatches = allMatches.filter((match) =>
    hasFinalPriceContext(normalizedText, match.index)
  );
  const matches =
    finalPriceMatches.length > 0 ? finalPriceMatches : allMatches.slice(0, 1);

  const seen = new Set<string>();
  const observations: PriceObservation[] = [];
  for (const { amount, currency, evidence } of matches) {
    const key = `${amount}\u0000${currency}`;
    if (seen.has(key)) continue;
    seen.add(key);
    observations.push({ amount, currency, evidence });
  }
  return observations;
}

export const priceRule: ExtractionRule = {
  key: "price",
  apply(text: string): RuleResult {
    const prices = extractPriceObservations(text);
    const first = prices[0];
    if (!first) return { facts: {}, warnings: [] };

    const value: OfferPrice = { amount: first.amount, currency: first.currency };
    return {
      facts: { price: exact(value, first.evidence) },
      warnings: [],
      observations: {
        prices,
        currencies: prices.map((price) => ({
          code: price.currency,
          evidence: price.evidence,
        })),
      },
    };
  },
};
