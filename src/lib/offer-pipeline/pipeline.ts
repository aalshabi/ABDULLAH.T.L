/**
 * Pipeline orchestrator — sequences the layers and NOTHING else.
 *
 *   select extractor (registry) → extract → normalize → analyze → unified result
 *
 * It holds no extraction, normalization, or analysis logic of its own; each step
 * lives in its own module. Pure and side-effect free: no network, disk, OCR, PDF
 * parsing, persistence, or logging.
 */

import type { ExtractedOfferFacts, RawOfferSource } from "./types";
import type { Bi } from "./types";
import type { TravelOfferInputType } from "@/lib/offer-input/types";
import type { OfferAnalysis } from "./analysis/types";
import { getExtractor } from "./extractors/registry";
import { isExtractionEnabledFor } from "./capabilities";
import { normalizeExtraction } from "./normalize";
import { analyzeFacts } from "./analysis";

export type PipelineOutcome =
  | {
      status: "ok";
      source: TravelOfferInputType;
      extraction: { facts: ExtractedOfferFacts; warnings: Bi[] };
      analysis: OfferAnalysis;
    }
  | { status: "unsupported"; source: TravelOfferInputType }
  | { status: "extraction_failed"; source: TravelOfferInputType; reason: "unreadable" | "empty" };

export async function runOfferPipeline(source: RawOfferSource): Promise<PipelineOutcome> {
  const { type } = source;

  // Capability gate — a source the pipeline is not designed to process yet.
  if (!isExtractionEnabledFor(type)) return { status: "unsupported", source: type };

  // 1) extract
  const extracted = await getExtractor(type).extract(source);
  if (!extracted.ok) {
    if (extracted.reason === "unsupported") return { status: "unsupported", source: type };
    return { status: "extraction_failed", source: type, reason: extracted.reason };
  }

  // 2) normalize
  const extraction = normalizeExtraction({ facts: extracted.facts, warnings: extracted.warnings });

  // 3) analyze — pass the original text so questions can be contextual (text only).
  const analysis = analyzeFacts(extraction.facts, {
    text: source.type === "text" ? source.text : undefined,
    observations: extracted.observations,
  });

  return { status: "ok", source: type, extraction, analysis };
}
