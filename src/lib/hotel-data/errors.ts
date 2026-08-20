export type HotelProviderErrorCode =
  | "PROVIDER_CONFIG"
  | "PROVIDER_AUTH"
  | "PROVIDER_QUOTA"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_RESPONSE_INVALID";

const SAFE_MESSAGES: Readonly<Record<HotelProviderErrorCode, string>> = {
  PROVIDER_CONFIG: "Hotel provider configuration is unavailable.",
  PROVIDER_AUTH: "Hotel provider authentication is unavailable.",
  PROVIDER_QUOTA: "Hotel provider quota is unavailable.",
  PROVIDER_UNAVAILABLE: "Hotel provider is unavailable.",
  PROVIDER_RESPONSE_INVALID: "Hotel provider returned an invalid response.",
};

export class HotelProviderError extends Error {
  readonly code: HotelProviderErrorCode;

  constructor(code: HotelProviderErrorCode) {
    super(SAFE_MESSAGES[code]);
    this.name = "HotelProviderError";
    this.code = code;
  }
}

export function isHotelProviderError(value: unknown): value is HotelProviderError {
  return value instanceof HotelProviderError;
}
