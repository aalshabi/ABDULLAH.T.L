export type HotelLocale = "ar" | "en";

export type HotelBusinessStatus =
  | "OPERATIONAL"
  | "CLOSED_TEMPORARILY"
  | "CLOSED_PERMANENTLY";

export type HotelSearchInput = Readonly<{
  query: string;
  city?: string;
  locale: HotelLocale;
}>;

export type SourcedHotel = Readonly<{
  placeId: string;
  requestedLocaleName: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  primaryType: string;
  businessStatus?: HotelBusinessStatus;
  googleMapsUri?: string;
  source: "google_places";
}>;

export interface HotelDataProvider {
  search(input: HotelSearchInput): Promise<readonly SourcedHotel[]>;
  getLocalizedName(placeId: string, locale: HotelLocale): Promise<string | null>;
}

export interface GoogleAccessTokenProvider {
  getAccessToken(scope: string): Promise<string>;
}

export type HotelProviderMethod = "text_search" | "place_details";

export type HotelTransport = (
  input: string | URL,
  init: RequestInit
) => Promise<Response>;
