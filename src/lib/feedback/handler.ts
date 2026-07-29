import { randomUUID } from "node:crypto";
import { ipAddress } from "@vercel/functions";
import {
  FEEDBACK_MAX_BODY_BYTES,
  FEEDBACK_SCHEMA_VERSION,
  validateFeedbackBody,
  type FeedbackRecord,
} from "./schema";
import type { FeedbackStore } from "./store";
import { logFeedbackServerError } from "./logging";
import type { RateLimiter } from "@/lib/offer-pipeline/api/rate-limit";

type FeedbackErrorCode =
  | "BAD_REQUEST"
  | "PAYLOAD_TOO_LARGE"
  | "RATE_LIMIT_EXCEEDED"
  | "STORAGE_UNAVAILABLE"
  | "INTERNAL_ERROR";

const MESSAGES = {
  success: {
    ar: "شكرًا، تم تسجيل ملاحظتك.",
    en: "Thank you. Your feedback was recorded.",
  },
  invalid: {
    ar: "بيانات الملاحظة غير صالحة.",
    en: "The feedback data is invalid.",
  },
  tooLarge: {
    ar: "حجم الملاحظة أكبر من الحد المسموح.",
    en: "The feedback request is too large.",
  },
  rateLimited: {
    ar: "تم إرسال ملاحظات كثيرة خلال وقت قصير. حاول لاحقًا.",
    en: "Too many feedback requests were sent. Try again later.",
  },
  unavailable: {
    ar: "تعذّر تسجيل الملاحظة الآن. حاول مرة أخرى لاحقًا.",
    en: "Feedback could not be recorded now. Try again later.",
  },
} as const;

type Message = { ar: string; en: string };
type FeedbackResponse =
  | {
      ok: true;
      schemaVersion: typeof FEEDBACK_SCHEMA_VERSION;
      requestId: string;
      message: Message;
    }
  | {
      ok: false;
      schemaVersion: typeof FEEDBACK_SCHEMA_VERSION;
      requestId: string;
      error: { code: FeedbackErrorCode; message: Message };
    };

function json(body: FeedbackResponse, status: number, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

function success(requestId: string): FeedbackResponse {
  return {
    ok: true,
    schemaVersion: FEEDBACK_SCHEMA_VERSION,
    requestId,
    message: MESSAGES.success,
  };
}

function error(
  requestId: string,
  code: FeedbackErrorCode,
  message: Message
): FeedbackResponse {
  return {
    ok: false,
    schemaVersion: FEEDBACK_SCHEMA_VERSION,
    requestId,
    error: { code, message },
  };
}

function clientKey(request: Request): string {
  const platformIp = ipAddress(request);
  if (platformIp) return platformIp;
  const header =
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip");
  return header?.split(",")[0]?.trim() || "unknown";
}

async function readLimitedBody(
  request: Request
): Promise<{ ok: true; text: string } | { ok: false }> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > FEEDBACK_MAX_BODY_BYTES
  ) {
    return { ok: false };
  }
  if (!request.body) return { ok: true, text: "" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > FEEDBACK_MAX_BODY_BYTES) {
      await reader.cancel();
      return { ok: false };
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, text: new TextDecoder().decode(bytes) };
}

interface FeedbackHandlerDependencies {
  store: FeedbackStore;
  rateLimiter: RateLimiter;
  now?: () => Date;
}

export function createFeedbackHandler({
  store,
  rateLimiter,
  now = () => new Date(),
}: FeedbackHandlerDependencies) {
  return async function handleFeedback(request: Request): Promise<Response> {
    const requestId = randomUUID();
    const startedAt = Date.now();
    try {
      const rate = rateLimiter.check(clientKey(request));
      if (!rate.allowed) {
        return json(
          error(requestId, "RATE_LIMIT_EXCEEDED", MESSAGES.rateLimited),
          429,
          { "retry-after": String(rate.retryAfterSeconds) }
        );
      }

      if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
        return json(error(requestId, "BAD_REQUEST", MESSAGES.invalid), 400);
      }

      const body = await readLimitedBody(request);
      if (!body.ok) {
        return json(error(requestId, "PAYLOAD_TOO_LARGE", MESSAGES.tooLarge), 413);
      }

      let raw: unknown;
      try {
        raw = JSON.parse(body.text);
      } catch {
        return json(error(requestId, "BAD_REQUEST", MESSAGES.invalid), 400);
      }

      const validation = validateFeedbackBody(raw);
      if (!validation.ok) {
        return json(error(requestId, validation.code, MESSAGES.invalid), 400);
      }

      const record: FeedbackRecord = {
        ...validation.value,
        timestamp: now().toISOString(),
      };

      try {
        await store.save(record);
      } catch {
        logFeedbackServerError({
          requestId,
          code: "STORAGE_UNAVAILABLE",
          status: 500,
          durationMs: Date.now() - startedAt,
        });
        return json(
          error(requestId, "STORAGE_UNAVAILABLE", MESSAGES.unavailable),
          500
        );
      }

      return json(success(requestId), 200);
    } catch {
      logFeedbackServerError({
        requestId,
        code: "INTERNAL_ERROR",
        status: 500,
        durationMs: Date.now() - startedAt,
      });
      return json(error(requestId, "INTERNAL_ERROR", MESSAGES.unavailable), 500);
    }
  };
}
