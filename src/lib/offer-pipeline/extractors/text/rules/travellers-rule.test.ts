import { describe, it, expect } from "vitest";
import { travellersRule } from "./travellers-rule";

describe("travellersRule", () => {
  it("extracts adults and children from Arabic", () => {
    const r = travellersRule.apply("العدد ٢ بالغين و 1 طفل");
    expect(r.facts.travelers?.value).toEqual({ adults: 2, children: 1 });
    expect(r.facts.travelers?.confidenceType).toBe("exact");
    expect(r.facts.travelers?.evidence.length).toBeGreaterThan(0);
  });

  it("extracts adults from English", () => {
    expect(travellersRule.apply("Booking for 2 adults").facts.travelers?.value).toEqual({ adults: 2 });
  });

  it("does NOT invent counts when none are numbered", () => {
    expect(travellersRule.apply("رحلة عائلية ممتعة").facts.travelers).toBeUndefined();
  });

  it("returns nothing for unrelated text", () => {
    expect(travellersRule.apply("طقس جميل ومناظر خلابة").facts).toEqual({});
  });
});
