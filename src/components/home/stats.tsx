"use client";

import { useLanguage } from "@/lib/i18n/provider";
import { Reveal } from "@/components/shared/reveal";

export function Stats() {
  const { t } = useLanguage();
  const stats = [
    { value: "٢٥٠ ألف+", valueEn: "250k+", label: t.stats.analyses },
    { value: "١٢ ألف+", valueEn: "12k+", label: t.stats.tricksExposed },
    { value: "٩٦٪", valueEn: "96%", label: t.stats.accuracy },
    { value: "٤٠ ألف+", valueEn: "40k+", label: t.stats.travelers },
  ];
  const { locale } = useLanguage();

  return (
    <section className="border-b border-border bg-background">
      <div className="container grid grid-cols-2 gap-8 py-14 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} index={i} className="text-center">
            <div className="font-display text-3xl font-extrabold text-teal md:text-4xl">
              {locale === "ar" ? s.value : s.valueEn}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
