import { describe, it, expect } from "vitest";
import { dedupeBi } from "./dedupe";

describe("dedupeBi", () => {
  it("removes duplicate bilingual entries, preserving first-seen order", () => {
    const result = dedupeBi([
      { ar: "أ", en: "a" },
      { ar: "ب", en: "b" },
      { ar: "أ", en: "a" },
    ]);
    expect(result).toEqual([
      { ar: "أ", en: "a" },
      { ar: "ب", en: "b" },
    ]);
  });

  it("treats entries differing only in one language as distinct", () => {
    const result = dedupeBi([
      { ar: "أ", en: "a" },
      { ar: "أ", en: "x" },
    ]);
    expect(result.length).toBe(2);
  });

  it("returns an empty array unchanged", () => {
    expect(dedupeBi([])).toEqual([]);
  });
});
