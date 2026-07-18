import { describe, it, expect } from "vitest";
import type { TravelOfferInputType } from "@/lib/offer-input/types";
import { getExtractor } from "./registry";

const ALL_TYPES: TravelOfferInputType[] = ["text", "pdf", "image", "url"];
const DISABLED_TYPES: ("pdf" | "image" | "url")[] = ["pdf", "image", "url"];

describe("extractor registry", () => {
  it("returns an extractor whose type matches for every source", () => {
    for (const type of ALL_TYPES) {
      expect(getExtractor(type).type).toBe(type);
    }
  });

  it("wires the real, enabled text extractor", async () => {
    const text = getExtractor("text");
    expect(text.enabled).toBe(true);
    const result = await text.extract({ type: "text", text: "5 nights in Dubai for two" });
    expect(result.ok).toBe(true);
  });

  it("keeps pdf/image/url as disabled placeholders reporting unsupported", async () => {
    for (const type of DISABLED_TYPES) {
      const extractor = getExtractor(type);
      expect(extractor.enabled).toBe(false);
      const source =
        type === "url"
          ? ({ type: "url", url: "https://example.com" } as const)
          : ({ type, file: { name: "f", size: 1, mimeType: "application/octet-stream" } } as const);
      expect(await extractor.extract(source)).toEqual({ ok: false, reason: "unsupported" });
    }
  });
});
