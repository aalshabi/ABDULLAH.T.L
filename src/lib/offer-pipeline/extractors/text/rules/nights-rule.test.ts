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

  // Regression: the full offer sentence must yield 5 — never 0.
  it("extracts 5 (not 0) from a complete Arabic offer sentence", () => {
    const r = nightsRule.apply("عرض إلى دبي لمدة 5 ليالٍ لشخصين شامل الإفطار، السعر الإجمالي 7,500 ريال.");
    expect(r.facts.nights?.value).toBe(5);
    expect(r.facts.nights?.evidence).toContain("5 ليالٍ");
  });

  // Regression: a non-positive count is never presented as a confirmed fact.
  it("never emits a nights fact for a zero or negative count", () => {
    for (const text of ["إقامة 0 ليالٍ", "0 nights", "رحلة 00 ليلة", "-5 nights"]) {
      expect(nightsRule.apply(text).facts.nights).toBeUndefined();
    }
  });
});
