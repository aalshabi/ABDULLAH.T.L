import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/lib/i18n/provider";
import { TravelOfferInputSelector } from "./travel-offer-input-selector";

afterEach(cleanup);

describe("TravelOfferInputSelector closed beta sources", () => {
  it("keeps text enabled and PDF, image, and link disabled", () => {
    const onSelect = vi.fn();
    render(
      <LanguageProvider>
        <TravelOfferInputSelector method="text" onSelect={onSelect} />
      </LanguageProvider>
    );

    expect(screen.getByRole("tab", { name: "نص" }).hasAttribute("disabled")).toBe(false);

    for (const name of [/ملف PDF/, /صورة/, /رابط/]) {
      const tab = screen.getByRole("tab", { name });
      expect(tab.hasAttribute("disabled")).toBe(true);
      expect(tab.getAttribute("aria-disabled")).toBe("true");
      fireEvent.click(tab);
    }

    expect(screen.getAllByText("قريبًا")).toHaveLength(3);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
