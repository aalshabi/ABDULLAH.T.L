import { describe, it, expect, vi, afterEach } from "vitest";
import { logServerError } from "./logging";

afterEach(() => vi.restoreAllMocks());

describe("logServerError", () => {
  it("logs only operational metadata — no user text/evidence/PII", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logServerError({ requestId: "req-1", code: "INTERNAL_ERROR", status: 500, durationMs: 12 });

    expect(spy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(String(spy.mock.calls[0][0]));
    expect(parsed).toMatchObject({
      scope: "offer-api",
      requestId: "req-1",
      code: "INTERNAL_ERROR",
      status: 500,
      durationMs: 12,
    });
    // ONLY these keys — nothing that could carry user content
    expect(Object.keys(parsed).sort()).toEqual(["code", "durationMs", "level", "requestId", "scope", "status"]);
  });
});
