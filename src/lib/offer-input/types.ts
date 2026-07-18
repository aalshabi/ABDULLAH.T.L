/**
 * Travel-offer input model (Phase 1 — inputs only).
 *
 * Captures a single travel offer submitted by one of four methods and
 * normalizes it into one shape, ready for the real analysis engine in a later
 * phase. No content is sent anywhere, parsed, or persisted in this phase.
 */

export type TravelOfferInputType = "text" | "pdf" | "image" | "url";

export interface TravelOfferFileMeta {
  name: string;
  size: number;
  mimeType: string;
}

export interface TravelOfferInput {
  type: TravelOfferInputType;
  text?: string;
  url?: string;
  file?: TravelOfferFileMeta;
  createdAt: string; // ISO 8601
}

// ---- limits & accepted types ----------------------------------------------

export const OFFER_LIMITS = {
  textMin: 20,
  textMax: 15_000,
  fileMaxBytes: 10 * 1024 * 1024, // 10 MB
} as const;

export const PDF_MIME_TYPES = ["application/pdf"] as const;

export const IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg", // covers .jpg and .jpeg
  "image/webp",
] as const;

export const PDF_EXTENSIONS = /\.pdf$/i;
export const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp)$/i;

// ---- validation result ----------------------------------------------------

export type OfferErrorCode =
  | "empty"
  | "text_too_short"
  | "text_too_long"
  | "file_too_large"
  | "file_unsupported"
  | "url_invalid";

export type ValidationResult = { ok: true } | { ok: false; code: OfferErrorCode };
