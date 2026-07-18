import { describe, it, expect } from "vitest";
import { OFFER_EXTRACTION_ENABLED, isOfferExtractionEnabled } from "./offer-extraction";

describe("offer extraction capability", () => {
  // (5) uploading a file must NOT produce a report that claims to read content:
  // extraction is disabled, so the analyzer shows the "not enabled" message
  // instead of any report derived from the file.
  it("is disabled in the current build", () => {
    expect(OFFER_EXTRACTION_ENABLED).toBe(false);
    expect(isOfferExtractionEnabled()).toBe(false);
  });
});
