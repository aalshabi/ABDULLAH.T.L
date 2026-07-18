import { describe, it, expect } from "vitest";
import { normalizeArabicDigits, toNormalizedInt, toNormalizedCount, toNormalizedAmount } from "./numbers";

describe("normalizeArabicDigits", () => {
  it("converts Arabic-Indic and Persian digits to ASCII", () => {
    expect(normalizeArabicDigits("٣٢٠٠")).toBe("3200");
    expect(normalizeArabicDigits("۵ ليالٍ")).toBe("5 ليالٍ");
    expect(normalizeArabicDigits("abc 12")).toBe("abc 12");
  });
});

describe("toNormalizedInt", () => {
  it("parses positive integers from strings and numbers", () => {
    expect(toNormalizedInt("٥")).toBe(5);
    expect(toNormalizedInt("1,200")).toBe(1200);
    expect(toNormalizedInt(7)).toBe(7);
  });
  it("rejects zero, negatives, and non-numbers", () => {
    expect(toNormalizedInt("0")).toBeNull();
    expect(toNormalizedInt(-3)).toBeNull();
    expect(toNormalizedInt("abc")).toBeNull();
  });
});

describe("toNormalizedCount", () => {
  it("allows zero for counts like children", () => {
    expect(toNormalizedCount("0")).toBe(0);
    expect(toNormalizedCount("٢")).toBe(2);
    expect(toNormalizedCount(-1)).toBeNull();
  });
});

describe("toNormalizedAmount", () => {
  it("parses grouped thousands, decimals and Arabic digits", () => {
    expect(toNormalizedAmount("٣٢٠٠")).toBe(3200);
    expect(toNormalizedAmount("3,200")).toBe(3200);
    expect(toNormalizedAmount("1.234.567")).toBe(1234567);
    expect(toNormalizedAmount("3200.50")).toBe(3200.5);
    expect(toNormalizedAmount(1200)).toBe(1200);
  });
  it("rejects invalid amounts", () => {
    expect(toNormalizedAmount("abc")).toBeNull();
    expect(toNormalizedAmount(0)).toBeNull();
  });
});
