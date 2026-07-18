import { describe, it, expect } from "vitest";
import type { TravelOfferInputType } from "@/lib/offer-input/types";
import { getExtractor } from "./registry";

const ALL_TYPES: TravelOfferInputType[] = ["text", "pdf", "image", "url"];

describe("extractor registry (Task 1 — inert placeholders)", () => {
  it("returns an extractor whose type matches for every source", () => {
    for (const type of ALL_TYPES) {
      expect(getExtractor(type).type).toBe(type);
    }
  });

  it("every extractor is a disabled placeholder in this task", () => {
    for (const type of ALL_TYPES) {
      expect(getExtractor(type).enabled).toBe(false);
    }
  });

  // Guardrail: this task wires the seam but implements NO real extraction.
  // All sources — including text — must report `unsupported` until their real
  // extractor lands, so nothing can silently fabricate facts here.
  it("no placeholder performs real extraction (all report unsupported)", async () => {
    for (const type of ALL_TYPES) {
      const source =
        type === "text"
          ? ({ type: "text", text: "sample" } as const)
          : type === "url"
            ? ({ type: "url", url: "https://example.com" } as const)
            : ({ type, file: { name: "f", size: 1, mimeType: "application/octet-stream" } } as const);

      const result = await getExtractor(type).extract(source);
      expect(result).toEqual({ ok: false, reason: "unsupported" });
    }
  });
});
