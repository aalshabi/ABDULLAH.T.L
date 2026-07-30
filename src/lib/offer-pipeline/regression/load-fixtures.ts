import {
  ARABIC_REGRESSION_FIXTURES,
  ENGLISH_REGRESSION_FIXTURES,
} from "./fixtures";
import type { RegressionFixture } from "./types";

const FIXTURES: readonly RegressionFixture[] = Object.freeze([
  ...ARABIC_REGRESSION_FIXTURES,
  ...ENGLISH_REGRESSION_FIXTURES,
]);

type RegressionExpectationName = keyof RegressionFixture["expectations"];

/**
 * Expectations in these fixtures are intentionally not weakened. Any future
 * entry must name an existing fixture expectation and is exercised by an
 * expected-failure test until a separate engine PR resolves the gap.
 */
export const KNOWN_REGRESSION_GAPS: Readonly<
  Record<string, readonly RegressionExpectationName[]>
> = Object.freeze({});

export function loadRegressionFixtures(): readonly RegressionFixture[] {
  return FIXTURES;
}
