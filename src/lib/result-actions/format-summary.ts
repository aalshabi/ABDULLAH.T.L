import type { Locale } from "@/lib/i18n/config";
import type { OfferAnalysis } from "@/lib/offer-pipeline/analysis/types";
import {
  formatResultValue,
  localizeBi,
  type ResultValueLabels,
} from "./format-result-value";
import {
  getCopyableQuestions,
  SAFRBWAI_URL,
} from "./format-questions";

export interface SummaryCopyLabels {
  title: string;
  confirmedTitle: string;
  missingTitle: string;
  contradictionsTitle: string;
  questionsTitle: string;
  disclaimer: string;
  brandLabel: string;
  value: ResultValueLabels;
}

function bulletedSection(title: string, lines: string[]): string | null {
  if (lines.length === 0) return null;
  return `${title}:\n${lines.map((line) => `- ${line}`).join("\n")}`;
}

export function formatSummaryForCopy(
  analysis: OfferAnalysis,
  locale: Locale,
  labels: SummaryCopyLabels
): string {
  const sections: string[] = [labels.title];

  const confirmedFacts = analysis.confirmedFacts
    .map((fact) => {
      const value = formatResultValue(fact.value, locale, labels.value);
      if (!value) return null;
      return `${localizeBi(fact.label, locale)}: ${value}`;
    })
    .filter((line): line is string => line !== null);
  const confirmedSection = bulletedSection(
    labels.confirmedTitle,
    confirmedFacts
  );
  if (confirmedSection) sections.push(confirmedSection);

  const missingFields = analysis.missingFields.map((field) =>
    localizeBi(field.label, locale)
  );
  const missingSection = bulletedSection(labels.missingTitle, missingFields);
  if (missingSection) sections.push(missingSection);

  const contradictions = analysis.contradictions.map((contradiction) =>
    localizeBi(contradiction.message, locale)
  );
  const contradictionsSection = bulletedSection(
    labels.contradictionsTitle,
    contradictions
  );
  if (contradictionsSection) sections.push(contradictionsSection);

  const questions = getCopyableQuestions(
    analysis.suggestedQuestions,
    locale
  );
  if (questions.length > 0) {
    sections.push(
      `${labels.questionsTitle}:\n${questions
        .map((question, index) => `${index + 1}. ${question}`)
        .join("\n")}`
    );
  }

  sections.push(labels.disclaimer);
  sections.push(`${labels.brandLabel}:\n${SAFRBWAI_URL}`);

  return sections.join("\n\n");
}
