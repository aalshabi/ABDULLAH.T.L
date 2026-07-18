"use client";

import { Compass, ListChecks, Scale, MessageCircleQuestion, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import { Reveal } from "@/components/shared/reveal";

/**
 * Qualitative value points — deliberately NO numbers, percentages or
 * user/analysis counts (those would be unverified claims in the demo).
 */
export function Benefits() {
  const { t } = useLanguage();
  const b = t.benefits;
  const items: { icon: LucideIcon; label: string }[] = [
    { icon: Compass, label: b.clearer },
    { icon: ListChecks, label: b.gaps },
    { icon: Scale, label: b.compare },
    { icon: MessageCircleQuestion, label: b.questions },
  ];

  return (
    <section className="border-b border-border bg-background">
      <div className="container py-16">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-display text-2xl font-extrabold text-foreground md:text-3xl">{b.title}</h2>
          <p className="mt-3 text-muted-foreground">{b.subtitle}</p>
        </Reveal>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.label} index={i}>
              <div className="flex h-full flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center">
                <div className="grid size-12 place-items-center rounded-xl bg-teal/10 text-teal">
                  <item.icon className="size-6" />
                </div>
                <span className="font-display font-bold text-foreground">{item.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
