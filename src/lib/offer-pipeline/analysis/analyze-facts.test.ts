import { describe, it, expect } from "vitest";
import type { ExtractedOfferFacts, Fact } from "@/lib/offer-pipeline/types";
import { analyzeFacts } from "./analyze-facts";
import type { OfferObservations } from "./types";

function fact<T>(value: T, evidence: string): Fact<T> {
  return { value, evidence, confidenceType: "exact" };
}

const fullArabic: ExtractedOfferFacts = {
  price: fact({ amount: 3200, currency: "SAR" }, "٣٢٠٠ ر.س"),
  currency: fact("SAR", "ر.س"),
  nights: fact(5, "٥ ليالٍ"),
  destination: fact("دبي", "دبي"),
  travelers: fact({ adults: 2 }, "٢ بالغين"),
  board: fact("BB", "شامل الإفطار"),
};

describe("analyzeFacts", () => {
  // (1) full offer with no essential fields missing
  it("reports full required completeness and no missing required fields", () => {
    const a = analyzeFacts(fullArabic);
    expect(a.completeness).toEqual({
      present: 3,
      required: 3,
      fields: [
        { key: "totalPrice", present: true },
        { key: "currency", present: true },
        { key: "nights", present: true },
      ],
    });
    expect(a.missingFields.some((m) => m.requirement === "required")).toBe(false);
    expect(a.contradictions).toEqual([]);
  });

  // (2) offer missing the price
  it("marks a missing price as a required missing field (completeness 2/3)", () => {
    const a = analyzeFacts({ currency: fact("SAR", "ر.س"), nights: fact(5, "5 nights") });
    expect(a.completeness.present).toBe(2);
    const price = a.missingFields.find((m) => m.key === "totalPrice");
    expect(price?.requirement).toBe("required");
    expect(a.suggestedQuestions.some((q) => q.key === "totalPrice")).toBe(true);
  });

  // (3) offer missing the currency
  it("marks a missing currency as required missing (completeness 1/3)", () => {
    const a = analyzeFacts({ nights: fact(5, "5 nights"), board: fact("BB", "breakfast") });
    expect(a.completeness.present).toBe(1);
    expect(a.missingFields.find((m) => m.key === "currency")?.requirement).toBe("required");
    expect(a.suggestedQuestions.some((q) => q.key === "currency")).toBe(true);
  });

  // (4) offer missing the cancellation policy (recommended)
  it("surfaces a missing cancellation policy as recommended + a question", () => {
    const a = analyzeFacts(fullArabic);
    expect(a.missingFields.find((m) => m.key === "cancellationPolicy")?.requirement).toBe("recommended");
    expect(a.suggestedQuestions.some((q) => q.key === "cancellationPolicy")).toBe(true);
  });

  // (5) two different prices propagate to checklist + questions
  it("marks price conflicting on the checklist when prices differ", () => {
    const obs: OfferObservations = {
      prices: [
        { amount: 3200, currency: "SAR", evidence: "٣٢٠٠ ر.س" },
        { amount: 2800, currency: "SAR", evidence: "٢٨٠٠ ر.س" },
      ],
    };
    const a = analyzeFacts(fullArabic, obs);
    expect(a.checklist.find((c) => c.key === "totalPrice")?.status).toBe("conflicting");
    expect(a.suggestedQuestions.some((q) => q.key === "totalPrice")).toBe(true);
  });

  // (11) questions come ONLY from missing or conflicting items
  it("never asks about a present, non-conflicting field", () => {
    const a = analyzeFacts(fullArabic);
    // nights is present and consistent → no nights question
    expect(a.suggestedQuestions.some((q) => q.key === "nights")).toBe(false);
    // taxes is absent → a taxes question exists
    expect(a.suggestedQuestions.some((q) => q.key === "taxes")).toBe(true);
  });

  // (12) completeness is exactly present / required with the counted fields
  it("computes completeness precisely over required fields", () => {
    const a = analyzeFacts({ nights: fact(3, "3 nights") });
    expect(a.completeness).toEqual({
      present: 1,
      required: 3,
      fields: [
        { key: "totalPrice", present: false },
        { key: "currency", present: false },
        { key: "nights", present: true },
      ],
    });
  });

  // (13) no random score anywhere; deterministic
  it("produces no score field and is deterministic", () => {
    const a = analyzeFacts(fullArabic);
    expect("score" in a).toBe(false);
    expect(JSON.stringify(a)).not.toContain("score");
    expect(analyzeFacts(fullArabic)).toEqual(a);
  });

  // (14) never invents facts
  it("confirms only facts that are present", () => {
    const a = analyzeFacts({ nights: fact(4, "4 nights") });
    expect(a.confirmedFacts.map((c) => c.key)).toEqual(["nights"]);
  });

  // (15) preserves evidence exactly
  it("preserves evidence on confirmed facts and the checklist", () => {
    const a = analyzeFacts(fullArabic);
    expect(a.confirmedFacts.find((c) => c.key === "nights")?.evidence).toBe("٥ ليالٍ");
    expect(a.checklist.find((c) => c.key === "nights")?.evidence).toEqual(["٥ ليالٍ"]);
  });

  // (16) Arabic evidence flows through
  it("works with Arabic evidence and bilingual labels", () => {
    const a = analyzeFacts(fullArabic);
    const price = a.confirmedFacts.find((c) => c.key === "totalPrice");
    expect(price?.evidence).toBe("٣٢٠٠ ر.س");
    expect(price?.label.ar).toBe("السعر النهائي");
    expect(price?.confidenceType).toBe("exact");
  });

  // (17) English evidence flows through
  it("works with English evidence", () => {
    const a = analyzeFacts({
      price: fact({ amount: 3200, currency: "SAR" }, "SAR 3,200"),
      nights: fact(5, "5 nights"),
    });
    expect(a.confirmedFacts.find((c) => c.key === "totalPrice")?.evidence).toBe("SAR 3,200");
    expect(a.confirmedFacts.find((c) => c.key === "nights")?.label.en).toBe("Number of nights");
  });
});
