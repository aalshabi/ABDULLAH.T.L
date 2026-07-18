/**
 * POST /api/offer/analyze — a deliberately THIN route handler.
 *
 * It performs I/O only: read headers/body, mint a server-side requestId, measure
 * processing time, and serialize. All validation and business logic live in
 * src/lib/offer-pipeline (validateRequest, runOfferPipeline, outcomeToHttp).
 *
 * Security: nodejs runtime, force-dynamic, Cache-Control: no-store, no logging
 * of user text/evidence, no user content in error bodies, no storage, no
 * external fetch, no PDF/OCR, no secrets.
 */

import { randomUUID } from "node:crypto";
import { runOfferPipeline } from "@/lib/offer-pipeline/pipeline";
import { validateRequest } from "@/lib/offer-pipeline/api/validate-request";
import { buildErrorBody, outcomeToHttp, type HttpPayload } from "@/lib/offer-pipeline/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(payload: HttpPayload): Response {
  return new Response(JSON.stringify(payload.body), {
    status: payload.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const requestId = randomUUID();
  try {
    const contentType = request.headers.get("content-type");
    const bodyText = await request.text();
    const byteLength = Buffer.byteLength(bodyText, "utf8");

    const check = validateRequest({ contentType, bodyText, byteLength });
    if (!check.ok) {
      return json({ status: check.status, body: buildErrorBody(requestId, check.code, check.source) });
    }

    const startedAt = Date.now();
    const outcome = await runOfferPipeline(check.source);
    const durationMs = Date.now() - startedAt;

    return json(outcomeToHttp(outcome, requestId, durationMs));
  } catch {
    return json({ status: 500, body: buildErrorBody(requestId, "INTERNAL_ERROR") });
  }
}
