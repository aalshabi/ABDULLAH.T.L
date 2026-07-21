import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { LanguageProvider } from "@/lib/i18n/provider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { OfferAnalysis } from "@/lib/offer-pipeline/analysis/types";
import { OfferAnalyzer } from "./offer-analyzer";

const d = getDictionary("ar");
const VALID_TEXT = "عرض إلى دبي خمس ليالٍ لشخصين شامل الإفطار، السعر ٣٢٠٠ ر.س، التأشيرة غير مشمولة.";

const SAMPLE_ANALYSIS: OfferAnalysis = {
  confirmedFacts: [
    { key: "nights", label: { ar: "عدد الليالي", en: "Nights" }, value: 5, evidence: "٥ ليالٍ", confidenceType: "exact" },
  ],
  missingFields: [{ key: "cancellationPolicy", label: { ar: "سياسة الإلغاء", en: "Cancellation policy" }, requirement: "recommended" }],
  contradictions: [],
  checklist: [{ key: "nights", label: { ar: "عدد الليالي", en: "Nights" }, status: "present", evidence: ["٥ ليالٍ"], explanation: { ar: "واضحة.", en: "clear" } }],
  suggestedQuestions: [{ key: "cancellationPolicy", question: { ar: "ما سياسة الإلغاء؟", en: "policy?" }, priority: "medium" }],
  completeness: { present: 1, required: 3, fields: [{ key: "totalPrice", present: false }, { key: "currency", present: false }, { key: "nights", present: true }] },
};

function okResponse(analysis: OfferAnalysis) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ ok: true, schemaVersion: "1.0", requestId: "srv-1", data: { source: "text", extraction: { facts: {}, warnings: [] }, analysis }, meta: { durationMs: 1 } }),
  };
}
function errResponse(status: number) {
  return { ok: false, status, json: async () => ({ ok: false, schemaVersion: "1.0", requestId: "srv-1", error: { code: "X" } }) };
}
// A 429 may originate at an edge WAF before the app, so its body is arbitrary
// and must never be surfaced. This marker asserts we ignore it.
const WAF_MARKER = "RAW_EDGE_WAF_BODY_MARKER";
function rateLimitedResponse() {
  return { ok: false, status: 429, json: async () => ({ message: WAF_MARKER }) };
}

function renderAnalyzer() {
  return render(
    <LanguageProvider>
      <OfferAnalyzer />
    </LanguageProvider>
  );
}

async function goToReview() {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: VALID_TEXT } });
  fireEvent.click(screen.getByRole("button", { name: d.analyzeOffer.v1.startAnalysis }));
  await screen.findByRole("button", { name: d.analyzeOffer.v1.review.confirmSend });
}

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  }) as typeof requestAnimationFrame;
});
beforeEach(() => {
  vi.restoreAllMocks();
});
afterEach(cleanup);

