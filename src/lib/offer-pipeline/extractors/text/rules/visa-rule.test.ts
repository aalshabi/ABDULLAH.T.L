import { describe, it, expect } from "vitest";
import { visaRule } from "./visa-rule";

describe("visaRule", () => {
  it("detects excluded visa in Arabic", () => {
    const r = visaRule.apply("التأشيرة غير مشمولة");
    expect(r.facts.visa?.value).toBe(false);
    expect(r.facts.visa?.confidenceType).toBe("exact");
    expect(r.facts.visa?.evidence).toContain("تأشيرة");
  });

  it("detects included visa in English", () => {
    expect(visaRule.apply("Entry visa included in the package").facts.visa?.value).toBe(true);
  });

  it("does NOT decide from a bare mention (adds a warning instead)", () => {
    const r = visaRule.apply("نساعدك في إجراءات التأشيرة");
    expect(r.facts.visa).toBeUndefined();
    expect(r.warnings.length).toBe(1);
  });

  it("returns nothing when visa is not mentioned", () => {
    const r = visaRule.apply("عرض بحري رائع");
    expect(r.facts).toEqual({});
    expect(r.warnings).toEqual([]);
  });
});
