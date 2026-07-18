import { describe, it, expect } from "vitest";
import { normalizeNights } from "./nights";

describe("normalizeNights", () => {
  it("accepts positive integers from number or Arabic-digit string", () => {
    expect(normalizeNights(5)).toBe(5);
    expect(normalizeNights("٧")).toBe(7);
  });
  it("rejects zero and invalid values", () => {
    expect(normalizeNights(0)).toBeNull();
    expect(normalizeNights("abc")).toBeNull();
  });
});
