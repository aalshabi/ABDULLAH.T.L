import type { HotelProviderMethod } from "./types";

export type HotelServerLog = Readonly<{
  requestId: string;
  code: string;
  status: number;
  durationMs: number;
  providerMethod?: HotelProviderMethod;
}>;

export function logHotelServerError(entry: HotelServerLog): void {
  // Deliberately excludes hotel name, city, tokens, headers and provider bodies.
  // eslint-disable-next-line no-console
  console.error(
    JSON.stringify({
      level: "error",
      scope: "hotel-search-api",
      requestId: entry.requestId,
      code: entry.code,
      status: entry.status,
      durationMs: entry.durationMs,
      ...(entry.providerMethod ? { providerMethod: entry.providerMethod } : {}),
    })
  );
}
