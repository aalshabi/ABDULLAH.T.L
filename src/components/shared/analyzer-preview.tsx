"use client";

import { Wrench, Dot } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import { Card, CardContent } from "@/components/ui/card";
import { DemoNotice } from "@/components/shared/demo-notice";

/**
 * Shown after a user submits an analyzer form in the demo. It renders NO
 * generated data — no scores, names, verdicts or recommendations. It only
 * states that this is a UI preview and lists (as plain labels) what the real
 * version will review in the future.
 */
export function AnalyzerPreview({ futureItems }: { futureItems: string[] }) {
  const { t } = useLanguage();
  const d = t.demo;
  return (
    <div className="space-y-6">
      <DemoNotice />
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Wrench className="size-7" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-foreground">{d.previewTitle}</h2>
              <p className="mt-4 text-sm font-semibold text-foreground">{d.futureHeading}</p>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {futureItems.map((item) => (
                  <li key={item} className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Dot className="size-5 shrink-0 text-teal" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                {d.futureNote}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
