import { describe, expect, it } from "vitest";
import { validateHotelSearchInput } from "./validation";

describe("hotel-search input validation", () => {
  it("normalizes an Arabic hotel name and optional city", () => {
    expect(
      validateHotelSearchInput({
        query: "  فندق   الاختبار  ",
        city: "  الرياض ",
        locale: "ar",
      })
    ).toEqual({
      ok: true,
      value: { query: "فندق الاختبار", city: "الرياض", locale: "ar" },
    });
  });

  it("accepts an English query without a city", () => {
    expect(validateHotelSearchInput({ query: "Test Hotel", locale: "en" })).toEqual({
      ok: true,
      value: { query: "Test Hotel", locale: "en" },
    });
  });

  it.each([
    null,
    [],
    {},
    { query: "x", locale: "en" },
    { query: "Test Hotel", city: "", locale: "en" },
    { query: "Test Hotel", locale: "fr" },
    { query: "Test Hotel", locale: "en", extra: true },
    { query: "https://example.com/hotel", locale: "en" },
    { query: "secret=PRIVATE", locale: "en" },
    { query: "Hotel 4111 1111 1111 1111", locale: "en" },
    { query: "Hotel\u0000Name", locale: "en" },
  ])("rejects invalid or sensitive-looking input %#", (input) => {
    expect(validateHotelSearchInput(input)).toEqual({ ok: false, code: "BAD_REQUEST" });
  });

  it("does not mutate the input object", () => {
    const input = Object.freeze({ query: "  Test Hotel  ", locale: "en" as const });
    expect(validateHotelSearchInput(input).ok).toBe(true);
    expect(input.query).toBe("  Test Hotel  ");
  });
});
