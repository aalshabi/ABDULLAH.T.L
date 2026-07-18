"use client";

import { useLanguage } from "@/lib/i18n/provider";
import { Label } from "@/components/ui/label";
import { OfferFileField } from "@/components/offer-input/offer-file-field";

export function ImageOfferInput({
  file,
  onFile,
}: {
  file: File | null;
  onFile: (file: File | null) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="space-y-2">
      <Label>{t.analyzeOffer.v1.image.label}</Label>
      <OfferFileField kind="image" file={file} onFile={onFile} />
    </div>
  );
}
