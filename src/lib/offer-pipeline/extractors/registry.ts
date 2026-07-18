/**
 * Extractor registry — the lookup that maps an input type to its extractor.
 *
 * Task 1 registers inert PLACEHOLDER stubs for all four sources: they are wired
 * into the registry but perform no real extraction, reporting `unsupported`.
 * Real per-type extractors (text first) replace these placeholders in later
 * tasks; when a real one is wired, its `enabled` flag becomes `true`. Callers
 * always get an extractor back, so no call site needs to special-case a missing
 * one.
 */

import type { TravelOfferInputType } from "@/lib/offer-input/types";
import type { ExtractionResult } from "@/lib/offer-pipeline/types";
import type { OfferExtractor } from "./types";

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
  text: placeholderExtractor("text"),
  pdf: placeholderExtractor("pdf"),
  image: placeholderExtractor("image"),
  url: placeholderExtractor("url"),
};

/** Resolve the extractor for a given input source type. */
export function getExtractor(type: TravelOfferInputType): OfferExtractor {
  return REGISTRY[type];
}
