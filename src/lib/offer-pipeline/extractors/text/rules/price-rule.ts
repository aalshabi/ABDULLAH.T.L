/**
 * PriceRule — extracts a monetary amount that is directly adjacent to a
 * currency token (either order), yielding a complete `price` fact. A bare
 * number with no adjacent currency is intentionally NOT extracted (ambiguous).
 */

import type { OfferPrice } from "@/lib/offer-pipeline/types";
import type { ExtractionRule, RuleResult } from "../rule";
import {
  AMOUNT_PATTERN,
  CURRENCY_ALT,
  exact,
  parseAmount,
  toWesternDigits,
  tokenToCurrencyCode,
} from "../utils";

const AMOUNT_THEN_CURRENCY = new RegExp(`(${AMOUNT_PATTERN})\\s*(${CURRENCY_ALT})`, "i");
const CURRENCY_THEN_AMOUNT = new RegExp(`(${CURRENCY_ALT})\\s*(${AMOUNT_PATTERN})`, "i");

export const priceRule: ExtractionRule = {
  key: "price",
  apply(text: string): RuleResult {
    const norm = toWesternDigits(text);

    let amountToken: string | null = null;
    let currencyToken: string | null = null;
    let index = -1;
    let length = 0;

    const before = AMOUNT_THEN_CURRENCY.exec(norm);
    const after = CURRENCY_THEN_AMOUNT.exec(norm);

    // Prefer whichever appears first in the text.
    const pick =
      before && after ? (before.index <= after.index ? "before" : "after") : before ? "before" : after ? "after" : null;

    if (pick === "before" && before) {
      amountToken = before[1];
      currencyToken = before[2];
      index = before.index;
      length = before[0].length;
    } else if (pick === "after" && after) {
      currencyToken = after[1];
      amountToken = after[2];
      index = after.index;
      length = after[0].length;
    }

    if (amountToken === null || currencyToken === null) return { facts: {}, warnings: [] };

    const amount = parseAmount(amountToken);
    const currency = tokenToCurrencyCode(currencyToken);
    if (amount === null || currency === null) return { facts: {}, warnings: [] };

    const evidence = text.slice(index, index + length);
    const value: OfferPrice = { amount, currency };
    return { facts: { price: exact(value, evidence) }, warnings: [] };
  },
};
