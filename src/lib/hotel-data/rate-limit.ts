import { createInMemoryRateLimiter } from "@/lib/offer-pipeline/api/rate-limit";

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = value ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export const HOTEL_SEARCH_RATE_LIMIT_MAX = positiveInteger(
  process.env.HOTEL_SEARCH_RATE_LIMIT_MAX,
  3
);
export const HOTEL_SEARCH_RATE_LIMIT_WINDOW_MS = positiveInteger(
  process.env.HOTEL_SEARCH_RATE_LIMIT_WINDOW_MS,
  60_000
);

export const hotelSearchRateLimiter = createInMemoryRateLimiter({
  max: HOTEL_SEARCH_RATE_LIMIT_MAX,
  windowMs: HOTEL_SEARCH_RATE_LIMIT_WINDOW_MS,
});
