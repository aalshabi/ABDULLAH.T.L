import { afterEach, describe, expect, it, vi } from "vitest";
import { createFeedbackHandler } from "@/lib/feedback/handler";
import {
  FEEDBACK_COMMENT_MAX_CHARS,
  FEEDBACK_SCHEMA_VERSION,
} from "@/lib/feedback/schema";
import {
  DisabledFeedbackStore,
  InMemoryFeedbackStore,
  createDefaultFeedbackStore,
  type FeedbackStore,
} from "@/lib/feedback/store";
import { createInMemoryRateLimiter } from "@/lib/offer-pipeline/api/rate-limit";

const URL = "http://localhost/api/feedback";
const NOW = new Date("2026-07-29T10:00:00.000Z");
const VALID_PAYLOAD = {
  requestId: "analysis-1",
  feedback: "helpful",
  locale: "ar",
  sourceType: "text",
  schemaVersion: FEEDBACK_SCHEMA_VERSION,
} as const;

function request(body: unknown, ip = "203.0.113.10") {
  return new Request(URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function setup(
  store: FeedbackStore = new InMemoryFeedbackStore(),
  max = 10,
  enabled = true
) {
  return {
    store,
    handler: createFeedbackHandler({
      store,
      rateLimiter: createInMemoryRateLimiter({ max, windowMs: 60_000 }),
      enabled,
      now: () => NOW,
    }),
  };
}

afterEach(() => vi.restoreAllMocks());

describe("POST /api/feedback", () => {
  it("returns 503 FEEDBACK_DISABLED without reading or storing when the server flag is off", async () => {
    const save = vi.fn();
    const store: FeedbackStore = { save };
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { handler } = setup(store, 10, false);
    const res = await handler(
      request({
        ...VALID_PAYLOAD,
        comment: "PRIVATE_DISABLED_PAYLOAD",
      })
    );

    expect(res.status).toBe(503);
    expect(save).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body).toEqual({
      ok: false,
      schemaVersion: FEEDBACK_SCHEMA_VERSION,
      requestId: expect.any(String),
      error: {
        code: "FEEDBACK_DISABLED",
        message: {
          ar: "استقبال الملاحظات غير مفعّل حاليًا.",
          en: "Feedback collection is not currently enabled.",
        },
      },
    });
    expect(JSON.stringify(body)).not.toContain("شكرًا، تم تسجيل ملاحظتك.");
  });

  it("returns 503 without a success message when the store reports disabled", async () => {
    const { handler } = setup(new DisabledFeedbackStore());
    const res = await handler(request(VALID_PAYLOAD));

    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("FEEDBACK_DISABLED");
    expect(JSON.stringify(body)).not.toContain("شكرًا، تم تسجيل ملاحظتك.");
    expect(JSON.stringify(body)).not.toContain(
      "Thank you. Your feedback was recorded."
    );
  });

  it("stores only the allowed privacy-safe fields with a server timestamp", async () => {
    const { store, handler } = setup();
    const res = await handler(request(VALID_PAYLOAD));

    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = await res.json();
    expect(body).toMatchObject({
      ok: true,
      schemaVersion: FEEDBACK_SCHEMA_VERSION,
      message: {
        ar: "شكرًا، تم تسجيل ملاحظتك.",
        en: "Thank you. Your feedback was recorded.",
      },
    });

    const records = (store as InMemoryFeedbackStore).getAll();
    expect(records).toHaveLength(1);
    expect(records[0]).toEqual({
      ...VALID_PAYLOAD,
      timestamp: NOW.toISOString(),
    });
    expect(Object.keys(records[0]).sort()).toEqual([
      "feedback",
      "locale",
      "requestId",
      "schemaVersion",
      "sourceType",
      "timestamp",
    ]);
  });

  it("returns 400 for unknown fields, invalid values and invalid JSON", async () => {
    const { handler } = setup();
    const withOfferContent = await handler(
      request({
        ...VALID_PAYLOAD,
        offerText: "private offer",
        evidence: ["private evidence"],
      })
    );
    expect(withOfferContent.status).toBe(400);

    const invalidValue = await handler(
      request({ ...VALID_PAYLOAD, feedback: "maybe" })
    );
    expect(invalidValue.status).toBe(400);

    const invalidJson = await handler(request("{not-json"));
    expect(invalidJson.status).toBe(400);
  });

  it("rejects a comment longer than 300 characters", async () => {
    const { handler } = setup();
    const res = await handler(
      request({
        ...VALID_PAYLOAD,
        feedback: "not_helpful",
        reasonCode: "other",
        comment: "x".repeat(FEEDBACK_COMMENT_MAX_CHARS + 1),
      })
    );
    expect(res.status).toBe(400);
  });

  it("enforces a hard request-body limit", async () => {
    const { handler } = setup();
    const res = await handler(
      request({
        ...VALID_PAYLOAD,
        padding: "x".repeat(3_000),
      })
    );
    expect(res.status).toBe(413);
    expect((await res.json()).error.code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("sanitizes an allowed short comment before storage", async () => {
    const { store, handler } = setup();
    const res = await handler(
      request({
        ...VALID_PAYLOAD,
        feedback: "not_helpful",
        reasonCode: "other",
        comment: "  <ملاحظة>\nقصيرة\u0000  ",
      })
    );
    expect(res.status).toBe(200);
    expect((store as InMemoryFeedbackStore).getAll()[0].comment).toBe(
      "ملاحظة قصيرة"
    );
  });

  it("returns 429 with Retry-After from an independent limiter", async () => {
    const { handler } = setup(new InMemoryFeedbackStore(), 1);
    expect((await handler(request(VALID_PAYLOAD))).status).toBe(200);
    const blocked = await handler(request(VALID_PAYLOAD));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBeTruthy();
    const body = await blocked.json();
    expect(body.error.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(body.error.message.ar).toBeTruthy();
    expect(body.error.message.en).toBeTruthy();
  });

  it("does not log comment content when storage fails", async () => {
    const comment = "PRIVATE_COMMENT_MARKER";
    const failingStore: FeedbackStore = {
      save: vi.fn().mockRejectedValue(new Error("unavailable")),
    };
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { handler } = setup(failingStore);

    const res = await handler(
      request({
        ...VALID_PAYLOAD,
        feedback: "not_helpful",
        reasonCode: "other",
        comment,
      })
    );

    expect(res.status).toBe(500);
    const serializedLog = log.mock.calls.flat().join(" ");
    expect(serializedLog).not.toContain(comment);
    expect(Object.keys(JSON.parse(String(log.mock.calls[0][0]))).sort()).toEqual([
      "code",
      "durationMs",
      "level",
      "requestId",
      "scope",
      "status",
    ]);
  });

  it("reports explicit save results for disabled and in-memory stores", async () => {
    const disabled = new DisabledFeedbackStore();
    expect(await disabled.save({
      ...VALID_PAYLOAD,
      timestamp: NOW.toISOString(),
    })).toEqual({ stored: false, reason: "disabled" });

    const memory = new InMemoryFeedbackStore();
    expect(await memory.save({
      ...VALID_PAYLOAD,
      timestamp: NOW.toISOString(),
    })).toEqual({ stored: true });
    expect(memory.getAll()).toHaveLength(1);
  });

  it("uses a disabled store in production and memory only outside production", () => {
    expect(createDefaultFeedbackStore("production")).toBeInstanceOf(
      DisabledFeedbackStore
    );
    expect(createDefaultFeedbackStore("development")).toBeInstanceOf(
      InMemoryFeedbackStore
    );
    expect(createDefaultFeedbackStore("test")).toBeInstanceOf(
      InMemoryFeedbackStore
    );
  });
});
