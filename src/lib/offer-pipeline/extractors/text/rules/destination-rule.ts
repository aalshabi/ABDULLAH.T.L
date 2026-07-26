/**
 * DestinationRule — matches the destination against a CURATED list of known
 * cities/countries only.
 *
 * Free-text place extraction is deliberately not attempted: guessing a proper
 * noun out of an offer is exactly the kind of "confident but wrong" behaviour
 * this pipeline refuses. An unlisted destination is simply left absent, and the
 * analysis asks about it instead.
 */

import type { ExtractionRule, RuleResult } from "../rule";
import { exact } from "../utils";

/** Canonical destination → the surface forms that unambiguously denote it. */
const DESTINATIONS: { canonical: string; forms: string[] }[] = [
  { canonical: "دبي", forms: ["دبي", "dubai"] },
  { canonical: "أبوظبي", forms: ["أبوظبي", "ابوظبي", "أبو ظبي", "abu dhabi"] },
  { canonical: "الرياض", forms: ["الرياض", "riyadh"] },
  { canonical: "جدة", forms: ["جدة", "jeddah"] },
  { canonical: "مكة", forms: ["مكة", "makkah", "mecca"] },
  { canonical: "المدينة المنورة", forms: ["المدينة المنورة", "madinah", "medina"] },
  { canonical: "إسطنبول", forms: ["إسطنبول", "اسطنبول", "استانبول", "istanbul"] },
  { canonical: "طرابزون", forms: ["طرابزون", "trabzon"] },
  { canonical: "أنطاليا", forms: ["أنطاليا", "انطاليا", "antalya"] },
  { canonical: "القاهرة", forms: ["القاهرة", "cairo"] },
  { canonical: "شرم الشيخ", forms: ["شرم الشيخ", "sharm el sheikh", "sharm"] },
  { canonical: "المالديف", forms: ["المالديف", "مالديف", "maldives"] },
  { canonical: "موريشيوس", forms: ["موريشيوس", "mauritius"] },
  { canonical: "بالي", forms: ["بالي", "bali"] },
  { canonical: "جاكرتا", forms: ["جاكرتا", "jakarta"] },
  { canonical: "كوالالمبور", forms: ["كوالالمبور", "kuala lumpur"] },
  { canonical: "بانكوك", forms: ["بانكوك", "bangkok"] },
  { canonical: "بوكيت", forms: ["بوكيت", "phuket"] },
  { canonical: "تبليسي", forms: ["تبليسي", "تبليسى", "tbilisi"] },
  { canonical: "باتومي", forms: ["باتومي", "batumi"] },
  { canonical: "باكو", forms: ["باكو", "baku"] },
  { canonical: "لندن", forms: ["لندن", "london"] },
  { canonical: "باريس", forms: ["باريس", "paris"] },
  { canonical: "روما", forms: ["روما", "rome"] },
  { canonical: "برشلونة", forms: ["برشلونة", "barcelona"] },
  { canonical: "مدريد", forms: ["مدريد", "madrid"] },
  { canonical: "جنيف", forms: ["جنيف", "geneva"] },
  { canonical: "زيورخ", forms: ["زيورخ", "zurich"] },
  { canonical: "فيينا", forms: ["فيينا", "vienna"] },
  { canonical: "أمستردام", forms: ["أمستردام", "امستردام", "amsterdam"] },
  { canonical: "ميونخ", forms: ["ميونخ", "munich"] },
  { canonical: "سنغافورة", forms: ["سنغافورة", "singapore"] },
  { canonical: "طوكيو", forms: ["طوكيو", "tokyo"] },
  { canonical: "سيول", forms: ["سيول", "seoul"] },
  { canonical: "كيرالا", forms: ["كيرالا", "kerala"] },
  { canonical: "مومباي", forms: ["مومباي", "mumbai"] },
  { canonical: "نيويورك", forms: ["نيويورك", "new york"] },
  { canonical: "لوس أنجلوس", forms: ["لوس أنجلوس", "لوس انجلوس", "los angeles"] },
  { canonical: "موسكو", forms: ["موسكو", "moscow"] },
  { canonical: "شيشان", forms: ["شيشان", "الشيشان", "grozny"] },
  { canonical: "سراييفو", forms: ["سراييفو", "sarajevo"] },
  { canonical: "تيرانا", forms: ["تيرانا", "tirana"] },
  { canonical: "سيلان", forms: ["سيلان", "سريلانكا", "sri lanka", "colombo"] },
  { canonical: "زنجبار", forms: ["زنجبار", "zanzibar"] },
  { canonical: "سيشل", forms: ["سيشل", "seychelles"] },
];

export const destinationRule: ExtractionRule = {
  key: "destination",
  apply(text: string): RuleResult {
    const haystack = text.toLowerCase();

    // Longest form first so "أبو ظبي" is not shadowed by a shorter entry.
    let best: { canonical: string; index: number; length: number } | null = null;
    for (const entry of DESTINATIONS) {
      for (const form of entry.forms) {
        const index = haystack.indexOf(form.toLowerCase());
        if (index === -1) continue;
        if (!best || form.length > best.length) {
          best = { canonical: entry.canonical, index, length: form.length };
        }
      }
    }

    if (!best) return { facts: {}, warnings: [] };

    const evidence = text.slice(best.index, best.index + best.length);
    return { facts: { destination: exact(best.canonical, evidence) }, warnings: [] };
  },
};
