import { describe, it, expect } from "vitest";
import { getDictionary } from "./dictionaries";

describe("demo dictionary", () => {
  it("exposes the exact demo badge in both languages", () => {
    expect(getDictionary("ar").demo.badge).toContain("نسخة تجريبية");
    expect(getDictionary("en").demo.badge).toContain("Demo version");
  });

  it("exposes the offer 'extraction not enabled' message", () => {
    expect(getDictionary("ar").demo.offerTitle).toContain("غير مفعّل");
    expect(getDictionary("en").demo.offerBody).toMatch(/does not|OCR/i);
  });

  it("exposes the neutral 'not available in demo' replacement text", () => {
    expect(getDictionary("ar").demo.unavailable).toContain("غير متاح");
    expect(getDictionary("en").demo.unavailable).toContain("Not available");
  });
});
