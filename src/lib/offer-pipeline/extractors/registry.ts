/**
 * Extractor registry — the lookup that maps an input type to its extractor.
 *
 * The text source is wired to its real Rule-Engine extractor. PDF, image and
 * URL remain inert PLACEHOLDER stubs (disabled, reporting `unsupported`) until
 * their real extractors land — adding one is a single-line swap here, with no
 * change to the pipeline, route, or data model. Callers always get an extractor
 * back, so no call site special-cases a missing one.
 */

import type { TravelOfferInputType } from "@/lib/offer-input/types";
import type { ExtractionResult } from "@/lib/offer-pipeline/types";
import type { OfferExtractor } from "./types";
import { createTextExtractor } from "./text/text-extractor";

/**
 * A registered-but-inert extractor. Reports `unsupported` for every source
 * until a real implementation replaces it.
 */
function placeholderExtractor(type: TravelOfferInputType): OfferExtractor {
  return {
    type,
    enabled: false,
    extract(): ExtractionResult {
      return { ok: false, reason: "unsupported" };
    },
  };
}

const REGISTRY: Record<TravelOfferInputType, OfferExtractor> = {
  text: createTextExtractor(),
  pdf: placeholderExtractor("pdf"),
  image: placeholderExtractor("image"),
  url: placeholderExtractor("url"),
};

/** Resolve the extractor for a given input source type. */
export function getExtractor(type: TravelOfferInputType): OfferExtractor {
  return REGISTRY[type];
}
