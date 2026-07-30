import {
  ARABIC_REGRESSION_FIXTURES,
  ENGLISH_REGRESSION_FIXTURES,
} from "./fixtures";
import type { RegressionFixture } from "./types";

const FIXTURES: readonly RegressionFixture[] = Object.freeze([
  ...ARABIC_REGRESSION_FIXTURES,
  ...ENGLISH_REGRESSION_FIXTURES,
]);

/**
 * Expectations in these fixtures are intentionally not weakened. Each listed
 * expectation is exercised by an expected-failure test until a separate engine
 * PR resolves the documented gap.
 */
export const KNOWN_REGRESSION_GAPS = Object.freeze({
  "ar-conflicting-nights": ["mustDetectContradictions"],
} as const);

export function loadRegressionFixtures(): readonly RegressionFixture[] {
  return FIXTURES;
}
