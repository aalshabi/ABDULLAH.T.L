import type { Locale } from "@/lib/i18n/config";
import type { TravelOfferInputType } from "@/lib/offer-input/types";

export const FEEDBACK_SCHEMA_VERSION = "1.0" as const;
export const FEEDBACK_MAX_BODY_BYTES = 2_048;
export const FEEDBACK_COMMENT_MAX_CHARS = 300;

export const FEEDBACK_REASON_CODES = [
  "missed_information",
  "incorrect_information",
  "irrelevant_question",
  "missing_question",
  "unclear_result",
  "other",
] as const;

export type FeedbackReasonCode = (typeof FEEDBACK_REASON_CODES)[number];
export type FeedbackValue = "helpful" | "not_helpful";

export interface FeedbackSubmission {
  requestId?: string;
  feedback: FeedbackValue;
  reasonCode?: FeedbackReasonCode;
  comment?: string;
  locale: Locale;
  sourceType: TravelOfferInputType;
  schemaVersion: typeof FEEDBACK_SCHEMA_VERSION;
}

export interface FeedbackRecord extends FeedbackSubmission {
  timestamp: string;
}

export type FeedbackValidationResult =
  | { ok: true; value: FeedbackSubmission }
  | { ok: false; code: "BAD_REQUEST" };

const ALLOWED_KEYS = new Set([
  "requestId",
  "feedback",
  "reasonCode",
  "comment",
  "locale",
  "sourceType",
  "schemaVersion",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isRequestId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 128 &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
}

function sanitizeComment(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateFeedbackBody(raw: unknown): FeedbackValidationResult {
  if (!isPlainObject(raw)) return { ok: false, code: "BAD_REQUEST" };
  if (Object.keys(raw).some((key) => !ALLOWED_KEYS.has(key))) {
    return { ok: false, code: "BAD_REQUEST" };
  }

  const feedback = raw.feedback;
  const locale = raw.locale;
  const sourceType = raw.sourceType;
  const schemaVersion = raw.schemaVersion;

  if (feedback !== "helpful" && feedback !== "not_helpful") {
    return { ok: false, code: "BAD_REQUEST" };
  }
  if (locale !== "ar" && locale !== "en") {
    return { ok: false, code: "BAD_REQUEST" };
  }
  if (!["text", "pdf", "image", "url"].includes(String(sourceType))) {
    return { ok: false, code: "BAD_REQUEST" };
  }
  if (schemaVersion !== FEEDBACK_SCHEMA_VERSION) {
    return { ok: false, code: "BAD_REQUEST" };
  }
  if (raw.requestId !== undefined && !isRequestId(raw.requestId)) {
    return { ok: false, code: "BAD_REQUEST" };
  }

  const reasonCode = raw.reasonCode;
  if (
    reasonCode !== undefined &&
    (typeof reasonCode !== "string" ||
      !FEEDBACK_REASON_CODES.includes(reasonCode as FeedbackReasonCode))
  ) {
    return { ok: false, code: "BAD_REQUEST" };
  }
  if (feedback === "helpful" && (reasonCode !== undefined || raw.comment !== undefined)) {
    return { ok: false, code: "BAD_REQUEST" };
  }

  let comment: string | undefined;
  if (raw.comment !== undefined) {
    if (typeof raw.comment !== "string" || reasonCode !== "other") {
      return { ok: false, code: "BAD_REQUEST" };
    }
    comment = sanitizeComment(raw.comment);
    if (!comment || comment.length > FEEDBACK_COMMENT_MAX_CHARS) {
      return { ok: false, code: "BAD_REQUEST" };
    }
  }

  return {
    ok: true,
    value: {
      ...(raw.requestId ? { requestId: raw.requestId as string } : {}),
      feedback,
      ...(reasonCode ? { reasonCode: reasonCode as FeedbackReasonCode } : {}),
      ...(comment ? { comment } : {}),
      locale,
      sourceType: sourceType as TravelOfferInputType,
      schemaVersion,
    },
  };
}
