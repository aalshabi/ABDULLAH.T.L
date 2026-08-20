import { describe, it, expect } from "vitest";
import { createInMemoryRateLimiter } from "./rate-limit";

describe("in-memory rate limiter", () => {
  it("allows up to max within the window, then blocks with Retry-After", () => {
    const t = { v: 1000 };
    const rl = createInMemoryRateLimiter({ max: 3, windowMs: 60_000, now: () => t.v });
    expect(rl.check("ip").allowed).toBe(true);
    expect(rl.check("ip").allowed).toBe(true);
    expect(rl.check("ip").allowed).toBe(true);
    const blocked = rl.check("ip");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("resets after the window elapses", () => {
    const t = { v: 0 };
    const rl = createInMemoryRateLimiter({ max: 1, windowMs: 1000, now: () => t.v });
    expect(rl.check("ip").allowed).toBe(true);
    expect(rl.check("ip").allowed).toBe(false);
    t.v = 1000;
    expect(rl.check("ip").allowed).toBe(true);
  });

  it("tracks keys independently", () => {
    const rl = createInMemoryRateLimiter({ max: 1, windowMs: 60_000, now: () => 0 });
    expect(rl.check("a").allowed).toBe(true);
    expect(rl.check("b").allowed).toBe(true);
    expect(rl.check("a").allowed).toBe(false);
  });

  it("bounds distinct keys and admits new callers after the oldest window expires", () => {
    let now = 0;
    const limiter = createInMemoryRateLimiter({
      max: 2,
      windowMs: 1_000,
      maxKeys: 2,
      now: () => now,
    });

    expect(limiter.check("client-a").allowed).toBe(true);
    now = 100;
    expect(limiter.check("client-b").allowed).toBe(true);
    expect(limiter.check("client-c")).toEqual({
      allowed: false,
      retryAfterSeconds: 1,
    });

    now = 1_001;
    expect(limiter.check("client-c").allowed).toBe(true);
  });
});
