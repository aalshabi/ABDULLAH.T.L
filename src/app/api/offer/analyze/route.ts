/**
 * POST /api/offer/analyze — a deliberately THIN route handler.
 *
 * It performs I/O only: read headers/body, mint a server-side requestId, apply
 * rate limiting, measure processing time, and serialize. All validation and
 * business logic live in src/lib/offer-pipeline (validateRequest,
 * runOfferPipeline, outcomeToHttp, offerRateLimiter, logServerError).
 *
 * Security: nodejs runtime, force-dynamic, Cache-Control: no-store, server-side
 * rate limiting (429 + Retry-After), no logging of user text/evidence, no user
 * content in error bodies, no storage, no external fetch, no PDF/OCR, no secrets.
 */

import { randomUUID } from "node:crypto";
import { ipAddress } from "@vercel/functions";
import { runOfferPipeline } from "@/lib/offer-pipeline/pipeline";
import { validateRequest } from "@/lib/offer-pipeline/api/validate-request";
import { buildErrorBody, outcomeToHttp, type HttpPayload } from "@/lib/offer-pipeline/api/response";
import { offerRateLimiter } from "@/lib/offer-pipeline/api/rate-limit";
import { logServerError } from "@/lib/offer-pipeline/api/logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(payload: HttpPayload): Response {
  return new Response(JSON.stringify(payload.body), {
    status: payload.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(payload.headers ?? {}),
    },
  });
}

/**
 * Best-effort caller id for the rate-limit key. Used ONLY as a key — never logged.
 *
 * Prefers Vercel's official `ipAddress(request)`: on Vercel the client IP is
 * managed by the platform, which prevents `x-forwarded-for` spoofing. Off Vercel
 * (and in tests) it falls back to headers, always taking only the CLIENT (first)
 * address — never the whole chain:
 *   x-vercel-forwarded-for → x-forwarded-for → x-real-ip → "unknown".
 *
 * NOTE: if an external proxy is placed IN FRONT of Vercel, review its Trusted
 * Proxy configuration so the first hop is genuinely the client. The limiter
 * itself remains LOCAL DEFENSE ONLY (in-memory, per instance, not distributed).
 */
function clientId(request: Request): string {
  const platformIp = ipAddress(request);
  if (platformIp) return platformIp;

  const header =
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip");
  return header?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request): Promise<Response> {
  const requestId = randomUUID();
  const startedAt = Date.now();
  try {
    const rate = offerRateLimiter.check(clientId(request));
    if (!rate.allowed) {
      return json({
        status: 429,
        body: buildErrorBody(requestId, "RATE_LIMIT_EXCEEDED"),
        headers: { "retry-after": String(rate.retryAfterSeconds) },
      });
    }

    const contentType = request.headers.get("content-type");
    const bodyText = await request.text();
    const byteLength = Buffer.byteLength(bodyText, "utf8");

    const check = validateRequest({ contentType, bodyText, byteLength });
    if (!check.ok) {
      return json({ status: check.status, body: buildErrorBody(requestId, check.code, check.source) });
    }

    const outcome = await runOfferPipeline(check.source);
    const durationMs = Date.now() - startedAt;

    return json(outcomeToHttp(outcome, requestId, durationMs));
  } catch {
    const durationMs = Date.now() - startedAt;
    logServerError({ requestId, code: "INTERNAL_ERROR", status: 500, durationMs });
    return json({ status: 500, body: buildErrorBody(requestId, "INTERNAL_ERROR") });
  }
}
