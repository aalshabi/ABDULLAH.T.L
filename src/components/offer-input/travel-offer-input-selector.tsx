"use client";

import { FileText, FileType2, ImageIcon, LinkIcon, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { TravelOfferInputType } from "@/lib/offer-input/types";

const ICONS: Record<TravelOfferInputType, LucideIcon> = {
  text: FileText,
  pdf: FileType2,
  image: ImageIcon,
  url: LinkIcon,
};

export function TravelOfferInputSelector({
  method,
  onSelect,
}: {
  method: TravelOfferInputType;
  onSelect: (next: TravelOfferInputType) => void;
}) {
  const { t } = useLanguage();
  const labels = t.analyzeOffer.v1.methods;
  const methods: TravelOfferInputType[] = ["text", "pdf", "image", "url"];

  return (
    <div role="tablist" aria-label={t.analyzeOffer.v1.title} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {methods.map((m) => {
        const Icon = ICONS[m];
        const active = m === method;
        return (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(m)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
              active
                ? "border-teal bg-teal/10 text-teal-600"
                : "border-border bg-card text-muted-foreground hover:border-teal/40 hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {labels[m]}
          </button>
        );
      })}
    </div>
  );
}
