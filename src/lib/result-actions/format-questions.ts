import type { Locale } from "@/lib/i18n/config";
import type { SuggestedQuestion } from "@/lib/offer-pipeline/analysis/types";
import { localizeBi } from "./format-result-value";

export const SAFRBWAI_URL = "https://www.safrbwai.com";
export const MAX_COPIED_QUESTIONS = 5;

export interface QuestionCopyLabels {
  title: string;
  reviewedWith: string;
}

export function getCopyableQuestions(
  questions: readonly SuggestedQuestion[],
  locale: Locale
): string[] {
  return questions
    .slice(0, MAX_COPIED_QUESTIONS)
    .map((question) => localizeBi(question.question, locale))
    .filter((question) => question.length > 0);
}

export function formatQuestionsForCopy(
  questions: readonly SuggestedQuestion[],
  locale: Locale,
  labels: QuestionCopyLabels
): string {
  const copyableQuestions = getCopyableQuestions(questions, locale);
  if (copyableQuestions.length === 0) return "";

  const numberedQuestions = copyableQuestions.map(
    (question, index) => `${index + 1}. ${question}`
  );

  return [
    `${labels.title}:`,
    "",
    ...numberedQuestions,
    "",
    `${labels.reviewedWith}:`,
    SAFRBWAI_URL,
  ].join("\n");
}