describe("OfferAnalyzer text → API integration", () => {
  it("enables the text confirm button on valid input", async () => {
    renderAnalyzer();
    await goToReview();
    expect(screen.getByRole("button", { name: d.analyzeOffer.v1.review.confirmSend }).hasAttribute("disabled")).toBe(false);
  });

  it("shows the analysis result on a successful call (Arabic)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse(SAMPLE_ANALYSIS));
    vi.stubGlobal("fetch", fetchMock);
    renderAnalyzer();
    await goToReview();
    fireEvent.click(screen.getByRole("button", { name: d.analyzeOffer.v1.review.confirmSend }));

    await waitFor(() => expect(screen.getByText(d.analyzeOffer.v2.result.title)).toBeTruthy());
    // called the same-origin endpoint with only the text payload
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/offer/analyze");
    expect(String(fetchMock.mock.calls[0][1]?.body)).toContain('"type":"text"');
    // renders sections, no opaque score
    expect(screen.getByText(d.analyzeOffer.v2.result.completenessTitle)).toBeTruthy();
    expect(document.body.textContent?.toLowerCase()).not.toContain("score");
  });

  it("shows a loading state and prevents duplicate submissions", async () => {
    let resolve!: (v: unknown) => void;
    const fetchMock = vi.fn().mockReturnValue(new Promise((r) => (resolve = r)));
    vi.stubGlobal("fetch", fetchMock);
    renderAnalyzer();
    await goToReview();

    const confirm = screen.getByRole("button", { name: d.analyzeOffer.v1.review.confirmSend });
    fireEvent.click(confirm);
    await screen.findByText(d.analyzeOffer.v2.loading);
    // the confirm button is now disabled → a second click cannot re-submit
    expect(confirm.hasAttribute("disabled")).toBe(true);
    fireEvent.click(confirm);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolve(okResponse(SAMPLE_ANALYSIS));
  });

  it("maps 422 to a clear Arabic error without leaking user text", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errResponse(422)));
    renderAnalyzer();
    await goToReview();
    fireEvent.click(screen.getByRole("button", { name: d.analyzeOffer.v1.review.confirmSend }));
    await waitFor(() => expect(screen.getByText(d.analyzeOffer.v2.errors.notAnalyzable)).toBeTruthy());
    expect(document.body.textContent).not.toContain(VALID_TEXT);
  });

  it("maps 501 and 500 to their messages", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errResponse(501)));
    renderAnalyzer();
    await goToReview();
    fireEvent.click(screen.getByRole("button", { name: d.analyzeOffer.v1.review.confirmSend }));
    await waitFor(() => expect(screen.getByText(d.analyzeOffer.v2.errors.sourceNotSupported)).toBeTruthy());

    cleanup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(errResponse(500)));
    renderAnalyzer();
    await goToReview();
    fireEvent.click(screen.getByRole("button", { name: d.analyzeOffer.v1.review.confirmSend }));
    await waitFor(() => expect(screen.getByText(d.analyzeOffer.v2.errors.server)).toBeTruthy());
  });

  it("maps a network failure to the network error and offers retry", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    renderAnalyzer();
    await goToReview();
    fireEvent.click(screen.getByRole("button", { name: d.analyzeOffer.v1.review.confirmSend }));
    await waitFor(() => expect(screen.getByText(d.analyzeOffer.v2.errors.network)).toBeTruthy());
    expect(screen.getByRole("button", { name: d.analyzeOffer.v2.actions.retry })).toBeTruthy();
  });

  // (Task 1.1) 429 → the dedicated Arabic message, decided on STATUS alone
  it("shows the rate-limit message on HTTP 429", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(rateLimitedResponse()));
    renderAnalyzer();
    await goToReview();
    fireEvent.click(screen.getByRole("button", { name: d.analyzeOffer.v1.review.confirmSend }));
    await waitFor(() => expect(screen.getByText(d.analyzeOffer.v2.errors.rateLimited)).toBeTruthy());
  });

  // (Task 1.3) the raw edge/WAF body is never surfaced to the user
  it("never shows the raw 429 body from an edge WAF", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(rateLimitedResponse()));
    renderAnalyzer();
    await goToReview();
    fireEvent.click(screen.getByRole("button", { name: d.analyzeOffer.v1.review.confirmSend }));
    await waitFor(() => screen.getByText(d.analyzeOffer.v2.errors.rateLimited));
    expect(document.body.textContent).not.toContain(WAF_MARKER);
  });

  // (Task 1.2) a 60s cooldown blocks resubmission with NO auto-retry
  it("blocks resubmission for the cooldown window and offers no auto-retry", async () => {
    const fetchMock = vi.fn().mockResolvedValue(rateLimitedResponse());
    vi.stubGlobal("fetch", fetchMock);
    renderAnalyzer();
    await goToReview();
    fireEvent.click(screen.getByRole("button", { name: d.analyzeOffer.v1.review.confirmSend }));
    await waitFor(() => screen.getByText(d.analyzeOffer.v2.errors.rateLimited));

    // a visible countdown is shown, and no retry button appears during cooldown
    expect(screen.getByText(/ثانية/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: d.analyzeOffer.v2.actions.retry })).toBeNull();

    // editing is still allowed; re-confirming must NOT hit the API again
    fireEvent.click(screen.getByRole("button", { name: d.analyzeOffer.v2.actions.edit }));
    fireEvent.click(screen.getByRole("button", { name: d.analyzeOffer.v1.startAnalysis }));
    await screen.findByRole("button", { name: d.analyzeOffer.v1.review.confirmSend });
    fireEvent.click(screen.getByRole("button", { name: d.analyzeOffer.v1.review.confirmSend }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
