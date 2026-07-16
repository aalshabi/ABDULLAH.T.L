"use client";

import { PenLine, Cpu, ClipboardCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import { Reveal } from "@/components/shared/reveal";

export function HowItWorks() {
  const { t } = useLanguage();
  const steps = [
    { icon: PenLine, title: t.how.step1Title, desc: t.how.step1Desc },
    { icon: Cpu, title: t.how.step2Title, desc: t.how.step2Desc },
    { icon: ClipboardCheck, title: t.how.step3Title, desc: t.how.step3Desc },
  ];

  return (
    <section id="how" className="section bg-muted/40">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold text-foreground md:text-4xl">
            {t.how.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{t.how.subtitle}</p>
        </Reveal>

        <div className="relative mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} index={i} className="relative">
              <div className="relative rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-navy text-white">
                  <s.icon className="size-6 text-teal-400" />
                </div>
                <div className="mt-4 font-display text-sm font-bold text-teal ltr-nums">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-1 font-display text-lg font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
