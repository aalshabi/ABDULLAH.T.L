import { afterEach, describe, expect, it, vi } from "vitest";
import { createInMemoryRateLimiter } from "@/lib/offer-pipeline/api/rate-limit";
import { HOTEL_SEARCH_SCHEMA_VERSION } from "./constants";
import { HotelProviderError } from "./errors";
import { createHotelSearchHandler } from "./handler";
import type { HotelDataProvider, SourcedHotel } from "./types";

const URL = "http://localhost/api/hotels/search";
const RESULT: SourcedHotel = {
  placeId: "ChIJTestHotel123",
  requestedLocaleName: "فندق الاختبار",
  primaryType: "hotel",
  source: "google_places",
};

function request(body: unknown, ip = "203.0.113.10") {
  return new Request(URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function provider(search = vi.fn().mockResolvedValue([RESULT])): HotelDataProvider {
  return {
    search,
    getLocalizedName: vi.fn().mockResolvedValue(null),
  };
}

function setup(options: {
  enabled?: boolean;
  provider?: HotelDataProvider;
  providerFactory?: () => HotelDataProvider;
  max?: number;
} = {}) {
  const source = options.provider ?? provider();
  const providerFactory = options.providerFactory ?? vi.fn(() => source);
  return {
    source,
    providerFactory,
    handler: createHotelSearchHandler({
      enabled: options.enabled ?? true,
      providerFactory,
      rateLimiter: createInMemoryRateLimiter({
        max: options.max ?? 3,
        windowMs: 60_000,
      }),
    }),
  };
}

afterEach(() => vi.restoreAllMocks());

describe("POST /api/hotels/search", () => {
  it("fails closed before reading input or constructing a provider when disabled", async () => {
    const providerFactory = vi.fn(() => provider());
    const { handler } = setup({ enabled: false, providerFactory });
    const response = await handler(
      request({ query: "PRIVATE_DISABLED_HOTEL", city: "PRIVATE_CITY", locale: "en" })
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(providerFactory).not.toHaveBeenCalled();
    const body = await response.json();
    expect(body).toEqual({
      ok: false,
      schemaVersion: HOTEL_SEARCH_SCHEMA_VERSION,
      requestId: expect.any(String),
      error: {
        code: "HOTEL_SEARCH_DISABLED",
        message: {
          ar: "بحث الفنادق غير مفعّل حاليًا.",
          en: "Hotel search is not currently enabled.",
        },
      },
    });
    expect(JSON.stringify(body)).not.toContain("PRIVATE_DISABLED_HOTEL");
  });

  it("returns only the allow-listed provider contract", async () => {
    const search = vi.fn().mockResolvedValue([RESULT]);
    const { handler } = setup({ provider: provider(search) });
    const response = await handler(
      request({ query: "  فندق الاختبار ", city: " الرياض ", locale: "ar" })
    );

    expect(response.status).toBe(200);
    expect(search).toHaveBeenCalledWith({
      query: "فندق الاختبار",
      city: "الرياض",
      locale: "ar",
    });
    expect(await response.json()).toEqual({
      ok: true,
      schemaVersion: HOTEL_SEARCH_SCHEMA_VERSION,
      requestId: expect.any(String),
      data: { source: "google_places", results: [RESULT] },
    });
  });

  it("returns a real empty state without synthetic results", async () => {
    const { handler } = setup({ provider: provider(vi.fn().mockResolvedValue([])) });
    const response = await handler(request({ query: "Missing Hotel", locale: "en" }));
    expect(response.status).toBe(200);
    expect((await response.json()).data.results).toEqual([]);
  });

  it("rejects invalid JSON, unknown fields, and oversized bodies before provider use", async () => {
    const { source, handler } = setup();
    expect((await handler(request("{invalid"))).status).toBe(400);
    expect(
      (await handler(request({ query: "Test Hotel", locale: "en", secret: "x" }))).status
    ).toBe(400);
    expect(
      (
        await handler(
          request({ query: "Test Hotel", locale: "en", padding: "x".repeat(2_000) })
        )
      ).status
    ).toBe(413);
    expect(source.search).not.toHaveBeenCalled();
  });

  it("rate-limits per client with Retry-After", async () => {
    const { handler } = setup({ max: 1 });
    const payload = { query: "Test Hotel", locale: "en" };
    expect((await handler(request(payload))).status).toBe(200);
    const blocked = await handler(request(payload));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBeTruthy();
    expect((await blocked.json()).error.code).toBe("RATE_LIMIT_EXCEEDED");
  });

  it("maps configuration, authentication and provider failures to one safe response", async () => {
    const query = "PRIVATE_HOTEL_QUERY";
    const rawError = "RAW_GOOGLE_PRIVATE_BODY";
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const failingProvider = provider(
      vi.fn().mockRejectedValue(new HotelProviderError("PROVIDER_AUTH"))
    );
    const { handler } = setup({ provider: failingProvider });
    const response = await handler(request({ query, locale: "en" }));

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error.code).toBe("PROVIDER_UNAVAILABLE");
    const serialized = JSON.stringify(body) + log.mock.calls.flat().join(" ");
    expect(serialized).not.toContain(query);
    expect(serialized).not.toContain(rawError);
    expect(Object.keys(JSON.parse(String(log.mock.calls[0][0]))).sort()).toEqual([
      "code",
      "durationMs",
      "level",
      "providerMethod",
      "requestId",
      "scope",
      "status",
    ]);
  });

  it("fails safely when provider configuration is missing", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { handler } = setup({
      providerFactory: () => {
        throw new HotelProviderError("PROVIDER_CONFIG");
      },
    });
    const response = await handler(request({ query: "Test Hotel", locale: "en" }));
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe("PROVIDER_UNAVAILABLE");
    expect(log).toHaveBeenCalledTimes(1);
  });

  it("returns a safe internal error when request infrastructure fails", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = createHotelSearchHandler({
      enabled: true,
      providerFactory: () => provider(),
      rateLimiter: {
        check: () => {
          throw new Error("PRIVATE_RATE_LIMIT_FAILURE");
        },
        reset: () => undefined,
      },
    });

    const response = await handler(request({ query: "Test Hotel", locale: "en" }));
    expect(response.status).toBe(500);
    const serialized = JSON.stringify(await response.json()) + log.mock.calls.flat().join(" ");
    expect(serialized).not.toContain("PRIVATE_RATE_LIMIT_FAILURE");
    expect(serialized).not.toContain("Test Hotel");
  });
});
