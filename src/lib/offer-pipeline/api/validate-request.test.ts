import { describe, it, expect } from "vitest";
import { validateRequest } from "./validate-request";
import { MAX_BODY_BYTES } from "./constants";

function req(body: unknown, contentType: string | null = "application/json") {
  const bodyText = typeof body === "string" ? body : JSON.stringify(body);
  return { contentType, bodyText, byteLength: Buffer.byteLength(bodyText, "utf8") };
}

describe("validateRequest", () => {
  it("accepts valid text (Arabic and English)", () => {
    expect(validateRequest(req({ type: "text", text: "عرض إلى دبي ٥ ليالٍ لشخصين شامل الإفطار" }))).toEqual({
      ok: true,
      source: { type: "text", text: "عرض إلى دبي ٥ ليالٍ لشخصين شامل الإفطار" },
    });
    expect(validateRequest(req({ type: "text", text: "Dubai 5 nights for two, breakfast" })).ok).toBe(true);
  });

  it("415 for a non-JSON content type", () => {
    expect(validateRequest(req({ type: "text", text: "x".repeat(30) }, "text/plain"))).toMatchObject({
      status: 415,
      code: "UNSUPPORTED_MEDIA_TYPE",
    });
  });

  it("413 for a body over the byte cap", () => {
    const bodyText = JSON.stringify({ type: "text", text: "x".repeat(MAX_BODY_BYTES + 10) });
    expect(validateRequest({ contentType: "application/json", bodyText, byteLength: bodyText.length })).toMatchObject({
      status: 413,
      code: "PAYLOAD_TOO_LARGE",
    });
  });

  it("413 for text longer than the character limit", () => {
    expect(validateRequest(req({ type: "text", text: "x".repeat(15_001) })).ok).toBe(false);
    expect(validateRequest(req({ type: "text", text: "x".repeat(15_001) }))).toMatchObject({ status: 413 });
  });

  it("400 for invalid JSON", () => {
    expect(validateRequest(req("{not json", "application/json"))).toMatchObject({ status: 400, code: "INVALID_JSON" });
  });

  it("400 for a malformed/unknown request shape", () => {
    expect(validateRequest(req({ type: "unknown" }))).toMatchObject({ status: 400, code: "BAD_REQUEST" });
    expect(validateRequest(req({ type: "text", text: 123 }))).toMatchObject({ status: 400, code: "BAD_REQUEST" });
  });

  it("422 for empty or too-short text", () => {
    expect(validateRequest(req({ type: "text", text: "   " }))).toMatchObject({ status: 422, code: "NOT_ANALYZABLE" });
    expect(validateRequest(req({ type: "text", text: "hi" }))).toMatchObject({ status: 422, code: "NOT_ANALYZABLE" });
  });

  it("501 for disabled sources (pdf/image/url) with the source type", () => {
    expect(validateRequest(req({ type: "pdf" }))).toEqual({ ok: false, status: 501, code: "SOURCE_NOT_SUPPORTED", source: "pdf" });
    expect(validateRequest(req({ type: "image" }))).toMatchObject({ status: 501, source: "image" });
    expect(validateRequest(req({ type: "url" }))).toMatchObject({ status: 501, source: "url" });
  });
});
