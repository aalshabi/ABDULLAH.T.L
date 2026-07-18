/**
 * Build suggested questions ONLY from missing or conflicting items. A field that
 * is present and not conflicting never produces a question. Order follows the
 * field registry; each question appears once.
 */

import type { ChecklistItem, MissingField, SuggestedQuestion } from "./types";
import { FIELDS } from "./required-fields";

export function buildSuggestedQuestions(
  missingFields: MissingField[],
  checklist: ChecklistItem[]
): SuggestedQuestion[] {
  const keys = new Set<string>();
  for (const m of missingFields) keys.add(m.key);
  for (const item of checklist) if (item.status === "conflicting") keys.add(item.key);

  const out: SuggestedQuestion[] = [];
  for (const field of FIELDS) {
    if (keys.has(field.key)) out.push({ key: field.key, question: field.question });
  }
  return out;
}
