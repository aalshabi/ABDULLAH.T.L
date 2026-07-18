import { describe, it, expect } from "vitest";
import { transfersRule } from "./transfers-rule";

describe("transfersRule", () => {
  it("detects included transfer in Arabic", () => {
    const r = transfersRule.apply("استقبال وتوصيل خاص من المطار");
    expect(r.facts.transfer?.value).toEqual({ included: true });
    expect(r.facts.transfer?.confidenceType).toBe("exact");
    expect(r.facts.transfer?.evidence.length).toBeGreaterThan(0);
  });

  it("detects excluded transfer in Arabic", () => {
    expect(transfersRule.apply("التوصيل غير مشمول").facts.transfer?.value).toEqual({ included: false });
  });

  it("detects included transfer in English", () => {
    expect(transfersRule.apply("Airport transfers included").facts.transfer?.value).toEqual({ included: true });
  });

  it("does NOT decide from a bare mention (adds a warning instead)", () => {
    const r = transfersRule.apply("يتوفر توصيل عند الطلب");
    expect(r.facts.transfer).toBeUndefined();
    expect(r.warnings.length).toBe(1);
  });

  it("returns nothing when transfer is not mentioned", () => {
    const r = transfersRule.apply("عرض مميز");
    expect(r.facts).toEqual({});
    expect(r.warnings).toEqual([]);
  });
});
