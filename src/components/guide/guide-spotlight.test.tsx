import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { GuideSpotlight } from "./guide-spotlight";

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({ matches: false })),
  });
});

afterEach(() => cleanup());

describe("guide spotlight", () => {
  it("scrolls a present target into view and cleans its marker", async () => {
    const onAvailabilityChange = vi.fn();
    const { unmount } = render(
      <>
        <button data-guide-id="offer-submit">Submit</button>
        <GuideSpotlight target="offer-submit" onAvailabilityChange={onAvailabilityChange} />
      </>
    );

    const target = document.querySelector<HTMLElement>('[data-guide-id="offer-submit"]')!;
    await waitFor(() => expect(target.dataset.guideActive).toBe("true"));
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    expect(onAvailabilityChange).toHaveBeenCalledWith(true);
    unmount();
    expect(target.dataset.guideActive).toBeUndefined();
  });

  it("reports a missing target without throwing", () => {
    const onAvailabilityChange = vi.fn();
    expect(() => render(<GuideSpotlight target="result-confirmed" onAvailabilityChange={onAvailabilityChange} />)).not.toThrow();
    expect(onAvailabilityChange).toHaveBeenCalledWith(false);
  });

  it("removes motion when the user prefers reduced motion", () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
    render(
      <>
        <div data-guide-id="offer-textarea" />
        <GuideSpotlight target="offer-textarea" onAvailabilityChange={() => undefined} />
      </>
    );
    expect(document.querySelector<HTMLElement>('[data-guide-id="offer-textarea"]')!.scrollIntoView)
      .toHaveBeenCalledWith({ behavior: "auto", block: "center" });
  });
});
