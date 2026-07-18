import { describe, it, expect } from "vitest";
import { baggageRule } from "./baggage-rule";

describe("baggageRule", () => {
  it("extracts a weight from Arabic", () => {
    const r = baggageRule.apply("أمتعة مشمولة ٢٠ كجم");
    expect(r.facts.baggage?.value).toBe("20kg");
    expect(r.facts.baggage?.confidenceType).toBe("exact");
    expect(r.facts.baggage?.evidence).toContain("٢٠");
  });

  it("extracts a weight from English", () => {
    expect(baggageRule.apply("20kg checked bag included").facts.baggage?.value).toBe("20kg");
  });

  it("extracts 'none' when no baggage is included", () => {
    expect(baggageRule.apply("بدون أمتعة مشمولة").facts.baggage?.value).toBe("none");
  });

  it("extracts 'cabin' for hand baggage only", () => {
    expect(baggageRule.apply("cabin bag only").facts.baggage?.value).toBe("cabin");
  });

  it("returns nothing for unrelated text", () => {
    expect(baggageRule.apply("رحلة قصيرة وممتعة").facts).toEqual({});
  });
});
