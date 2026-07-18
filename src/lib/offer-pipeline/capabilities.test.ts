import { describe, it, expect } from "vitest";
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

  it("isExtractionEnabledFor reflects the policy per source", () => {
    expect(isExtractionEnabledFor("text")).toBe(true);
    expect(isExtractionEnabledFor("pdf")).toBe(false);
    expect(isExtractionEnabledFor("image")).toBe(false);
    expect(isExtractionEnabledFor("url")).toBe(false);
  });
});
