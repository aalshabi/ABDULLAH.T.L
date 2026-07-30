import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { getDictionary } from "./dictionaries";

function dictionaryKeyPaths(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return [path, ...dictionaryKeyPaths(child, path)];
  });
}

describe("demo dictionary", () => {
  it("uses the approved product name in both languages", () => {
    expect(getDictionary("ar").brand.name).toBe("سافر بوعي");
    expect(getDictionary("en").brand.name).toBe("SafrBwai");
  });

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

  it("keeps every Arabic and English dictionary key aligned", () => {
    const arKeys = dictionaryKeyPaths(getDictionary("ar")).sort();
    const enKeys = dictionaryKeyPaths(getDictionary("en")).sort();

    expect(arKeys).toEqual(enKeys);
  });

  it("contains no unapproved English name on user-visible brand surfaces", () => {
    const unapprovedName = ["Safer", "Bewae"].join(" ");
    const visibleSources = [
      "README.md",
      "src/app/layout.tsx",
      "src/app/manifest.ts",
      "src/app/page.tsx",
      "src/components/legal-page.tsx",
      "src/lib/i18n/dictionaries.ts",
      "src/lib/seo.ts",
    ];

    expect(JSON.stringify(getDictionary("en"))).not.toContain(unapprovedName);
    for (const path of visibleSources) {
      expect(readFileSync(join(process.cwd(), path), "utf8")).not.toContain(unapprovedName);
    }
  });

  it("exposes the closed beta scope and safety copy in both languages", () => {
    const ar = getDictionary("ar").analyzeOffer.v2.closedBeta;
    const en = getDictionary("en").analyzeOffer.v2.closedBeta;

    expect(ar.title).toBe("نسخة تجريبية محدودة");
    expect(ar.supportedSources).toBe(
      "تحليل النص متاح حاليًا. ملفات PDF والصور والروابط غير مدعومة بعد."
    );
    expect(en.title).toBe("Limited Beta");
    expect(en.supportedSources).toBe(
      "Text analysis is currently available. PDF files, images, and links are not supported yet."
    );
  });
});
