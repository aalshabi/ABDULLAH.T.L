/**
 * Build the suggested clarifying questions before booking.
 *
 * Principles:
 *  - Booking-impact ordering: high → medium → low. The candidate list below is
 *    authored in priority order (final price/fees → transfers → room → meals →
 *    baggage → cancellation → excluded services → flight schedule → arrival fees).
 *  - Contextual, not generic: a question is emitted only when it is genuinely
 *    relevant to THIS offer (derived from facts + the original text), never for a
 *    field that is already present and consistent (no duplicate for confirmed info).
 *  - Conflicting fields always produce a specific resolution question (high).
 *  - Visa and insurance are NEVER shown by default — only when the offer text
 *    explicitly raises them.
 *  - Hard cap of 5 questions; no numeric score anywhere.
 */

import type { ChecklistItem, MissingField, QuestionPriority, SuggestedQuestion } from "./types";
import type { Bi } from "@/lib/offer-pipeline/types";
import { FIELDS } from "./required-fields";
import type { QuestionContext } from "./question-context";

const MAX_QUESTIONS = 5;
const PRIORITY_WEIGHT: Record<QuestionPriority, number> = { high: 0, medium: 1, low: 2 };

interface Candidate {
  key: string;
  priority: QuestionPriority;
  question: Bi;
  /** Whether this question applies to the current offer. */
  when: boolean;
}

export function buildSuggestedQuestions(
  missingFields: MissingField[],
  checklist: ChecklistItem[],
  context: QuestionContext
): SuggestedQuestion[] {
  const missing = new Set(missingFields.map((m) => m.key));
  const conflicting = new Set(checklist.filter((c) => c.status === "conflicting").map((c) => c.key));
  const registryQuestion = (key: string): Bi =>
    FIELDS.find((f) => f.key === key)?.question ?? { ar: "", en: "" };

  const candidates: Candidate[] = [];

  // (A) Conflicts first — a contradiction is the most urgent thing to resolve.
  for (const field of FIELDS) {
    if (conflicting.has(field.key)) {
      candidates.push({ key: field.key, priority: "high", question: registryQuestion(field.key), when: true });
    }
  }

  // (B) Contextual / missing candidates, authored in booking-impact order.

  // 1) Final price + taxes + fees.
  candidates.push({ key: "totalPrice", priority: "high", when: missing.has("totalPrice"), question: registryQuestion("totalPrice") });
  candidates.push({ key: "currency", priority: "high", when: missing.has("currency"), question: registryQuestion("currency") });
  candidates.push({
    key: "taxes",
    priority: "high",
    when: missing.has("taxes"),
    question: { ar: "هل السعر النهائي يشمل جميع الضرائب والرسوم؟", en: "Does the final price include all taxes and fees?" },
  });

  // 2) Airport transfers — a flight+hotel bundle with no transport mentioned.
  candidates.push({
    key: "transfers",
    priority: "high",
    when: !context.transferConfirmed && !context.transportMentionedInText,
    question: { ar: "هل الاستقبال والتوصيل من وإلى المطار مشمولان في السعر؟", en: "Are airport pickup and drop-off included in the price?" },
  });

  // 3) Private vs shared transfer — transport is mentioned but its type is unclear.
  candidates.push({
    key: "transfers",
    priority: "high",
    when: !context.transferConfirmed && context.transportMentionedInText && !context.transportTypeKnown,
    question: { ar: "هل المواصلات خاصة أم مشتركة؟", en: "Is the transport private or shared?" },
  });

  // Inter-city transfers when the offer spans multiple cities/hotels.
  candidates.push({
    key: "interCityTransfers",
    priority: "high",
    when: context.multiCityOrHotel,
    question: { ar: "هل التنقلات بين المدن والفنادق مشمولة في السعر؟", en: "Are transfers between cities and hotels included in the price?" },
  });

  // 4) Room type / beds / occupancy.
  candidates.push({
    key: "roomType",
    priority: "high",
    when: context.hasAccommodation && !context.roomTypeMentioned,
    question: { ar: "ما نوع الغرفة وعدد الأسرّة المشمولة؟", en: "What is the room type and how many beds are included?" },
  });
  candidates.push({
    key: "childOccupancy",
    priority: "medium",
    when: context.hasChildren && !context.childBedsMentioned,
    question: { ar: "هل السعر يشمل أسرّة الأطفال أو السرير الإضافي؟", en: "Does the price include children's beds or an extra bed?" },
  });

  // 5) Meals included.
  candidates.push({ key: "board", priority: "medium", when: missing.has("board"), question: registryQuestion("board") });

  // 6) Baggage.
  candidates.push({ key: "baggage", priority: "medium", when: missing.has("baggage"), question: registryQuestion("baggage") });

  // 7) Cancellation policy.
  candidates.push({ key: "cancellationPolicy", priority: "medium", when: missing.has("cancellationPolicy"), question: registryQuestion("cancellationPolicy") });

  // Context-dependent: visa / insurance — ONLY when the offer text raises them.
  candidates.push({
    key: "visa",
    priority: "high",
    when: context.visaMentioned && (missing.has("visa") || conflicting.has("visa")),
    question: registryQuestion("visa"),
  });
  candidates.push({
    key: "insurance",
    priority: "high",
    when: context.insuranceMentioned && (missing.has("insurance") || conflicting.has("insurance")),
    question: registryQuestion("insurance"),
  });

  // 8) Excluded services (low) — worth asking whenever a bundle exists.
  candidates.push({
    key: "excludedServices",
    priority: "low",
    when: context.hasFlight || context.hasAccommodation,
    question: { ar: "ما الخدمات غير المشمولة في هذا العرض؟", en: "Which services are NOT included in this offer?" },
  });

  // 9) Flight times / stops (low) — a flight with no schedule stated.
  candidates.push({
    key: "flightTimes",
    priority: "low",
    when: context.hasFlight && !context.flightTimesKnown,
    question: { ar: "ما مواعيد الرحلات وعدد التوقفات؟", en: "What are the flight times and number of stops?" },
  });

  // 10) Fees paid on arrival (low).
  candidates.push({
    key: "arrivalFees",
    priority: "low",
    when: (context.hasFlight || context.hasAccommodation) && !context.arrivalFeesMentioned,
    question: { ar: "هل توجد رسوم تُدفع عند الوصول؟", en: "Are there any fees payable on arrival?" },
  });

  // Keep applicable candidates, drop duplicate keys (first authored wins), then a
  // STABLE priority sort (high → medium → low) preserving booking-impact order
  // within a tier, and finally cap at MAX_QUESTIONS.
  const seen = new Set<string>();
  const applicable = candidates.filter((c) => {
    if (!c.when || seen.has(c.key)) return false;
    seen.add(c.key);
    return true;
  });

  applicable.sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]);

  return applicable.slice(0, MAX_QUESTIONS).map(({ key, question, priority }) => ({ key, question, priority }));
}
