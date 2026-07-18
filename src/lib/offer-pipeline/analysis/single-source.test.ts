import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function src(p: string): string {
  return readFileSync(join(process.cwd(), p), "utf8");
}

/**
 * Guardrail: OfferAnalysis (and its parts) must have exactly ONE canonical
 * definition, in analysis/types.ts. The shared offer-pipeline/types.ts must not
 * redeclare it, and must not import back from analysis/ (which would create a
 * circular dependency).
 */
describe("OfferAnalysis has a single canonical source", () => {
  const analysisTypes = src("src/lib/offer-pipeline/analysis/types.ts");
  const pipelineTypes = src("src/lib/offer-pipeline/types.ts");

  it("is declared in analysis/types.ts", () => {
    expect(analysisTypes).toMatch(/export\s+interface\s+OfferAnalysis\b/);
  });

  it("is NOT declared anywhere in offer-pipeline/types.ts", () => {
    expect(pipelineTypes).not.toMatch(/(?:interface|type)\s+OfferAnalysis\b/);
    // the retired placeholder sub-types are gone too
    expect(pipelineTypes).not.toMatch(/(?:interface|type)\s+CompletenessItem\b/);
    expect(pipelineTypes).not.toMatch(/(?:interface|type)\s+OfferCompleteness\b/);
    expect(pipelineTypes).not.toMatch(/(?:interface|type)\s+Contradiction\b/);
    expect(pipelineTypes).not.toMatch(/(?:interface|type)\s+OfferPipelineResult\b/);
  });

  it("offer-pipeline/types.ts does not import from analysis/ (no cycle)", () => {
    expect(pipelineTypes).not.toMatch(/from\s+["'][^"']*analysis[^"']*["']/);
  });
});
