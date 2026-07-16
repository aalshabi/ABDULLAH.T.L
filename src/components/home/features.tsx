"use client";

import Link from "next/link";
import { BarChart3, Building2, Compass, LayoutDashboard, Sparkles, Tag } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";

export function Features() {
  const { t } = useLanguage();

  const features = [
    { icon: Building2, href: "/analyze-hotel", ...t.features.hotel },
    { icon: Compass, href: "/analyze-destination", ...t.features.destination },
    { icon: Tag, href: "/analyze-offer", ...t.features.offer },
    { icon: BarChart3, href: "/compare-hotels", ...t.features.compare },
    { icon: Sparkles, href: "/knowledge", ...t.features.knowledge },
    { icon: LayoutDashboard, href: "/dashboard", ...t.features.dashboard },
  ];

  return (
    <section className="section">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold text-foreground md:text-4xl">
            {t.features.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{t.features.subtitle}</p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.href} index={i}>
              <Link href={f.href} className="group block h-full">
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:border-teal/40 hover:shadow-xl hover:shadow-teal/5">
                  <CardContent className="p-7">
                    <div className="mb-5 grid size-12 place-items-center rounded-xl bg-teal/10 text-teal transition-colors group-hover:bg-teal group-hover:text-white">
                      <f.icon className="size-6" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
