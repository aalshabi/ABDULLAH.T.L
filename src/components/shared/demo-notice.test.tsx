import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { LanguageProvider } from "@/lib/i18n/provider";
import { DemoNotice, DemoUnavailable } from "./demo-notice";

afterEach(cleanup);

describe("DemoNotice", () => {
  // (4) an analysis result shows the Demo badge — the notice renders the exact
  // demo text (default locale is Arabic).
  it("renders the demo badge text", () => {
    render(
      <LanguageProvider>
        <DemoNotice />
      </LanguageProvider>
    );
    expect(screen.getByText(/نسخة تجريبية/)).toBeTruthy();
  });

  it("DemoUnavailable renders the neutral 'not available' text", () => {
    render(
      <LanguageProvider>
        <DemoUnavailable />
      </LanguageProvider>
    );
    expect(screen.getByText(/غير متاح في النسخة التجريبية/)).toBeTruthy();
  });
});
