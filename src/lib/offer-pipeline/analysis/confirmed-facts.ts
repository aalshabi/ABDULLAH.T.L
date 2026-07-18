/**
 * Build the list of confirmed facts — only facts that are actually present and
 * carry evidence are included. A fact without evidence is never surfaced.
 */

import type { ExtractedOfferFacts, Fact } from "@/lib/offer-pipeline/types";
import type { Bi } from "@/lib/offer-pipeline/types";
import type { ConfirmedFact } from "./types";
import { FIELDS } from "./required-fields";

function labelFor(key: string): Bi {
  return FIELDS.find((f) => f.key === key)?.label ?? { ar: key, en: key };
}

export function buildConfirmedFacts(facts: ExtractedOfferFacts): ConfirmedFact[] {
  const out: ConfirmedFact[] = [];

  const add = (key: string, fact: Fact<unknown> | undefined) => {
    if (!fact || !fact.evidence) return; // never surface a fact without evidence
    out.push({
      key,
      label: labelFor(key),
      value: fact.value,
      evidence: fact.evidence,
      confidenceType: "exact",
    });
  };

  add("totalPrice", facts.price);
  add("currency", facts.currency);
  add("nights", facts.nights);
  add("destination", facts.destination);
  add("travellers", facts.travelers);
  add("board", facts.board);
  add("baggage", facts.baggage);
  add("transfers", facts.transfer);
  add("insurance", facts.insurance);
  add("visa", facts.visa);

  return out;
}
