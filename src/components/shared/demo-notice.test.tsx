import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { LanguageProvider } from "@/lib/i18n/provider";
import { DemoNotice, DemoUnavailable } from "./demo-notice";

afterEach(cleanup);

describe("DemoNotice", () => {
  it("renders accurate pre-launch preview text", () => {
    render(
      <LanguageProvider>
        <DemoNotice />
      </LanguageProvider>
    );
    expect(screen.getByText(/معاينة قبل الإطلاق/)).toBeTruthy();
  });

  it("DemoUnavailable renders the neutral current-unavailability text", () => {
    render(
      <LanguageProvider>
        <DemoUnavailable />
      </LanguageProvider>
    );
    expect(screen.getByText(/غير متاح حاليًا/)).toBeTruthy();
  });
});
