import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/lib/i18n/provider";
import { CLOSED_BETA_VERSION } from "@/lib/beta/version";
import { ClosedBetaNotice } from "./closed-beta-notice";

function renderNotice() {
  return render(
    <LanguageProvider>
      <ClosedBetaNotice />
    </LanguageProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("ClosedBetaNotice", () => {
  it("shows the Arabic Limited Beta notice, text-only scope, safety warning, and policy links", () => {
    renderNotice();

    expect(screen.getByRole("heading", { name: "نسخة تجريبية محدودة" })).toBeTruthy();
    expect(
      screen.getByText("تحليل النص متاح حاليًا. ملفات PDF والصور والروابط غير مدعومة بعد.")
    ).toBeTruthy();
    expect(
      screen.getByText(
        "سافر بوعي يساعدك على مراجعة المعلومات المذكورة في العرض، لكنه لا يتحقق من هوية البائع ولا يضمن صحة العرض. لا تُدخل بيانات شخصية أو معلومات دفع."
      )
    ).toBeTruthy();
    expect(screen.getByText(CLOSED_BETA_VERSION)).toBeTruthy();
    expect(screen.getByRole("link", { name: "سياسة الخصوصية" }).getAttribute("href")).toBe(
      "/privacy"
    );
    expect(screen.getByRole("link", { name: "الشروط والأحكام" }).getAttribute("href")).toBe(
      "/terms"
    );
  });

  it("shows the English Limited Beta notice and safety warning", async () => {
    window.localStorage.setItem("safer-bewae-locale", "en");
    renderNotice();

    expect(await screen.findByRole("heading", { name: "Limited Beta" })).toBeTruthy();
    expect(
      screen.getByText(
        "Text analysis is currently available. PDF files, images, and links are not supported yet."
      )
    ).toBeTruthy();
    expect(
      screen.getByText(
        "SafrBwai helps you review the information stated in an offer. It does not verify the seller or guarantee the offer’s accuracy. Do not enter personal or payment information."
      )
    ).toBeTruthy();
  });

  it("reads the displayed beta version from the single beta version constant", () => {
    renderNotice();
    expect(CLOSED_BETA_VERSION).toBe("Beta 0.1");
    expect(screen.getByText(CLOSED_BETA_VERSION)).toBeTruthy();
  });
});
