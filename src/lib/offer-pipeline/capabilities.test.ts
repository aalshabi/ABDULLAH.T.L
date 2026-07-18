import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { OFFER_CAPABILITIES, isExtractionEnabledFor } from "./capabilities";

describe("offer-source capability policy", () => {
  it("supports text only in the current phase", () => {
    expect(OFFER_CAPABILITIES).toEqual({
      text: true,
      pdf: false,
      image: false,
      url: false,
    });
  });

  it("is the single canonical capability source (legacy gate removed)", () => {
    // the old src/lib/offer-extraction.ts gate must be gone
    expect(existsSync(join(process.cwd(), "src/lib/offer-extraction.ts"))).toBe(false);
  });

  it("isExtractionEnabledFor reflects the policy per source", () => {
    expect(isExtractionEnabledFor("text")).toBe(true);
    expect(isExtractionEnabledFor("pdf")).toBe(false);
    expect(isExtractionEnabledFor("image")).toBe(false);
    expect(isExtractionEnabledFor("url")).toBe(false);
  });
});
