"use client";

import * as React from "react";
import { formatNumber } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/provider";

export function VisitorsChart({ series }: { series: { label: string; value: number }[] }) {
  const { locale } = useLanguage();
  const max = Math.max(...series.map((s) => s.value), 1);
  const [hover, setHover] = React.useState<number | null>(null);

  return (
    <div>
      <div className="flex h-52 items-stretch gap-1.5" role="img" aria-label="Daily visitors">
        {series.map((s, i) => {
          const h = Math.round((s.value / max) * 100);
          const active = hover === i || (hover === null && i === series.length - 1);
          return (
            <div
              key={i}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {active && (
                <div className="absolute -top-8 z-10 whitespace-nowrap rounded-lg bg-navy px-2 py-1 text-[11px] font-semibold text-white shadow-lg ltr-nums">
                  {formatNumber(s.value, locale)}
                </div>
              )}
              <div
                className={`w-full rounded-t-md transition-all duration-300 ${
                  active ? "bg-teal" : "bg-teal/35 group-hover:bg-teal/60"
                }`}
                style={{ height: `${Math.max(4, h)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>{series[0]?.label}</span>
        <span>{series[Math.floor(series.length / 2)]?.label}</span>
        <span>{series[series.length - 1]?.label}</span>
      </div>
    </div>
  );
}
