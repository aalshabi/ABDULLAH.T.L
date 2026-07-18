/**
 * Server-side request validation for POST /api/offer/analyze. Pure and
 * HTTP-free so it is fully unit-testable. It never echoes user text and never
 * logs. Returns either a validated RawOfferSource or a status + error code.
 */

import type { RawOfferSource } from "@/lib/offer-pipeline/types";
import type { TravelOfferInputType } from "@/lib/offer-input/types";
import { isExtractionEnabledFor } from "@/lib/offer-pipeline/capabilities";
import type { ApiErrorCode } from "./response";
import { MAX_BODY_BYTES, MAX_TEXT_CHARS, MIN_TEXT_CHARS, REQUIRED_CONTENT_TYPE } from "./constants";

export interface RawRequest {
  contentType: string | null;
  bodyText: string;
  byteLength: number;
}

export type RequestCheck =
  | { ok: true; source: RawOfferSource }
  | { ok: false; status: number; code: ApiErrorCode; source?: TravelOfferInputType };

const KNOWN_TYPES: TravelOfferInputType[] = ["text", "pdf", "image", "url"];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateRequest(req: RawRequest): RequestCheck {
  // Content-Type must be JSON.
  if (!req.contentType || !req.contentType.toLowerCase().includes(REQUIRED_CONTENT_TYPE)) {
    return { ok: false, status: 415, code: "UNSUPPORTED_MEDIA_TYPE" };
  }

  // Body size cap (bytes) — checked before trusting the payload.
  if (req.byteLength > MAX_BODY_BYTES) {
    return { ok: false, status: 413, code: "PAYLOAD_TOO_LARGE" };
  }

  // Parse JSON.
  let parsed: unknown;
  try {
    parsed = JSON.parse(req.bodyText);
  } catch {
    return { ok: false, status: 400, code: "INVALID_JSON" };
  }

  if (!isPlainObject(parsed)) {
    return { ok: false, status: 400, code: "BAD_REQUEST" };
  }

  const type = parsed["type"];
  if (typeof type !== "string" || !KNOWN_TYPES.includes(type as TravelOfferInputType)) {
    return { ok: false, status: 400, code: "BAD_REQUEST" };
  }
  const source = type as TravelOfferInputType;

  // Disabled sources are refused before inspecting any payload.
  if (!isExtractionEnabledFor(source)) {
    return { ok: false, status: 501, code: "SOURCE_NOT_SUPPORTED", source };
  }

  // text is the only enabled source in this phase.
  const text = parsed["text"];
  if (typeof text !== "string") {
    return { ok: false, status: 400, code: "BAD_REQUEST" };
  }
  if (text.length > MAX_TEXT_CHARS) {
    return { ok: false, status: 413, code: "PAYLOAD_TOO_LARGE" };
  }
  if (text.trim().length < MIN_TEXT_CHARS) {
    return { ok: false, status: 422, code: "NOT_ANALYZABLE" };
  }

  return { ok: true, source: { type: "text", text } };
}
