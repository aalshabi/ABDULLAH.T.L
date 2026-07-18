"use client";

import { AlertCircle } from "lucide-react";

/**
 * Accessible field error: icon + text + role="alert" (never color-only).
 */
export function FieldError({ id, message }: { id?: string; message?: string | null }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-red-600">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  );
}
