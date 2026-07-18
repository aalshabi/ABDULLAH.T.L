/**
 * The extractor extensibility seam.
 *
 * Adding a new source later (PDF, image OCR, URL fetch) means implementing this
 * one interface and registering it — with NO change to the data model,
 * normalization, analysis, route handler, or any UI. Each extractor turns a
 * `RawOfferSource` into an `ExtractionResult` (facts + warnings, or a failure
 * reason). Extraction is pure with respect to the pipeline: it performs no
 * persistence and, in the current phase, no network, disk, OCR, or PDF parsing.
 */

import type { TravelOfferInputType } from "@/lib/offer-input/types";
import type { ExtractionResult, RawOfferSource } from "@/lib/offer-pipeline/types";

export interface OfferExtractor {
  /** The single input source this extractor handles. */
  readonly type: TravelOfferInputType;
  /**
   * Whether a working implementation is wired. `false` for placeholder stubs
   * that have no real extraction yet.
   */
  readonly enabled: boolean;
  /** Attempt extraction for the given source. */
  extract(source: RawOfferSource): ExtractionResult | Promise<ExtractionResult>;
}
