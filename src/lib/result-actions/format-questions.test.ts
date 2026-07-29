import { describe, expect, it } from "vitest";
import type { SuggestedQuestion } from "@/lib/offer-pipeline/analysis/types";
import {
  formatQuestionsForCopy,
  MAX_COPIED_QUESTIONS,
  SAFRBWAI_URL,
} from "./format-questions";

const questions = Array.from({ length: 7 }, (_, index) => ({
  key: `question-${index + 1}`,
  question: {
    ar: `السؤال ${index + 1}`,
    en: `Question ${index + 1}`,
  },
  priority: index === 0 ? "high" : "medium",
  evidence: `INTERNAL_EVIDENCE_${index + 1}`,
})) as Array<SuggestedQuestion & { evidence: string }>;

describe("formatQuestionsForCopy", () => {
  it("formats the Arabic title, numbering, order and canonical link", () => {
    const text = formatQuestionsForCopy(questions, "ar", {
      title: "أسئلة مقترحة قبل الحجز",
      reviewedWith: "تمت المراجعة عبر سافر بوعي",
    });

    expect(text).toContain("أسئلة مقترحة قبل الحجز:\n\n1. السؤال 1");
    expect(text.indexOf("السؤال 1")).toBeLessThan(text.indexOf("السؤال 2"));
    expect(text).toContain(`تمت المراجعة عبر سافر بوعي:\n${SAFRBWAI_URL}`);
  });

  it("formats the English title, numbering, order and canonical link", () => {
    const text = formatQuestionsForCopy(questions, "en", {
      title: "Suggested questions before booking",
      reviewedWith: "Reviewed with SafrBwai",
    });

    expect(text).toContain(
      "Suggested questions before booking:\n\n1. Question 1"
    );
    expect(text.indexOf("Question 1")).toBeLessThan(
      text.indexOf("Question 2")
    );
    expect(text).toContain(`Reviewed with SafrBwai:\n${SAFRBWAI_URL}`);
  });

  it("copies no more than five current questions", () => {
    const text = formatQuestionsForCopy(questions, "en", {
      title: "Suggested questions before booking",
      reviewedWith: "Reviewed with SafrBwai",
    });

    expect(MAX_COPIED_QUESTIONS).toBe(5);
    expect(text).toContain("5. Question 5");
    expect(text).not.toContain("Question 6");
    expect(text).not.toContain("Question 7");
  });

  it("does not copy priority, evidence or other metadata", () => {
    const text = formatQuestionsForCopy(questions, "en", {
      title: "Suggested questions before booking",
      reviewedWith: "Reviewed with SafrBwai",
    });

    expect(text).not.toContain("high");
    expect(text).not.toContain("medium");
    expect(text).not.toContain("INTERNAL_EVIDENCE");
    expect(text).not.toContain("priority");
  });

  it("returns an empty string when there are no questions", () => {
    expect(
      formatQuestionsForCopy([], "ar", {
        title: "أسئلة مقترحة قبل الحجز",
        reviewedWith: "تمت المراجعة عبر سافر بوعي",
      })
    ).toBe("");
  });
});
