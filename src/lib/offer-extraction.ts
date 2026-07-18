/**
 * Offer content-extraction capability flag.
 *
 * The current build does NOT read PDF/image content and does NOT run OCR, so
 * real extraction is disabled. While this is false, the offer analyzer must not
 * present any analytical report derived from a file's name/size — it only shows
 * the upload experience plus a clear "extraction not enabled" message.
 *
 * Flip to true only once a real server-side OCR/parse pipeline exists.
 */
export const OFFER_EXTRACTION_ENABLED = false;

export function isOfferExtractionEnabled(): boolean {
  return OFFER_EXTRACTION_ENABLED;
}
