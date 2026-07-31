import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/lib/i18n/provider";
import { CTA } from "./cta";

vi.mock("@/components/shared/reveal", () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => children,
}));

function renderCta() {
  return render(
    <LanguageProvider>
      <CTA />
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

describe("closed Beta CTA", () => {
  it("sends the Arabic CTA to text offer analysis without an account claim", () => {
    renderCta();

    const link = screen.getByRole("link", { name: "حلّل عرض سفر" });
    expect(link.getAttribute("href")).toBe("/analyze-offer");
    expect(screen.queryByText("حلّل عرضًا نصيًا")).toBeNull();
    expect(screen.queryByText("أنشئ حسابك الآن")).toBeNull();
  });

  it("sends the English CTA to text offer analysis without an account claim", async () => {
    window.localStorage.setItem("safer-bewae-locale", "en");
    renderCta();

    const link = await screen.findByRole("link", { name: "Analyze a travel offer" });
    expect(link.getAttribute("href")).toBe("/analyze-offer");
    expect(screen.queryByText("Analyze a text offer")).toBeNull();
    expect(screen.queryByText("Create your account")).toBeNull();
  });
});
