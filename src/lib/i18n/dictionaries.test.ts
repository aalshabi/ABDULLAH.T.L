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

  it("exposes beta feedback messages and reasons in both languages", () => {
    const ar = getDictionary("ar").analyzeOffer.v2.feedback;
    const en = getDictionary("en").analyzeOffer.v2.feedback;

    expect(ar.question).toBe("هل كانت النتيجة مفيدة؟");
    expect(ar.thanks).toBe("شكرًا، تم تسجيل ملاحظتك.");
    expect(ar.reasons.other).toBe("سبب آخر");
    expect(en.question).toBe("Was this result helpful?");
    expect(en.thanks).toBe("Thank you. Your feedback was recorded.");
    expect(en.reasons.other).toBe("Another reason");
  });

  it("keeps result-copy translations aligned in Arabic and English", () => {
    const ar = getDictionary("ar").analyzeOffer.v2.result.copy;
    const en = getDictionary("en").analyzeOffer.v2.result.copy;

    expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort());
    expect(ar.questionsButton).toBe("نسخ الأسئلة");
    expect(ar.summaryButton).toBe("نسخ الملخص");
    expect(en.questionsButton).toBe("Copy questions");
    expect(en.summaryButton).toBe("Copy summary");
  });
});
