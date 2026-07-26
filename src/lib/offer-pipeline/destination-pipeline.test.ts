/**
 * End-to-end destination behaviour through the real pipeline: how a dictionary
 * match and an explicit-only mention each flow into facts, completeness and the
 * suggested questions.
 */

import { describe, it, expect } from "vitest";
import { runOfferPipeline } from "./pipeline";
import type { OfferDestination } from "./types";

async function analyze(text: string) {
  const out = await runOfferPipeline({ type: "text", text });
  if (out.status !== "ok") throw new Error(`pipeline status: ${out.status}`);
  return out;
}

const DUBAI = "عرض إلى دبي لمدة 5 ليالٍ لشخصين شامل الإفطار، السعر الإجمالي 7,500 ريال.";
const UNKNOWN = "عرض إلى بحيرة غريبة لمدة 5 ليالٍ لشخصين شامل الإفطار، السعر الإجمالي 7,500 ريال.";

describe("destination through the pipeline", () => {
  it("carries a dictionary match with its standard name and country", async () => {
    const { extraction, analysis } = await analyze(DUBAI);
    const d = extraction.facts.destination?.value as OfferDestination;
    expect(d.matchType).toBe("canonical_alias");
    expect(d.canonicalValue).toBe("Dubai");
    expect(d.countryCode).toBe("AE");
    expect(analysis.completeness.fields.find((f) => f.key === "destination")?.present).toBe(true);
  });

  // (8) an explicit mention still counts towards completeness
  it("counts an explicit-only mention as present without inventing a standard name", async () => {
    const { extraction, analysis } = await analyze(UNKNOWN);
    const d = extraction.facts.destination?.value as OfferDestination;
    expect(d.matchType).toBe("explicit_mention");
    expect(d.value).toBe("بحيرة غريبة");
    expect(d.canonicalValue).toBeUndefined();
    expect(d.countryCode).toBeUndefined();

    expect(analysis.completeness.fields.find((f) => f.key === "destination")?.present).toBe(true);
    expect(analysis.missingFields.some((m) => m.key === "destination")).toBe(false);
    expect(analysis.suggestedQuestions.some((q) => q.key === "destination")).toBe(false);
  });

  // (11) the destination tier does not disturb the rest of the analysis
  it("leaves the other facts and the questions identical across both tiers", async () => {
    const known = await analyze(DUBAI);
    const unknown = await analyze(UNKNOWN);

    for (const key of ["price", "currency", "nights", "travelers", "board"] as const) {
      expect(unknown.extraction.facts[key]).toEqual(known.extraction.facts[key]);
    }
    expect(unknown.analysis.suggestedQuestions).toEqual(known.analysis.suggestedQuestions);
    expect(unknown.analysis.completeness.present).toBe(known.analysis.completeness.present);
  });

  // (12) the 5-question cap holds on real end-to-end input
  it("never returns more than 5 questions for either tier", async () => {
    for (const text of [DUBAI, UNKNOWN]) {
      const { analysis } = await analyze(text);
      expect(analysis.suggestedQuestions.length).toBeLessThanOrEqual(5);
    }
  });

  // (9) evidence stays verbatim from the user's own text
  it("keeps evidence as a literal substring of the submitted text", async () => {
    for (const text of [DUBAI, UNKNOWN]) {
      const { extraction } = await analyze(text);
      expect(text).toContain(extraction.facts.destination!.evidence);
    }
  });

  it("surfaces a warning for an explicit-only mention but still treats it as a fact", async () => {
    const { extraction } = await analyze(UNKNOWN);
    expect(extraction.facts.destination).toBeDefined();
    expect(extraction.warnings.some((w) => w.ar.includes("بحيرة غريبة"))).toBe(true);
  });

  it("extracts nothing when a place appears without any travel marker", async () => {
    const { extraction, analysis } = await analyze(
      "مدينة ساحلية هادئة تشتهر بالمأكولات البحرية، 5 ليالٍ لشخصين بسعر 7,500 ريال"
    );
    expect(extraction.facts.destination).toBeUndefined();
    expect(analysis.missingFields.some((m) => m.key === "destination")).toBe(true);
  });
});
