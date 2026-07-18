import { describe, it, expect } from "vitest";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { DEMO_ROBOTS } from "@/lib/seo";

const ar = getDictionary("ar");
const en = getDictionary("en");

// Text that appears on the home page (hero, benefits, how, cta, footer tagline).
const homeText = [
  ar.hero,
  ar.benefits,
  ar.how,
  ar.cta,
  ar.footer.tagline,
  en.hero,
  en.benefits,
  en.how,
  en.cta,
  en.footer.tagline,
]
  .map((v) => JSON.stringify(v))
  .join(" ");

describe("home page integrity", () => {
  // (1) no fabricated stat numbers
  it("contains none of the fabricated stats (96%, 250k, 12k, 40k)", () => {
    for (const token of ["96%", "٩٦", "250k", "٢٥٠", "12k", "١٢ ألف", "40k", "٤٠ ألف"]) {
      expect(homeText).not.toContain(token);
    }
  });

  it("qualitative benefits contain no digits at all", () => {
    const benefits = [
      ar.benefits.clearer,
      ar.benefits.gaps,
      ar.benefits.compare,
      ar.benefits.questions,
      en.benefits.clearer,
      en.benefits.gaps,
      en.benefits.compare,
      en.benefits.questions,
    ].join(" ");
    expect(benefits).not.toMatch(/[0-9٠-٩]/);
  });

  // (2) no "multiple sources / sourced analysis" claim
  it("makes no multiple-sources / sourced-analysis claim", () => {
    expect(homeText).not.toContain("مصادر متعددة");
    expect(homeText.toLowerCase()).not.toContain("sourced analysis");
    expect(homeText.toLowerCase()).not.toContain("multiple signals");
  });

  it("does not claim to be AI-powered", () => {
    expect(homeText).not.toContain("ذكاء اصطناعي");
    expect(homeText.toLowerCase()).not.toMatch(/\bai\b/);
    expect(homeText).not.toContain("دقة");
  });

  // (8) metadata prevents archiving
  it("keeps the demo out of search indexes", () => {
    expect(DEMO_ROBOTS.index).toBe(false);
    expect(DEMO_ROBOTS.follow).toBe(false);
  });
});
