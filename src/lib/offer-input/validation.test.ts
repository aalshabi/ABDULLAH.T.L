import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  validateText,
  validateFile,
  validateUrl,
  canSubmit,
  methodHasContent,
  buildOfferInput,
  type FileLike,
  type OfferInputValues,
} from "./validation";
import { OFFER_LIMITS } from "./types";

const emptyValues: OfferInputValues = { text: "", url: "", pdf: null, image: null };
const fixedNow = new Date("2026-01-01T10:00:00.000Z");

function file(name: string, type: string, size: number): FileLike {
  return { name, type, size };
}

describe("text validation", () => {
  // (1) valid text is accepted
  it("accepts text of at least 20 chars", () => {
    expect(validateText("Dubai 5 nights for two, breakfast").ok).toBe(true);
  });
  // (2) short text is rejected
  it("rejects text shorter than 20 chars", () => {
    expect(validateText("too short")).toEqual({ ok: false, code: "text_too_short" });
  });
  it("rejects empty text", () => {
    expect(validateText("   ")).toEqual({ ok: false, code: "empty" });
  });
  it("rejects text longer than the max", () => {
    expect(validateText("x".repeat(OFFER_LIMITS.textMax + 1))).toEqual({
      ok: false,
      code: "text_too_long",
    });
  });
  // (10) Arabic text is supported
  it("accepts Arabic offer text", () => {
    expect(validateText("عرض سفر إلى دبي لمدة خمس ليالٍ لشخصين شامل الإفطار").ok).toBe(true);
  });
});

describe("file validation", () => {
  // (3) file larger than 10MB is rejected
  it("rejects a file larger than 10MB", () => {
    expect(validateFile(file("offer.pdf", "application/pdf", 11 * 1024 * 1024), "pdf")).toEqual({
      ok: false,
      code: "file_too_large",
    });
  });
  // (4) unsupported format is rejected
  it("rejects a non-PDF in the PDF field", () => {
    expect(validateFile(file("offer.exe", "application/octet-stream", 1000), "pdf")).toEqual({
      ok: false,
      code: "file_unsupported",
    });
  });
  it("accepts a valid PDF", () => {
    expect(validateFile(file("offer.pdf", "application/pdf", 1024), "pdf").ok).toBe(true);
  });
  it("accepts png/jpeg/webp images and rejects a PDF in the image field", () => {
    expect(validateFile(file("a.png", "image/png", 1024), "image").ok).toBe(true);
    expect(validateFile(file("a.jpg", "image/jpeg", 1024), "image").ok).toBe(true);
    expect(validateFile(file("a.webp", "image/webp", 1024), "image").ok).toBe(true);
    expect(validateFile(file("a.pdf", "application/pdf", 1024), "image").ok).toBe(false);
  });
});

describe("url validation", () => {
  // (5) valid url accepted
  it("accepts http/https URLs", () => {
    expect(validateUrl("https://example.com/offer").ok).toBe(true);
    expect(validateUrl("http://example.com").ok).toBe(true);
  });
  // (6) invalid url rejected
  it("rejects non-http(s) or malformed URLs", () => {
    expect(validateUrl("ftp://example.com")).toEqual({ ok: false, code: "url_invalid" });
    expect(validateUrl("example.com")).toEqual({ ok: false, code: "url_invalid" });
    expect(validateUrl("not a url")).toEqual({ ok: false, code: "url_invalid" });
  });
});

describe("submit gating", () => {
  // (7) analyze button disabled without valid input
  it("canSubmit is false with no/invalid input and true when valid", () => {
    expect(canSubmit("text", emptyValues)).toBe(false);
    expect(canSubmit("text", { ...emptyValues, text: "short" })).toBe(false);
    expect(canSubmit("text", { ...emptyValues, text: "A valid offer text over twenty chars" })).toBe(true);
    expect(canSubmit("url", { ...emptyValues, url: "https://ok.com" })).toBe(true);
    expect(canSubmit("pdf", { ...emptyValues, pdf: file("o.pdf", "application/pdf", 100) })).toBe(true);
  });

  it("methodHasContent detects content per method", () => {
    expect(methodHasContent("text", emptyValues)).toBe(false);
    expect(methodHasContent("text", { ...emptyValues, text: "x" })).toBe(true);
    expect(methodHasContent("pdf", { ...emptyValues, pdf: file("o.pdf", "application/pdf", 1) })).toBe(true);
  });
});

describe("buildOfferInput (transition to review)", () => {
  // (9) moves to a normalized review payload
  it("builds a normalized input for each valid method", () => {
    const textIn = buildOfferInput("text", { ...emptyValues, text: "  عرض دبي 5 ليالٍ لشخصين شامل الإفطار  " }, fixedNow);
    expect(textIn).toEqual({
      type: "text",
      text: "عرض دبي 5 ليالٍ لشخصين شامل الإفطار",
      createdAt: fixedNow.toISOString(),
    });

    const urlIn = buildOfferInput("url", { ...emptyValues, url: "https://ex.com/o" }, fixedNow);
    expect(urlIn?.type).toBe("url");
    expect(urlIn?.url).toBe("https://ex.com/o");

    const pdfIn = buildOfferInput("pdf", { ...emptyValues, pdf: file("offer.pdf", "application/pdf", 2048) }, fixedNow);
    expect(pdfIn?.type).toBe("pdf");
    expect(pdfIn?.file).toEqual({ name: "offer.pdf", size: 2048, mimeType: "application/pdf" });
    expect(pdfIn?.createdAt).toBe(fixedNow.toISOString());
  });

  it("returns null for invalid input (no transition)", () => {
    expect(buildOfferInput("text", { ...emptyValues, text: "short" }, fixedNow)).toBeNull();
    expect(buildOfferInput("url", { ...emptyValues, url: "bad" }, fixedNow)).toBeNull();
  });
});

describe("no fabricated analysis results", () => {
  // (8) the offer flow produces NO scores/verdicts/recommendations
  const orchestrator = readFileSync(join(process.cwd(), "src/components/analyzers/offer-analyzer.tsx"), "utf8");
  const review = readFileSync(join(process.cwd(), "src/components/offer-input/travel-offer-review.tsx"), "utf8");

  it("the orchestrator never calls the demo engine, persists results, or uses localStorage", () => {
    expect(orchestrator).not.toMatch(/analyzeOfferDeep\s*\(/);
    expect(orchestrator).not.toMatch(/saveAnalysis\s*\(/);
    expect(orchestrator).not.toContain("@/lib/analysis/engine");
    expect(orchestrator).not.toContain("localStorage");
  });

  it("the review screen shows no fabricated score/verdict and gates send by source capability", () => {
    expect(review).not.toMatch(/score|verdict|recommendation|realPrice|priceFairness/i);
    // send is now gated by the per-source capability policy, not the old flag
    expect(review).toContain("isExtractionEnabledFor");
    expect(review).not.toContain("isOfferExtractionEnabled");
  });
});
