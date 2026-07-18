import { describe, it, expect } from "vitest";
import { insuranceRule } from "./insurance-rule";

describe("insuranceRule", () => {
  it("detects excluded insurance in Arabic", () => {
    const r = insuranceRule.apply("التأمين غير مشمول في السعر");
    expect(r.facts.insurance?.value).toBe(false);
    expect(r.facts.insurance?.confidenceType).toBe("exact");
    expect(r.facts.insurance?.evidence).toContain("تأمين");
  });

  it("detects included insurance in English", () => {
    expect(insuranceRule.apply("Travel insurance included").facts.insurance?.value).toBe(true);
  });

  it("does NOT decide from a bare mention (adds a warning instead)", () => {
    const r = insuranceRule.apply("يمكنك إضافة التأمين لاحقًا");
    expect(r.facts.insurance).toBeUndefined();
    expect(r.warnings.length).toBe(1);
  });

  it("returns nothing (no warning) when insurance is not mentioned", () => {
    const r = insuranceRule.apply("رحلة إلى الجبال");
    expect(r.facts).toEqual({});
    expect(r.warnings).toEqual([]);
  });
});
