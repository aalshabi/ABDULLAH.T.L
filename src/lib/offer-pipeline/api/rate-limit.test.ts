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
});
