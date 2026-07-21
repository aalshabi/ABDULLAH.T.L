/**
 * API response envelope — pure builders and outcome→HTTP mapping. No user text
 * or evidence is ever placed in an error body; errors carry only a code and,
 * for a refused source, the source TYPE (never user content).
 */

import type { TravelOfferInputType } from "@/lib/offer-input/types";
import type { ExtractedOfferFacts } from "@/lib/offer-pipeline/types";
import type { Bi } from "@/lib/offer-pipeline/types";
import type { OfferAnalysis } from "@/lib/offer-pipeline/analysis/types";
import type { PipelineOutcome } from "@/lib/offer-pipeline/pipeline";
import { SCHEMA_VERSION } from "./constants";

export type ApiErrorCode =
  | "INVALID_JSON"
  | "BAD_REQUEST"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "PAYLOAD_TOO_LARGE"
  | "NOT_ANALYZABLE"
  | "SOURCE_NOT_SUPPORTED"
  | "RATE_LIMIT_EXCEEDED"
  | "INTERNAL_ERROR";

export interface ApiSuccessBody {
  ok: true;
  schemaVersion: typeof SCHEMA_VERSION;
  requestId: string;
  data: {
    source: TravelOfferInputType;
    extraction: { facts: ExtractedOfferFacts; warnings: Bi[] };
    analysis: OfferAnalysis;
  };
  meta: { durationMs: number };
}

export interface ApiErrorBody {
  ok: false;
  schemaVersion: typeof SCHEMA_VERSION;
  requestId: string;
  error: { code: ApiErrorCode; source?: TravelOfferInputType };
}

export interface HttpPayload {
  status: number;
  body: ApiSuccessBody | ApiErrorBody;
  /** Extra response headers (e.g. Retry-After on 429). */
  headers?: Record<string, string>;
}

export function buildErrorBody(
  requestId: string,
  code: ApiErrorCode,
  source?: TravelOfferInputType
): ApiErrorBody {
  return {
    ok: false,
    schemaVersion: SCHEMA_VERSION,
    requestId,
    error: source ? { code, source } : { code },
  };
}

/** Map a pipeline outcome to an HTTP status + response body. */
export function outcomeToHttp(
  outcome: PipelineOutcome,
  requestId: string,
  durationMs: number
): HttpPayload {
  if (outcome.status === "ok") {
    return {
      status: 200,
      body: {
        ok: true,
        schemaVersion: SCHEMA_VERSION,
        requestId,
        data: { source: outcome.source, extraction: outcome.extraction, analysis: outcome.analysis },
        meta: { durationMs },
      },
    };
  }
  if (outcome.status === "unsupported") {
    return { status: 501, body: buildErrorBody(requestId, "SOURCE_NOT_SUPPORTED", outcome.source) };
  }
  // extraction_failed
  return { status: 422, body: buildErrorBody(requestId, "NOT_ANALYZABLE") };
}
