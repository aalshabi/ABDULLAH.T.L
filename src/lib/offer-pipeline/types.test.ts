import { describe, it, expect } from "vitest";
import { SCHEMA_VERSION, OFFER_ERROR_CODES } from "./types";

describe("offer-pipeline contract constants", () => {
  it("exposes schema version 1.0", () => {
    expect(SCHEMA_VERSION).toBe("1.0");
  });

  it("defines the stable machine-readable error codes", () => {
    expect(OFFER_ERROR_CODES).toEqual({
      invalidInput: "INVALID_INPUT",
      payloadTooLarge: "PAYLOAD_TOO_LARGE",
      extractionFailed: "EXTRACTION_FAILED",
      sourceNotSupported: "SOURCE_NOT_SUPPORTED",
    });
  });
});
