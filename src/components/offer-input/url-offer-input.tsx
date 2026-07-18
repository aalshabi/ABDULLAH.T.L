"use client";

import { Info } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import type { OfferErrorCode } from "@/lib/offer-input/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/offer-input/field-error";

export function UrlOfferInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error: OfferErrorCode | null;
}) {
  const { t } = useLanguage();
  const v = t.analyzeOffer.v1.url;
  const errs = t.analyzeOffer.v1.errors;
  const message = error === "url_invalid" ? errs.urlInvalid : error === "empty" ? errs.empty : null;

  return (
    <div className="space-y-2">
      <Label htmlFor="offer-url">{v.label}</Label>
      <Input
        id="offer-url"
        type="url"
        inputMode="url"
        dir="ltr"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={v.placeholder}
        className="ltr-nums"
        aria-invalid={Boolean(message)}
        aria-describedby={message ? "offer-url-error" : "offer-url-note"}
      />
      <p id="offer-url-note" className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>{v.laterNote}</span>
      </p>
      <FieldError id="offer-url-error" message={message} />
    </div>
  );
}
