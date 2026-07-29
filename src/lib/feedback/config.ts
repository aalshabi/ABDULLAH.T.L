export function isPublicBetaFeedbackEnabled(
  value = process.env.NEXT_PUBLIC_BETA_FEEDBACK_ENABLED
): boolean {
  return value === "true";
}

export function isServerBetaFeedbackEnabled(
  value = process.env.BETA_FEEDBACK_ENABLED
): boolean {
  return value === "true";
}
