import { describe, it, expect } from "vitest";
import type { ExtractedOfferFacts, Fact } from "@/lib/offer-pipeline/types";
import { analyzeFacts } from "./analyze-facts";

function fact<T>(value: T, evidence: string): Fact<T> {
  return { value, evidence, confidenceType: "exact" };
}

// A common, well-formed core so tests can focus on the CONTEXTUAL question logic.
const core: ExtractedOfferFacts = {
  price: fact({ amount: 3200, currency: "SAR" }, "٣٢٠٠ ر.س"),
  currency: fact("SAR", "ر.س"),
  nights: fact(5, "٥ ليالٍ"),
};

const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 } as const;

describe("buildSuggestedQuestions — contextual, prioritized, capped", () => {
  // (4) flight + hotel bundle with NO transport mentioned → airport-transfer question
  it("asks about airport transfers when a flight+hotel bundle omits transport", () => {
    const a = analyzeFacts(
      { ...core, board: fact("BB", "شامل الإفطار") },
      { text: "رحلة طيران وإقامة فندقية ٥ ليالٍ في دبي" }
    );
    expect(a.suggestedQuestions.some((q) => q.question.ar === "هل الاستقبال والتوصيل من وإلى المطار مشمولان في السعر؟")).toBe(true);
  });

  // (5) transport mentioned but the TYPE is unclear → private vs shared question
  it("asks whether transport is private or shared when the type is unstated", () => {
    const a = analyzeFacts(core, { text: "العرض يشمل المواصلات من المطار إلى مكان الإقامة" });
    expect(a.suggestedQuestions.some((q) => q.question.ar === "هل المواصلات خاصة أم مشتركة؟")).toBe(true);
  });

  // multiple cities/hotels → inter-city transfers question
  it("asks about inter-city transfers when the offer spans several cities", () => {
    const a = analyzeFacts(core, { text: "برنامج يشمل مدينتين وفندقين خلال الرحلة" });
    expect(a.suggestedQuestions.some((q) => q.key === "interCityTransfers")).toBe(true);
  });

  // (6) visa & insurance are NOT part of the default set
  it("does NOT ask about visa or insurance by default", () => {
    const a = analyzeFacts({ ...core, board: fact("BB", "شامل الإفطار") }, { text: "عرض إلى دبي ٥ ليالٍ شامل الإفطار" });
    expect(a.suggestedQuestions.some((q) => q.key === "visa")).toBe(false);
    expect(a.suggestedQuestions.some((q) => q.key === "insurance")).toBe(false);
  });

  // (7) visa & insurance appear ONLY when the text raises them
  it("asks about visa and insurance only when the text mentions them", () => {
    const a = analyzeFacts(core, { text: "التأشيرة غير مشمولة والتأمين غير مشمول في السعر" });
    expect(a.suggestedQuestions.some((q) => q.key === "visa")).toBe(true);
    expect(a.suggestedQuestions.some((q) => q.key === "insurance")).toBe(true);
  });

  // (8) accommodation without a room type → room-type question
  it("asks for the room type when accommodation lacks one", () => {
    const a = analyzeFacts(core, { text: "الإقامة في فندق خمس نجوم بمدينة دبي" });
    expect(a.suggestedQuestions.some((q) => q.question.ar === "ما نوع الغرفة وعدد الأسرّة المشمولة؟")).toBe(true);
  });

  // (9) children present with unclear occupancy → child-beds question
  it("asks about children's beds when children are present but occupancy is unclear", () => {
    const a = analyzeFacts(
      { ...core, board: fact("BB", "شامل الإفطار"), travelers: fact({ adults: 2, children: 2 }, "شخصان وطفلان") },
      { text: "عرض عائلي مع طفلين، شامل الإفطار" }
    );
    expect(a.suggestedQuestions.some((q) => q.question.ar === "هل السعر يشمل أسرّة الأطفال أو السرير الإضافي؟")).toBe(true);
  });

  // (10) never more than 5 questions
  it("caps the list at 5 questions", () => {
    const a = analyzeFacts(
      { ...core, board: fact("BB", "شامل الإفطار"), travelers: fact({ adults: 2, children: 2 }, "شخصان وطفلان") },
      { text: "رحلة طيران وإقامة فندقية إلى مدينتين، التأشيرة غير مشمولة والتأمين غير مشمول، مع طفلين" }
    );
    expect(a.suggestedQuestions.length).toBeLessThanOrEqual(5);
  });

  // (11) high-priority questions come first
  it("orders questions high → medium → low", () => {
    const a = analyzeFacts(
      { ...core, board: fact("BB", "شامل الإفطار"), travelers: fact({ adults: 2, children: 2 }, "شخصان وطفلان") },
      { text: "عرض عائلي مع طفلين، شامل الإفطار في فندق" }
    );
    const weights = a.suggestedQuestions.map((q) => PRIORITY_WEIGHT[q.priority]);
    const sorted = [...weights].sort((x, y) => x - y);
    expect(weights).toEqual(sorted);
    expect(a.suggestedQuestions[0]?.priority).toBe("high");
  });

  // (12) no duplicate question for information that is already confirmed
  it("never asks about a field that is present with evidence", () => {
    const a = analyzeFacts(
      {
        ...core,
        board: fact("BB", "شامل الإفطار"),
        baggage: fact("23kg", "٢٣ كجم"),
        transfer: fact({ included: true }, "استقبال وتوصيل مشمول"),
      },
      { text: "الباقة شاملة الإفطار والأمتعة والاستقبال والتوصيل" }
    );
    expect(a.suggestedQuestions.some((q) => q.key === "transfers")).toBe(false);
    expect(a.suggestedQuestions.some((q) => q.key === "board")).toBe(false);
    expect(a.suggestedQuestions.some((q) => q.key === "baggage")).toBe(false);
    // present core facts are never re-asked
    expect(a.suggestedQuestions.some((q) => ["totalPrice", "currency", "nights"].includes(q.key))).toBe(false);
  });

  // (13) contextual text does NOT change the confirmed facts
  it("keeps confirmed facts identical regardless of the text context", () => {
    const withText = analyzeFacts(core, { text: "التأشيرة غير مشمولة ومواصلات مشتركة إلى فندق" });
    const withoutText = analyzeFacts(core);
    expect(withText.confirmedFacts).toEqual(withoutText.confirmedFacts);
  });

  // (14) evidence is preserved exactly and never invented by the question layer
  it("preserves evidence on confirmed facts unchanged", () => {
    const a = analyzeFacts(core, { text: "التأشيرة غير مشمولة" });
    expect(a.confirmedFacts.find((c) => c.key === "totalPrice")?.evidence).toBe("٣٢٠٠ ر.س");
    expect(a.confirmedFacts.find((c) => c.key === "nights")?.evidence).toBe("٥ ليالٍ");
    // visa is only a QUESTION, never fabricated as a confirmed fact
    expect(a.confirmedFacts.some((c) => c.key === "visa")).toBe(false);
  });

  // (15) completeness and missing fields are independent of the text context
  it("does not let the text alter completeness or missing fields", () => {
    const withText = analyzeFacts(core, { text: "التأشيرة غير مشمولة والتأمين مطلوب ومواصلات خاصة" });
    const withoutText = analyzeFacts(core);
    expect(withText.completeness).toEqual(withoutText.completeness);
    expect(withText.missingFields).toEqual(withoutText.missingFields);
  });
});
