/**
 * TravellersRule — extracts explicitly numbered adults and/or children. Only
 * counts written next to a traveller word are accepted; nothing is inferred.
 */

import type { OfferTravelers } from "@/lib/offer-pipeline/types";
import type { ExtractionRule, RuleResult } from "../rule";
import { exact, toWesternDigits } from "../utils";

const ADULTS = /(\d{1,2})\s*(?:بالغ(?:ين|ون)?|كبار|راشد(?:ين)?|adults?)/i;
const CHILDREN = /(\d{1,2})\s*(?:أطفال|طفل|رضيع|children|child|kids?|infants?)/i;

export const travellersRule: ExtractionRule = {
  key: "travelers",
  apply(text: string): RuleResult {
    const norm = toWesternDigits(text);

    const adultsM = ADULTS.exec(norm);
    const childrenM = CHILDREN.exec(norm);
    if (!adultsM && !childrenM) return { facts: {}, warnings: [] };

    const value: OfferTravelers = {};
    const evidenceParts: string[] = [];

    if (adultsM) {
      const adults = Number(adultsM[1]);
      if (Number.isInteger(adults) && adults > 0) {
        value.adults = adults;
        evidenceParts.push(text.slice(adultsM.index, adultsM.index + adultsM[0].length));
      }
    }
    if (childrenM) {
      const children = Number(childrenM[1]);
      if (Number.isInteger(children) && children >= 0) {
        value.children = children;
        evidenceParts.push(text.slice(childrenM.index, childrenM.index + childrenM[0].length));
      }
    }

    if (value.adults === undefined && value.children === undefined) return { facts: {}, warnings: [] };

    return { facts: { travelers: exact(value, evidenceParts.join(" | ")) }, warnings: [] };
  },
};
