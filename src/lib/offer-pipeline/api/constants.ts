/**
 * API limits and the response schema version. Text limits reuse the shared
 * OFFER_LIMITS so the server enforces the same bounds as the input layer.
 */

import { OFFER_LIMITS } from "@/lib/offer-input/types";

export { SCHEMA_VERSION } from "@/lib/offer-pipeline/types";

/** Minimum trimmed characters for text to be analyzable. */
export const MIN_TEXT_CHARS = OFFER_LIMITS.textMin;

/** Maximum characters accepted for offer text. */
export const MAX_TEXT_CHARS = OFFER_LIMITS.textMax;

/** Hard cap on the raw request body size in bytes. */
export const MAX_BODY_BYTES = 100_000;

/** The one Content-Type the endpoint accepts. */
export const REQUIRED_CONTENT_TYPE = "application/json";

/** Marks responses produced by the application route, not a generic edge response. */
export const APPLICATION_RESPONSE_HEADER = "x-safrbwai-application-response";
export const APPLICATION_RESPONSE_MARKER = "1";
