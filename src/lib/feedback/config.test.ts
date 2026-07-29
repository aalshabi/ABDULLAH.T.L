import { describe, expect, it } from "vitest";
import {
  isPublicBetaFeedbackEnabled,
  isServerBetaFeedbackEnabled,
} from "./config";

describe("beta feedback feature flags", () => {
  it("enables the public UI only for the literal value true", () => {
    expect(isPublicBetaFeedbackEnabled("true")).toBe(true);
    expect(isPublicBetaFeedbackEnabled("TRUE")).toBe(false);
    expect(isPublicBetaFeedbackEnabled("1")).toBe(false);
    expect(isPublicBetaFeedbackEnabled("false")).toBe(false);
    expect(isPublicBetaFeedbackEnabled(undefined)).toBe(false);
  });

  it("enables the server only for the literal value true", () => {
    expect(isServerBetaFeedbackEnabled("true")).toBe(true);
    expect(isServerBetaFeedbackEnabled("TRUE")).toBe(false);
    expect(isServerBetaFeedbackEnabled("1")).toBe(false);
    expect(isServerBetaFeedbackEnabled("false")).toBe(false);
    expect(isServerBetaFeedbackEnabled(undefined)).toBe(false);
  });
});
