import { describe, it, expect } from "vitest";
import { priceRule } from "./price-rule";

describe("priceRule", () => {
  it("extracts amount + currency from Arabic (amount before currency)", () => {
    const r = priceRule.apply("السعر الإجمالي ٣٢٠٠ ر.س لكل شخص");
    expect(r.facts.price?.value).toEqual({ amount: 3200, currency: "SAR" });
    expect(r.facts.price?.confidenceType).toBe("exact");
    expect(r.facts.price?.evidence).toContain("٣٢٠٠");
  });

  it("extracts amount + currency from English (currency before amount)", () => {
    const r = priceRule.apply("Total price SAR 3,200 per person");
    expect(r.facts.price?.value).toEqual({ amount: 3200, currency: "SAR" });
    expect(r.facts.price?.evidence).toContain("3,200");
  });

  it("handles the $ symbol", () => {
    const r = priceRule.apply("Package for $1200 only");
    expect(r.facts.price?.value).toEqual({ amount: 1200, currency: "USD" });
  });

  it("does NOT extract a bare number with no adjacent currency", () => {
    expect(priceRule.apply("الرحلة لمدة 3200 دقيقة تقريبًا").facts.price).toBeUndefined();
  });

  it("returns nothing for unrelated text (no fabrication)", () => {
    const r = priceRule.apply("رحلة جميلة إلى مكان رائع");
    expect(r.facts).toEqual({});
    expect(r.warnings).toEqual([]);
  });
});
