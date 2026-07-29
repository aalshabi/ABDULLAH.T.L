import * as React from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  LanguageProvider,
  useLanguage,
} from "@/lib/i18n/provider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  FEEDBACK_COMMENT_MAX_CHARS,
  FEEDBACK_SCHEMA_VERSION,
} from "@/lib/feedback/schema";
import type { Locale } from "@/lib/i18n/config";
import { BetaFeedback } from "./beta-feedback";

const ar = getDictionary("ar").analyzeOffer.v2.feedback;
const en = getDictionary("en").analyzeOffer.v2.feedback;

function LocaleSetter({ locale }: { locale: Locale }) {
  const { setLocale } = useLanguage();
  React.useEffect(() => setLocale(locale), [locale, setLocale]);
  return null;
}

function renderFeedback(locale: Locale = "ar") {
  return render(
    <LanguageProvider>
      <LocaleSetter locale={locale} />
      <BetaFeedback analysisRequestId="analysis-1" sourceType="text" />
    </LanguageProvider>
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});
afterEach(cleanup);

describe("BetaFeedback", () => {
  it("renders the helpfulness question in Arabic", async () => {
    renderFeedback("ar");
    expect(await screen.findByText(ar.question)).toBeTruthy();
  });

  it("renders the helpfulness question in English", async () => {
    renderFeedback("en");
    expect(await screen.findByText(en.question)).toBeTruthy();
  });

  it("sends a safe helpful payload without offer text, evidence or personal data", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    renderFeedback();

    fireEvent.click(await screen.findByRole("button", { name: ar.yes }));
    await screen.findByText(ar.thanks);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/feedback");
    const payload = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(payload).toEqual({
      requestId: "analysis-1",
      feedback: "helpful",
      locale: "ar",
      sourceType: "text",
      schemaVersion: FEEDBACK_SCHEMA_VERSION,
    });
    expect(payload).not.toHaveProperty("text");
    expect(payload).not.toHaveProperty("evidence");
    expect(payload).not.toHaveProperty("name");
    expect(payload).not.toHaveProperty("email");
    expect(payload).not.toHaveProperty("phone");
    expect(payload).not.toHaveProperty("url");
    expect(payload).not.toHaveProperty("fileName");
  });

  it("shows optional reasons after No is selected", async () => {
    renderFeedback();
    fireEvent.click(await screen.findByRole("button", { name: ar.no }));

    expect(screen.getByText(ar.reasonPrompt)).toBeTruthy();
    expect(screen.getByText(ar.reasons.missedInformation)).toBeTruthy();
    expect(screen.getByText(ar.reasons.incorrectInformation)).toBeTruthy();
    expect(screen.getByText(ar.reasons.irrelevantQuestion)).toBeTruthy();
    expect(screen.getByText(ar.reasons.missingQuestion)).toBeTruthy();
    expect(screen.getByText(ar.reasons.unclearResult)).toBeTruthy();
    expect(screen.getByText(ar.reasons.other)).toBeTruthy();
  });

  it("limits another-reason comments to 300 characters", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    renderFeedback();

    fireEvent.click(await screen.findByRole("button", { name: ar.no }));
    fireEvent.click(screen.getByLabelText(ar.reasons.other));
    fireEvent.change(screen.getByLabelText(ar.commentLabel), {
      target: { value: "x".repeat(FEEDBACK_COMMENT_MAX_CHARS + 50) },
    });
    fireEvent.click(screen.getByRole("button", { name: ar.submit }));

    await screen.findByText(ar.thanks);
    const payload = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(payload.comment).toHaveLength(FEEDBACK_COMMENT_MAX_CHARS);
    expect(payload.reasonCode).toBe("other");
  });

  it("prevents duplicate feedback submission for the same result", async () => {
    let resolve!: (value: unknown) => void;
    const fetchMock = vi
      .fn()
      .mockReturnValue(new Promise((done) => (resolve = done)));
    vi.stubGlobal("fetch", fetchMock);
    renderFeedback();

    const yes = await screen.findByRole("button", { name: ar.yes });
    fireEvent.click(yes);
    fireEvent.click(yes);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolve({ ok: true, status: 200 });
    await screen.findByText(ar.thanks);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows a safe retryable message on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline details")));
    renderFeedback();

    fireEvent.click(await screen.findByRole("button", { name: ar.yes }));
    await waitFor(() => expect(screen.getByText(ar.error)).toBeTruthy());
    expect(document.body.textContent).not.toContain("offline details");
  });
});
