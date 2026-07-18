import { describe, it, expect } from "vitest";
import { nightsRule } from "./nights-rule";

describe("nightsRule", () => {
  it("extracts nights from Arabic", () => {
    const r = nightsRule.apply("إقامة ٥ ليالٍ في الفندق");
    expect(r.facts.nights?.value).toBe(5);
    expect(r.facts.nights?.confidenceType).toBe("exact");
    expect(r.facts.nights?.evidence).toContain("٥");
  });

  it("extracts nights from English", () => {
    expect(nightsRule.apply("Enjoy 7 nights by the sea").facts.nights?.value).toBe(7);
  });

  it("does NOT treat days as nights (no inference)", () => {
    expect(nightsRule.apply("رحلة لمدة 6 أيام").facts.nights).toBeUndefined();
    expect(nightsRule.apply("a 6 days trip").facts.nights).toBeUndefined();
  });

  it("returns nothing for unrelated text", () => {
    expect(nightsRule.apply("عرض رائع للعائلات").facts).toEqual({});
  });
});
