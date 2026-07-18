/**
 * Offer-source capability POLICY.
 *
 * Declares which input sources the pipeline is DESIGNED to support. This is the
 * single source of truth consulted by the (future) route handler and the UI to
 * decide whether a source is accepted (→ extraction/analysis) or refused
 * (→ 501 SOURCE_NOT_SUPPORTED).
 *
 * This is intentionally SEPARATE from whether a working extractor is wired yet
 * (that lives in the extractor registry). Keeping policy and implementation
 * apart lets a new source be enabled by policy the moment its extractor lands,
 * without touching call sites.
 *
 * Current phase: only text is supported by policy; PDF, image and URL are
 * deferred (no OCR, no PDF reading, no URL fetching yet).
 */

import type { TravelOfferInputType } from "@/lib/offer-input/types";

export const OFFER_CAPABILITIES: Record<TravelOfferInputType, boolean> = {
  text: true,
  pdf: false,
  image: false,
  url: false,
};

/** Whether the pipeline is designed to accept and process the given source. */
export function isExtractionEnabledFor(type: TravelOfferInputType): boolean {
  return OFFER_CAPABILITIES[type] === true;
}
