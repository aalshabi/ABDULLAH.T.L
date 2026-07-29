import {
  createInMemoryRateLimiter,
  type RateLimiter,
} from "@/lib/offer-pipeline/api/rate-limit";

export const FEEDBACK_RATE_LIMIT_MAX = 5;
export const FEEDBACK_RATE_LIMIT_WINDOW_MS = 60_000;

export const feedbackRateLimiter: RateLimiter = createInMemoryRateLimiter({
  max: FEEDBACK_RATE_LIMIT_MAX,
  windowMs: FEEDBACK_RATE_LIMIT_WINDOW_MS,
});
