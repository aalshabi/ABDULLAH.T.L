"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Compass, CalendarDays, Wallet, Search } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/provider";
import {
  analyzeDestination,
  ANALYSIS_DELAY_MS,
  type DestinationResult,
} from "@/lib/analysis/engine";
import { saveAnalysis } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ScoreRing } from "@/components/shared/score-ring";
import { AnalyzerLoading } from "@/components/analyzers/analyzer-loading";
import {
  FlagList,
  MetricBars,
  Recommendation,
  VerdictBadge,
} from "@/components/shared/analysis-blocks";

export function DestinationAnalyzer() {
  const { t, locale } = useLanguage();
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<DestinationResult | null>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);

  const td = t.analyzeDestination;
  const metricLabels: Record<string, string> = {
    safety: td.metrics.safety,
    value: td.metrics.value,
    crowds: td.metrics.crowds,
    authenticity: td.metrics.authenticity,
    accessibility: td.metrics.accessibility,
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, ANALYSIS_DELAY_MS));
    const res = analyzeDestination(name, locale);
    setResult(res);
    setLoading(false);
    saveAnalysis({ type: "destination", title: name.trim(), score: res.score });
    toast.success(t.common.verdict + ": " + res.score + "%");
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  return (
    <>
      <PageHeader icon={Compass} title={td.title} subtitle={td.subtitle} />
      <div className="container -mt-8 pb-20">
        <Card className="mx-auto max-w-2xl shadow-xl">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="dest-name">{td.inputLabel}</Label>
                <Input
                  id="dest-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={td.inputPlaceholder}
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  t.common.analyzing
                ) : (
                  <>
                    <Search className="size-4" />
                    {t.common.analyze}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div ref={resultRef} className="mx-auto mt-8 max-w-2xl scroll-mt-24">
          {loading && <AnalyzerLoading />}
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Card>
                <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                  <ScoreRing score={result.score} label={t.common.score} />
                  <VerdictBadge score={result.score} />
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="grid size-11 place-items-center rounded-xl bg-teal/10 text-teal">
                      <CalendarDays className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{td.bestSeason}</p>
                      <p className="font-display text-base font-bold text-foreground">
                        {result.bestSeason[locale]}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="grid size-11 place-items-center rounded-xl bg-navy/10 text-navy">
                      <Wallet className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{td.cost}</p>
                      <p className="font-display text-base font-bold text-foreground">
                        {result.costLevel[locale]}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{td.resultTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MetricBars metrics={result.metrics} labels={metricLabels} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-500">{td.touristTraps}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FlagList items={result.touristTraps} tone="red" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-emerald-500">{td.tips}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FlagList items={result.greenFlags} tone="green" />
                  <Recommendation text={result.recommendation} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
