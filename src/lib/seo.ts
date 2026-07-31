/**
 * SEO constants for the experimental (demo) phase.
 *
 * The whole site is kept OUT of search indexes until a real commercial
 * launch — the demo generates illustrative UX and must not be archived or
 * presented publicly as a working, verified product.
 */
export const DEMO_ROBOTS = {
  index: false,
  follow: false,
} as const;

export const SITE_TITLE_AR = "قبل لا تدفع… افهم قرار سفرك.";
export const SITE_TITLE_EN = "Understand your travel decision before you pay.";

export const SITE_DESCRIPTION =
  "سافر بوعي أداة تجريبية لتحليل عروض السفر النصية بقواعد حتمية قبل الحجز. SafrBwai is an experimental rule-based tool for reviewing text travel offers before booking.";
