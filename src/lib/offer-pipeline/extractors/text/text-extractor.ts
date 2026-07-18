/**
 * TextExtractor — a pure ORCHESTRATOR. It holds no extraction logic of its own:
 * it runs each independent rule from the RuleRegistry over the raw text and
 * merges their outputs into one `ExtractedOfferFacts` (+ collected warnings).
 * Adding a new source of facts later means adding a rule to the registry, not
 * changing this file.
 *
 * This module performs NO network, disk, OCR, PDF parsing, or persistence.
 */

import type { Bi, ExtractedOfferFacts, ExtractionResult, RawOfferSource } from "@/lib/offer-pipeline/types";
import type { OfferExtractor } from "../types";
import { createDefaultRuleRegistry, RuleRegistry } from "./rule-registry";

/**
 * Run the rule engine over already-validated offer text. Exposed separately so
 * each layer is testable in isolation. Merging is order-independent: every rule
 * owns a distinct fact key.
 */
export function extractFactsFromText(
  text: string,
  registry: RuleRegistry = createDefaultRuleRegistry()
): { facts: ExtractedOfferFacts; warnings: Bi[] } {
  const facts: ExtractedOfferFacts = {};
  const warnings: Bi[] = [];

  for (const rule of registry.list()) {
    const result = rule.apply(text);
    Object.assign(facts, result.facts);
    warnings.push(...result.warnings);
  }

  return { facts, warnings };
}

/**
 * The text `OfferExtractor`. Returns `empty` for blank text and `unsupported`
 * for a non-text source; otherwise a successful (possibly sparse) extraction.
 *
 * NOTE: this extractor is intentionally NOT yet wired into the source-level
 * registry — that integration (and flipping the source capability) belongs to a
 * later task alongside the pipeline/route. Here it is a fully tested unit.
 */
export function createTextExtractor(registry: RuleRegistry = createDefaultRuleRegistry()) {
  return {
    type: "text",
    enabled: true,
    extract(source: RawOfferSource): ExtractionResult {
      if (source.type !== "text") return { ok: false, reason: "unsupported" };
      if (source.text.trim().length === 0) return { ok: false, reason: "empty" };

      const { facts, warnings } = extractFactsFromText(source.text, registry);
      return { ok: true, facts, warnings };
    },
  } satisfies OfferExtractor;
}
