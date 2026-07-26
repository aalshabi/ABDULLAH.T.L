import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { POST } from "./route";
import { offerRateLimiter, OFFER_RATE_LIMIT_MAX } from "@/lib/offer-pipeline/api/rate-limit";

const URL = "http://localhost/api/offer/analyze";
const VALID_TEXT = "عرض إلى دبي ٥ ليالٍ لشخصين شامل الإفطار، السعر ٣٢٠٠ ر.س";

function post(body: unknown, contentType: string | null = "application/json") {
  const bodyText = typeof body === "string" ? body : JSON.stringify(body);
  const headers: Record<string, string> = {};
  if (contentType) headers["content-type"] = contentType;
  return new Request(URL, { method: "POST", headers, body: bodyText });
}

// Each test starts with a fresh rate-limit window.
beforeEach(() => offerRateLimiter.reset());

describe("POST /api/offer/analyze", () => {
  it("200 for valid Arabic text with the full envelope", async () => {
    const res = await POST(post({ type: "text", text: "عرض إلى دبي ٥ ليالٍ لشخصين شامل الإفطار، السعر ٣٢٠٠ ر.س" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.schemaVersion).toBe("1.0");
    expect(typeof body.requestId).toBe("string");
    expect(body.requestId.length).toBeGreaterThan(0);
    expect(body.data.source).toBe("text");
    expect(body.data.analysis).toBeTruthy();
    expect(body.data.extraction).toBeTruthy();
    expect(typeof body.meta.durationMs).toBe("number");
  });

  it("200 for valid English text", async () => {
    const res = await POST(post({ type: "text", text: "Dubai 5 nights for 2 adults, bed and breakfast, SAR 3200" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.analysis.completeness.required).toBe(10);
  });

  it("400 for invalid JSON", async () => {
    const res = await POST(post("{not json", "application/json"));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("INVALID_JSON");
  });

  it("413 for an over-limit body", async () => {
    const res = await POST(post({ type: "text", text: "x".repeat(200_000) }));
    expect(res.status).toBe(413);
  });

  it("415 for a wrong Content-Type", async () => {
    const res = await POST(post({ type: "text", text: "x".repeat(30) }, "text/plain"));
    expect(res.status).toBe(415);
  });

  it("422 for empty or too-short text", async () => {
    expect((await POST(post({ type: "text", text: "   " }))).status).toBe(422);
    expect((await POST(post({ type: "text", text: "hi" }))).status).toBe(422);
  });

  it("501 for pdf / image / url with the source type", async () => {
    for (const type of ["pdf", "image", "url"] as const) {
      const res = await POST(post({ type }));
      expect(res.status).toBe(501);
      const body = await res.json();
      expect(body.error).toEqual({ code: "SOURCE_NOT_SUPPORTED", source: type });
    }
  });

  it("every response carries schemaVersion, requestId and no-store", async () => {
    const res = await POST(post({ type: "pdf" }));
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = await res.json();
    expect(body.schemaVersion).toBe("1.0");
    expect(typeof body.requestId).toBe("string");
  });

  it("allows requests within the rate limit", async () => {
    const res = await POST(post({ type: "text", text: VALID_TEXT }));
    expect(res.status).toBe(200);
  });

  it("returns 429 with Retry-After and no-store after exceeding the limit", async () => {
    let res!: Response;
    for (let i = 0; i < OFFER_RATE_LIMIT_MAX + 1; i++) {
      res = await POST(post({ type: "text", text: VALID_TEXT }));
    }
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBeTruthy();
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = await res.json();
    expect(body.error.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(body.schemaVersion).toBe("1.0");
    expect(typeof body.requestId).toBe("string");
  });

  it("rate-limits per client, keying on the first x-forwarded-for hop only", async () => {
    const withXff = (xff: string) =>
      new Request(URL, {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": xff },
        body: JSON.stringify({ type: "text", text: VALID_TEXT }),
      });
    // Exhaust client A (first hop 1.1.1.1); a shared second hop must NOT merge clients.
    let last!: Response;
    for (let i = 0; i < OFFER_RATE_LIMIT_MAX + 1; i++) last = await POST(withXff("1.1.1.1, 10.0.0.1"));
    expect(last.status).toBe(429);
    // A different client (first hop 2.2.2.2) is independent despite the shared second hop.
    expect((await POST(withXff("2.2.2.2, 10.0.0.1"))).status).toBe(200);
  });

  it("never leaks user text in an error response", async () => {
    const secret = "SECRET_TOKEN_9931";
    const res = await POST(post({ type: "text", text: secret })); // too short → 422
    expect(res.status).toBe(422);
    const raw = JSON.stringify(await res.json());
    expect(raw).not.toContain(secret);
  });

  it("mints a fresh requestId per request (not client-controlled)", async () => {
    const a = await (await POST(post({ type: "pdf", requestId: "client-supplied" }))).json();
    const b = await (await POST(post({ type: "pdf", requestId: "client-supplied" }))).json();
    expect(a.requestId).not.toBe("client-supplied");
    expect(a.requestId).not.toBe(b.requestId);
  });
});

describe("route handler contains no business logic (source scan)", () => {
  const src = readFileSync(join(process.cwd(), "src/app/api/offer/analyze/route.ts"), "utf8");

  it("does not import extractor/normalize/analysis layers", () => {
    expect(src).not.toMatch(/from\s+["'][^"']*extractors[^"']*["']/);
    expect(src).not.toMatch(/from\s+["'][^"']*normalize[^"']*["']/);
    expect(src).not.toMatch(/from\s+["'][^"']*analysis[^"']*["']/);
  });

  it("does not call extraction or analysis functions directly", () => {
    expect(src).not.toMatch(/analyzeFacts\s*\(/);
    expect(src).not.toMatch(/normalizeExtraction\s*\(/);
    expect(src).not.toMatch(/getExtractor\s*\(/);
  });

  it("declares nodejs runtime, force-dynamic and no-store", () => {
    expect(src).toMatch(/runtime\s*=\s*["']nodejs["']/);
    expect(src).toMatch(/dynamic\s*=\s*["']force-dynamic["']/);
    expect(src).toContain("no-store");
  });
});
