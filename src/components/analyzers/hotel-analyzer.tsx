"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Building2, Search } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/provider";
import { analyzeHotel, ANALYSIS_DELAY_MS, type AnalysisResult } from "@/lib/analysis/engine";
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

export function HotelAnalyzer() {
  const { t, locale } = useLanguage();
  const [name, setName] = React.useState("");
  const [city, setCity] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);

  const th = t.analyzeHotel;

  const metricLabels: Record<string, string> = {
    reviewAuthenticity: th.metrics.reviewAuthenticity,
    priceTransparency: th.metrics.priceTransparency,
    photoAccuracy: th.metrics.photoAccuracy,
    locationHonesty: th.metrics.locationHonesty,
    hiddenFees: th.metrics.hiddenFees,
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, ANALYSIS_DELAY_MS));
    const res = analyzeHotel(name, city, locale);
    setResult(res);
    setLoading(false);
    saveAnalysis({ type: "hotel", title: name.trim(), score: res.score });
    toast.success(t.common.verdict + ": " + res.score + "%");
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  return (
    <>
      <PageHeader icon={Building2} title={th.title} subtitle={th.subtitle} />
      <div className="container -mt-8 pb-20">
        <Card className="mx-auto max-w-2xl shadow-xl">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="hotel-name">{th.inputLabel}</Label>
                <Input
                  id="hotel-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={th.inputPlaceholder}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hotel-city">{th.cityLabel}</Label>
                <Input
                  id="hotel-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={th.cityPlaceholder}
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

              <Card>
                <CardHeader>
                  <CardTitle>{th.breakdown}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MetricBars metrics={result.metrics} labels={metricLabels} />
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                {result.redFlags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-500">{th.redFlags}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FlagList items={result.redFlags} tone="red" />
                    </CardContent>
                  </Card>
                )}
                {result.greenFlags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-emerald-500">{th.greenFlags}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FlagList items={result.greenFlags} tone="green" />
                    </CardContent>
                  </Card>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{th.recommendation}</CardTitle>
                </CardHeader>
                <CardContent>
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
