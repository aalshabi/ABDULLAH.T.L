/**
 * Server-side rate limiting for the offer analysis endpoint.
 *
 * A small abstraction (`RateLimiter`) with a fixed-window in-memory
 * implementation that is safe for the soft launch. It stores only ephemeral
 * counters keyed by a caller id — never user text, evidence, or any content —
 * and uses no localStorage and no external/paid provider.
 *
 * ⚠️ Vercel serverless note: this in-memory limiter is PER WARM INSTANCE, not
 * globally distributed. It bounds abuse per instance (a safe, dependency-free
 * default) but does not enforce a single global limit across concurrent
 * instances. To get cross-instance limits later, implement this SAME
 * `RateLimiter` interface over a shared store (e.g. Upstash Redis) and swap the
 * exported `offerRateLimiter` — the route does not change.
 */

export interface RateDecision {
  allowed: boolean;
  /** Seconds until the window resets (0 when allowed). */
  retryAfterSeconds: number;
}

export interface RateLimiter {
  check(key: string): RateDecision;
  reset(): void;
}

export interface RateLimitOptions {
  max: number;
  windowMs: number;
  /** Hard memory bound for distinct caller keys in one warm instance. */
  maxKeys?: number;
  /** Injectable clock for deterministic tests. */
  now?: () => number;
}

export function createInMemoryRateLimiter(opts: RateLimitOptions): RateLimiter {
  const { max, windowMs, maxKeys = 10_000 } = opts;
  const now = opts.now ?? (() => Date.now());
  const buckets = new Map<string, { count: number; start: number }>();
  const expiryQueue: Array<{ key: string; start: number }> = [];
  let queueHead = 0;

  function pruneExpired(t: number): void {
    while (queueHead < expiryQueue.length) {
      const entry = expiryQueue[queueHead];
      if (t - entry.start < windowMs) break;
      const current = buckets.get(entry.key);
      if (current?.start === entry.start) buckets.delete(entry.key);
      queueHead += 1;
    }

    if (queueHead > 1_024 && queueHead * 2 > expiryQueue.length) {
      expiryQueue.splice(0, queueHead);
      queueHead = 0;
    }
  }

  return {
    check(key: string): RateDecision {
      const t = now();
      pruneExpired(t);
      const bucket = buckets.get(key);
      if (!bucket) {
        if (buckets.size >= maxKeys) {
          const oldest = expiryQueue[queueHead];
          const retryAfterMs = oldest ? oldest.start + windowMs - t : windowMs;
          return {
            allowed: false,
            retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
          };
        }
        buckets.set(key, { count: 1, start: t });
        expiryQueue.push({ key, start: t });
        return { allowed: true, retryAfterSeconds: 0 };
      }
      if (bucket.count < max) {
        bucket.count += 1;
        return { allowed: true, retryAfterSeconds: 0 };
      }
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.start + windowMs - t) / 1000)) };
    },
    reset(): void {
      buckets.clear();
      expiryQueue.length = 0;
      queueHead = 0;
    },
  };
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

/** Conservative soft-launch defaults; override via environment variables. */
export const OFFER_RATE_LIMIT_MAX = envInt("OFFER_RATE_LIMIT_MAX", 10);
export const OFFER_RATE_LIMIT_WINDOW_MS = envInt("OFFER_RATE_LIMIT_WINDOW_MS", 60_000);

/** Process-wide limiter used by the route (per warm instance — see note above). */
export const offerRateLimiter: RateLimiter = createInMemoryRateLimiter({
  max: OFFER_RATE_LIMIT_MAX,
  windowMs: OFFER_RATE_LIMIT_WINDOW_MS,
});
