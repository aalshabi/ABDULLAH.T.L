import { describe, it, expect } from "vitest";
import { currencyRule } from "./currency-rule";

describe("currencyRule", () => {
  it("extracts a single Arabic currency with evidence", () => {
    const r = currencyRule.apply("جميع الأسعار بالريال السعودي");
    expect(r.facts.currency?.value).toBe("SAR");
    expect(r.facts.currency?.confidenceType).toBe("exact");
    expect(r.facts.currency?.evidence).toContain("ريال");
  });

  it("extracts a single English currency", () => {
    const r = currencyRule.apply("All prices are in USD");
    expect(r.facts.currency?.value).toBe("USD");
  });

  it("does not extract when two currencies are mentioned (adds a warning)", () => {
    const r = currencyRule.apply("السعر ٣٢٠٠ ر.س أو ما يعادله بالدولار");
    expect(r.facts.currency).toBeUndefined();
    expect(r.warnings.length).toBe(1);
  });

  it("does not match currency letters inside ordinary words", () => {
    // "الرسوم" contains ر..س but is not a currency.
    expect(currencyRule.apply("الرسوم الإضافية على حسابك").facts.currency).toBeUndefined();
  });

  it("returns nothing for unrelated text", () => {
    expect(currencyRule.apply("يوم حر للتسوق").facts).toEqual({});
  });
});
