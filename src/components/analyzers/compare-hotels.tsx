"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BarChart3, Plus, X, Search } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/provider";
import { compareHotels, ANALYSIS_DELAY_MS } from "@/lib/analysis/engine";
import { saveAnalysis } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";
import { AnalyzerLoading } from "@/components/analyzers/analyzer-loading";
import { DemoNotice } from "@/components/shared/demo-notice";

type Row = { name: string; score: number; metrics: { key: string; score: number }[] };

export function CompareHotels() {
  const { t } = useLanguage();
  const tc = t.compare;
  const th = t.analyzeHotel.metrics;
  const [names, setNames] = React.useState<string[]>(["", ""]);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<{ rows: Row[]; winnerIndex: number } | null>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);

  const metricLabels: Record<string, string> = {
    reviewAuthenticity: th.reviewAuthenticity,
    priceTransparency: th.priceTransparency,
    photoAccuracy: th.photoAccuracy,
    locationHonesty: th.locationHonesty,
    hiddenFees: th.hiddenFees,
  };

  function updateName(i: number, value: string) {
    setNames((prev) => prev.map((n, idx) => (idx === i ? value : n)));
  }
  function addHotel() {
    if (names.length < 4) setNames((prev) => [...prev, ""]);
  }
  function removeHotel(i: number) {
    if (names.length > 2) setNames((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function onCompare(e: React.FormEvent) {
    e.preventDefault();
    const filled = names.filter((n) => n.trim().length > 0);
    if (filled.length < 2) {
      toast.error(tc.needTwo);
      return;
    }
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, ANALYSIS_DELAY_MS));
    const res = compareHotels(names, "ar");
    setResult(res);
    setLoading(false);
    saveAnalysis({
      type: "compare",
      title: filled.slice(0, 2).join(" · "),
      score: res.rows[res.winnerIndex]?.score ?? 0,
    });
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  const metricKeys = ["reviewAuthenticity", "priceTransparency", "photoAccuracy", "locationHonesty", "hiddenFees"];

  return (
    <>
      <PageHeader icon={BarChart3} title={tc.title} subtitle={tc.subtitle} />
      <div className="container -mt-8 pb-20">
        <Card className="mx-auto max-w-2xl shadow-xl">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={onCompare} className="space-y-4">
              {names.map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-teal/10 font-display text-sm font-bold text-teal ltr-nums">
                    {i + 1}
                  </span>
                  <Input
                    value={name}
                    onChange={(e) => updateName(i, e.target.value)}
                    placeholder={`${tc.hotelName} ${i + 1}`}
                  />
                  {names.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHotel(i)}
                      aria-label={tc.remove}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ))}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                {names.length < 4 && (
                  <Button type="button" variant="outline" onClick={addHotel} className="sm:flex-1">
                    <Plus className="size-4" />
                    {tc.addHotel}
                  </Button>
                )}
                <Button type="submit" size="default" className="sm:flex-1" disabled={loading}>
                  <Search className="size-4" />
                  {tc.compareBtn}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div ref={resultRef} className="mx-auto mt-8 max-w-4xl scroll-mt-24">
          {loading && <AnalyzerLoading />}
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <DemoNotice />
              <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                {/* header row */}
                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: `160px repeat(${result.rows.length}, 1fr)` }}
                >
                  <div />
                  {result.rows.map((row, i) => (
                    <Card key={i} className="text-center transition-all">
                      <CardContent className="p-4">
                        {/* "Best value" recommendation disabled in demo — the
                            comparison is illustrative, not a real verdict. */}
                        <p className="truncate font-display font-bold text-foreground">{row.name}</p>
                        <p className="ltr-nums mt-1 font-display text-3xl font-extrabold text-teal">
                          {row.score}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* metric rows */}
                <div className="mt-4 space-y-2">
                  {metricKeys.map((key) => (
                    <div
                      key={key}
                      className="grid items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                      style={{ gridTemplateColumns: `160px repeat(${result.rows.length}, 1fr)` }}
                    >
                      <span className="text-sm font-medium text-muted-foreground">
                        {metricLabels[key]}
                      </span>
                      {result.rows.map((row, i) => {
                        const m = row.metrics.find((x) => x.key === key);
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <Progress value={m?.score ?? 0} className="h-2" />
                            <span className="ltr-nums w-9 text-xs font-semibold text-foreground">
                              {m?.score ?? 0}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
