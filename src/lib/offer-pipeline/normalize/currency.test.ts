import { describe, it, expect } from "vitest";
import { normalizeCurrencyCode } from "./currency";

describe("normalizeCurrencyCode", () => {
  it("canonicalizes Arabic currency forms to ISO codes", () => {
    expect(normalizeCurrencyCode("ريال")).toBe("SAR");
    expect(normalizeCurrencyCode("ر.س")).toBe("SAR");
    expect(normalizeCurrencyCode("﷼")).toBe("SAR");
    expect(normalizeCurrencyCode("دولار")).toBe("USD");
    expect(normalizeCurrencyCode("درهم")).toBe("AED");
    expect(normalizeCurrencyCode("يورو")).toBe("EUR");
  });

  it("canonicalizes symbols and mixed-case ISO codes", () => {
    expect(normalizeCurrencyCode("$")).toBe("USD");
    expect(normalizeCurrencyCode("€")).toBe("EUR");
    expect(normalizeCurrencyCode("sar")).toBe("SAR");
    expect(normalizeCurrencyCode("Usd")).toBe("USD");
    expect(normalizeCurrencyCode("SR")).toBe("SAR");
  });

  it("is idempotent for already-canonical codes", () => {
    expect(normalizeCurrencyCode("SAR")).toBe("SAR");
  });

  it("returns an upper-cased best effort for unknown input", () => {
    expect(normalizeCurrencyCode("gbp")).toBe("GBP");
  });
});
