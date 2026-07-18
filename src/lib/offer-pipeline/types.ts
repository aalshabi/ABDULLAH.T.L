/**
 * Travel Offer Pipeline — canonical data model (Task 1: models only).
 *
 * This module defines the *contract* for the whole pipeline
 * (ingest → extract → normalize → analyze → present). It contains TYPES and
 * CONSTANTS only — no extraction, normalization, analysis, network, disk, OCR,
 * or PDF parsing lives here or is wired yet.
 *
 * Design guarantees encoded in these types:
 *  - Extraction is kept strictly SEPARATE from analysis: when extraction fails,
 *    no analysis object is ever produced (see `ExtractionResult` vs `OfferAnalysis`).
 *  - Every extracted fact is traceable to its `evidence` and carries a
 *    categorical `confidenceType` — never a numeric confidence score.
 *  - Absent facts are omitted, never invented.
 */

import type { TravelOfferInputType } from "@/lib/offer-input/types";

/** Bilingual string (Arabic source-of-truth + English) used in pipeline output. */
export interface Bi {
  ar: string;
  en: string;
}

/** Response schema version. Bump only on a breaking change to the output shape. */
export const SCHEMA_VERSION = "1.0" as const;

/** Machine-readable error codes returned by the pipeline / API. */
export const OFFER_ERROR_CODES = {
  invalidInput: "INVALID_INPUT",
  payloadTooLarge: "PAYLOAD_TOO_LARGE",
  extractionFailed: "EXTRACTION_FAILED",
  sourceNotSupported: "SOURCE_NOT_SUPPORTED",
} as const;

export type OfferApiErrorCode = (typeof OFFER_ERROR_CODES)[keyof typeof OFFER_ERROR_CODES];

/** Why an extraction produced no usable facts. */
export type ExtractionFailureReason = "unsupported" | "unreadable" | "empty";

// ---- pipeline input --------------------------------------------------------

/** File metadata entering the pipeline. Bytes are NOT read in this phase. */
export interface RawOfferFile {
  name: string;
  size: number;
  mimeType: string;
}

/**
 * The raw source entering the pipeline, discriminated by `type`. Text and URL
 * carry their strings; PDF and image carry metadata only (no bytes are parsed
 * in this phase).
 */
export type RawOfferSource =
  | { type: "text"; text: string }
  | { type: "url"; url: string }
  | { type: "pdf"; file: RawOfferFile }
  | { type: "image"; file: RawOfferFile };

// ---- extracted facts -------------------------------------------------------

/**
 * A single extracted fact, always traceable to the exact `evidence` span it
 * came from. `confidenceType` is CATEGORICAL, never a numeric score. In the
 * current phase only "exact" is produced; "inferred" exists in the type but no
 * code path emits it (inference is disabled).
 */
export interface Fact<T> {
  value: T;
  evidence: string;
  confidenceType: "exact" | "inferred";
}

export interface OfferPrice {
  amount: number;
  currency: string;
}

export interface OfferTravelers {
  adults?: number;
  children?: number;
}

/**
 * The canonical fact model. Every field is optional: a field is present ONLY
 * when it was extracted with confidence. Absent fields are omitted — the
 * pipeline never fabricates them. Uncertain captures become `warnings`, not facts.
 */
export interface ExtractedOfferFacts {
  price?: Fact<OfferPrice>;
  destination?: Fact<string>;
  nights?: Fact<number>;
  travelers?: Fact<OfferTravelers>;
  board?: Fact<string>;
  flight?: Fact<{ included: boolean }>;
  baggage?: Fact<string>;
  transfer?: Fact<{ included: boolean }>;
  insurance?: Fact<boolean>;
  visa?: Fact<boolean>;
}

// ---- extraction result (kept separate from analysis) -----------------------

/**
 * Result of the extraction stage ONLY. Deliberately distinct from
 * `OfferAnalysis`: on `ok: false` no analysis is created downstream.
 */
export type ExtractionResult =
  | { ok: true; facts: ExtractedOfferFacts; warnings: Bi[] }
  | { ok: false; reason: ExtractionFailureReason };

// ---- facts-only analysis ---------------------------------------------------

export interface CompletenessItem {
  key: string;
  present: boolean;
  label: Bi;
  evidence?: string;
}

export interface Contradiction {
  key: string;
  description: Bi;
  evidence: string[];
}

/** Completeness is present/required WITH the explicit list of fields counted. */
export interface OfferCompleteness {
  present: number;
  required: number;
  fields: string[];
}

/**
 * Explainable, facts-only analysis: a checklist of what is present/absent, the
 * missing essentials, detected contradictions, and a transparent completeness
 * ratio. No fabricated scores or opaque numbers.
 */
export interface OfferAnalysis {
  checklist: CompletenessItem[];
  missing: string[];
  contradictions: Contradiction[];
  completeness: OfferCompleteness;
}

// ---- top-level pipeline / API result --------------------------------------

/** The full result the pipeline returns. All responses carry `schemaVersion`. */
export type OfferPipelineResult =
  | {
      ok: true;
      schemaVersion: typeof SCHEMA_VERSION;
      source: TravelOfferInputType;
      extraction: { facts: ExtractedOfferFacts; warnings: Bi[] };
      analysis: OfferAnalysis;
    }
  | {
      ok: false;
      schemaVersion: typeof SCHEMA_VERSION;
      source: TravelOfferInputType;
      code: OfferApiErrorCode;
      reason?: ExtractionFailureReason;
    };
