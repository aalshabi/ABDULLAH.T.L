import {
  IMAGE_EXTENSIONS,
  IMAGE_MIME_TYPES,
  OFFER_LIMITS,
  PDF_EXTENSIONS,
  PDF_MIME_TYPES,
  type TravelOfferInput,
  type TravelOfferInputType,
  type ValidationResult,
} from "./types";

/** A minimal file shape (works for the browser File and for tests). */
export interface FileLike {
  name: string;
  size: number;
  type: string;
}

export type FileKind = "pdf" | "image";

export function validateText(text: string): ValidationResult {
  const trimmed = text.trim();
  if (trimmed.length === 0) return { ok: false, code: "empty" };
  if (trimmed.length < OFFER_LIMITS.textMin) return { ok: false, code: "text_too_short" };
  if (text.length > OFFER_LIMITS.textMax) return { ok: false, code: "text_too_long" };
  return { ok: true };
}

export function validateFile(file: FileLike | null, kind: FileKind): ValidationResult {
  if (!file) return { ok: false, code: "empty" };

  const allowedMime = kind === "pdf" ? PDF_MIME_TYPES : IMAGE_MIME_TYPES;
  const allowedExt = kind === "pdf" ? PDF_EXTENSIONS : IMAGE_EXTENSIONS;
  const mimeOk = (allowedMime as readonly string[]).includes(file.type);
  // Fall back to the extension when the browser reports an empty/odd MIME.
  const extOk = allowedExt.test(file.name);
  if (!mimeOk && !extOk) return { ok: false, code: "file_unsupported" };

  if (file.size > OFFER_LIMITS.fileMaxBytes) return { ok: false, code: "file_too_large" };
  return { ok: true };
}

export function validateUrl(url: string): ValidationResult {
  const value = url.trim();
  if (value.length === 0) return { ok: false, code: "empty" };
  if (!/^https?:\/\//i.test(value)) return { ok: false, code: "url_invalid" };
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { ok: false, code: "url_invalid" };
    }
    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return { ok: false, code: "url_invalid" };
    }
    return { ok: true };
  } catch {
    return { ok: false, code: "url_invalid" };
  }
}

export interface OfferInputValues {
  text: string;
  url: string;
  pdf: FileLike | null;
  image: FileLike | null;
}

/** Validate the currently selected method against its value. */
export function validateMethod(
  method: TravelOfferInputType,
  values: OfferInputValues
): ValidationResult {
  switch (method) {
    case "text":
      return validateText(values.text);
    case "pdf":
      return validateFile(values.pdf, "pdf");
    case "image":
      return validateFile(values.image, "image");
    case "url":
      return validateUrl(values.url);
  }
}

/** Whether the "start analysis" button should be enabled. */
export function canSubmit(method: TravelOfferInputType, values: OfferInputValues): boolean {
  return validateMethod(method, values).ok;
}

/** True when the currently selected method has any user content. */
export function methodHasContent(
  method: TravelOfferInputType,
  values: OfferInputValues
): boolean {
  switch (method) {
    case "text":
      return values.text.trim().length > 0;
    case "url":
      return values.url.trim().length > 0;
    case "pdf":
      return values.pdf !== null;
    case "image":
      return values.image !== null;
  }
}

/**
 * Build the normalized TravelOfferInput for the review step. Returns null when
 * the selected method is not valid. `now` is injected so it stays pure/testable.
 */
export function buildOfferInput(
  method: TravelOfferInputType,
  values: OfferInputValues,
  now: Date
): TravelOfferInput | null {
  if (!validateMethod(method, values).ok) return null;
  const createdAt = now.toISOString();

  switch (method) {
    case "text":
      return { type: "text", text: values.text.trim(), createdAt };
    case "url":
      return { type: "url", url: values.url.trim(), createdAt };
    case "pdf":
    case "image": {
      const f = method === "pdf" ? values.pdf! : values.image!;
      return {
        type: method,
        file: { name: f.name, size: f.size, mimeType: f.type },
        createdAt,
      };
    }
  }
}
