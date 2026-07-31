import { describe, expect, it } from "vitest";
import {
  PRODUCT_CAPABILITIES,
  getNavigableCapabilities,
  getRequiredLaunchCapabilities,
  isFeatureEnabled,
  type ProductCapabilityKey,
} from "./capabilities";

const EXPECTED_KEYS: ProductCapabilityKey[] = [
  "textOfferAnalysis",
  "hotelOfferReview",
  "destinationChecklist",
  "hotelComparison",
  "knowledgeLibrary",
  "localDashboard",
  "accounts",
  "pdfInput",
  "imageInput",
  "urlInput",
  "feedback",
  "publicIndexing",
];

describe("product capability registry", () => {
  it("contains every required capability with localized launch metadata", () => {
    expect(Object.keys(PRODUCT_CAPABILITIES)).toEqual(EXPECTED_KEYS);

    for (const capability of Object.values(PRODUCT_CAPABILITIES)) {
      expect(["disabled", "preview", "enabled"]).toContain(capability.status);
      expect(capability.title.ar.length).toBeGreaterThan(0);
      expect(capability.title.en.length).toBeGreaterThan(0);
      expect(capability.reason.ar.length).toBeGreaterThan(0);
      expect(capability.reason.en.length).toBeGreaterThan(0);
      expect(capability.launchRequirement.ar.length).toBeGreaterThan(0);
      expect(capability.launchRequirement.en.length).toBeGreaterThan(0);
    }
  });

  it("marks only the real text analyzer as enabled", () => {
    expect(isFeatureEnabled("textOfferAnalysis")).toBe(true);
    for (const key of EXPECTED_KEYS.filter((key) => key !== "textOfferAnalysis")) {
      expect(isFeatureEnabled(key)).toBe(false);
    }
  });

  it("never exposes disabled capabilities as navigable links", () => {
    const navigable = getNavigableCapabilities();
    expect(navigable.map((capability) => capability.status)).not.toContain("disabled");
    expect(navigable.every((capability) => capability.route !== null)).toBe(true);
    expect(navigable.map(({ key }) => key)).not.toContain("localDashboard");
    expect(navigable.map(({ key }) => key)).not.toContain("accounts");
  });

  it("keeps essential launch capabilities explicit", () => {
    expect(getRequiredLaunchCapabilities().map(({ key }) => key)).toEqual([
      "textOfferAnalysis",
      "hotelOfferReview",
      "destinationChecklist",
      "hotelComparison",
      "knowledgeLibrary",
      "localDashboard",
      "publicIndexing",
    ]);
  });
});
