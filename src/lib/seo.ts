/**
 * SEO constants for the pre-launch phase.
 *
 * The whole site remains out of search indexes until the public launch gate
 * has passed. Stage 6A intentionally does not alter these controls.
 */
export const DEMO_ROBOTS = {
  index: false,
  follow: false,
} as const;

export const SITE_TITLE_AR = "قبل لا تدفع… افهم قرار سفرك.";
export const SITE_TITLE_EN = "Understand your travel decision before you pay.";

export const SITE_DESCRIPTION =
  "سافر بوعي أداة تساعدك على مراجعة المعلومات الواردة في عروض السفر واتخاذ قرار أوضح قبل الحجز. SafrBwai helps you review the information stated in travel offers and make a clearer decision before booking.";
