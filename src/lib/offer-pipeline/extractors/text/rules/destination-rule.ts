/**
 * DestinationRule — a TWO-TIER extractor.
 *
 *  Tier 1 — curated dictionary (`data/destinations.ts`): an alias match yields a
 *           standard name + ISO country code (`matchType: "canonical_alias"`).
 *           Adding a destination is a DATA edit; this file never changes.
 *
 *  Tier 2 — explicit-mention fallback: when nothing matches the dictionary, a
 *           destination is taken ONLY from an explicit travel marker
 *           ("إلى …", "الوجهة: …", "trip to …"). The wording is reported
 *           verbatim with `matchType: "explicit_mention"` and NO invented
 *           standard name or country.
 *
 * Free-text place guessing is never attempted: without a marker nothing is
 * extracted, so an unlisted destination is surfaced honestly rather than
 * fabricated or silently lost.
 */

import type { OfferDestination } from "@/lib/offer-pipeline/types";
import type { ExtractionRule, RuleResult } from "../rule";
import { exact } from "../utils";
import { DESTINATIONS } from "@/lib/offer-pipeline/data/destinations";

/** Explicit "this is the destination" markers. */
const MARKERS: RegExp[] = [
  /(?:الوجهة|وجهة)\s*[:：]\s*/g,
  /(?:السفر|الرحلة|رحلة|عرض|باقة|برنامج)?\s*إلى\s+/g,
  /\bdestination\s*[:：]\s*/gi,
  /\b(?:trip|travel|journey|flight)\s+to\s+/gi,
  /\bto\s+/gi,
];

/**
 * Words that end a destination phrase. They start the NEXT clause of an offer
 * ("… إلى دبي لمدة ٥ ليالٍ"), so capture must stop before them.
 */
const STOP_WORDS = [
  "لمدة", "مدة", "لشخصين", "لشخص", "لفردين", "يشمل", "تشمل", "شامل", "شاملة", "السعر", "بسعر",
  "سعر", "من", "في", "مع", "ليالٍ", "ليالي", "ليلة", "أيام", "يوم", "بالطيران", "طيران",
  "فندق", "إقامة", "للشخص", "ابتداءً", "تبدأ", "خلال",
  "for", "from", "includes", "including", "price", "nights", "night", "days", "with", "at",
  "starting", "per", "hotel", "stay", "on",
];

/** Phrases where a following "إلى/to" is NOT introducing a destination. */
const MARKER_BLOCKLIST = ["بالإضافة", "إضافة", "اضافة", "تصل", "يصل", "up", "close", "next"];

const MAX_WORDS = 4;
const MAX_CHARS = 40;

function findCanonical(text: string): { entry: (typeof DESTINATIONS)[number]; index: number; length: number } | null {
  const haystack = text.toLowerCase();
  let best: { entry: (typeof DESTINATIONS)[number]; index: number; length: number } | null = null;

  for (const entry of DESTINATIONS) {
    for (const alias of entry.aliases) {
      const index = haystack.indexOf(alias.toLowerCase());
      if (index === -1) continue;
      // Longest alias wins so "أبو ظبي" is not shadowed by a shorter entry.
      if (!best || alias.length > best.length) best = { entry, index, length: alias.length };
    }
  }
  return best;
}

/** Trim a captured tail down to a short, plausible destination phrase. */
function trimToDestination(tail: string): string {
  // Stop at the first clause boundary.
  const clause = tail.split(/[،,.\n\r؛;:()]/)[0] ?? "";

  const words: string[] = [];
  for (const word of clause.trim().split(/\s+/)) {
    const bare = word.replace(/[^\p{L}\p{N}\-']/gu, "");
    if (!bare) break;
    if (STOP_WORDS.includes(bare.toLowerCase())) break;
    // A number starts the "5 nights" clause — never part of a destination.
    if (/^\d+$/.test(bare)) break;
    words.push(bare);
    if (words.length >= MAX_WORDS) break;
  }

  return words.join(" ").slice(0, MAX_CHARS).trim();
}

function findExplicit(text: string): { value: string; evidence: string } | null {
  for (const marker of MARKERS) {
    marker.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = marker.exec(text)) !== null) {
      const before = text.slice(Math.max(0, m.index - 12), m.index).toLowerCase();
      if (MARKER_BLOCKLIST.some((b) => before.includes(b.toLowerCase()))) continue;

      const tail = text.slice(m.index + m[0].length);
      const value = trimToDestination(tail);
      if (!value) continue;

      // Evidence covers the marker plus the captured destination.
      return { value, evidence: text.slice(m.index, m.index + m[0].length + value.length).trim() };
    }
  }
  return null;
}

export const destinationRule: ExtractionRule = {
  key: "destination",
  apply(text: string): RuleResult {
    // Tier 1 — curated dictionary.
    const known = findCanonical(text);
    if (known) {
      const evidence = text.slice(known.index, known.index + known.length);
      const value: OfferDestination = {
        value: evidence,
        canonicalValue: known.entry.canonical,
        countryCode: known.entry.countryCode,
        matchType: "canonical_alias",
      };
      return { facts: { destination: exact(value, evidence) }, warnings: [] };
    }

    // Tier 2 — explicit mention only.
    const explicit = findExplicit(text);
    if (explicit) {
      const value: OfferDestination = { value: explicit.value, matchType: "explicit_mention" };
      return {
        facts: { destination: exact(value, explicit.evidence) },
        warnings: [
          {
            ar: `الوجهة «${explicit.value}» مذكورة صراحةً لكنها غير مرتبطة باسم جغرافي قياسي.`,
            en: `Destination "${explicit.value}" is explicitly stated but not matched to a standard geographic name.`,
          },
        ],
      };
    }

    return { facts: {}, warnings: [] };
  },
};
