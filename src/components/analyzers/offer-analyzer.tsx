"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Tag, Search, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/provider";
import { analyzeOffer, ANALYSIS_DELAY_MS, type OfferResult } from "@/lib/analysis/engine";
import { saveAnalysis } from "@/lib/storage";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export function OfferAnalyzer() {
  const { t, locale } = useLanguage();
  const [text, setText] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<OfferResult | null>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);

  const to = t.analyzeOffer;
  const metricLabels: Record<string, string> = {
    priceHonesty: to.metrics.priceHonesty,
    transitQuality: to.metrics.transitQuality,
    flexibility: to.metrics.flexibility,
    inclusions: to.metrics.inclusions,
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, ANALYSIS_DELAY_MS));
    const advertised = price ? Number(price) : null;
    const res = analyzeOffer(text, advertised, locale);
    setResult(res);
    setLoading(false);
    saveAnalysis({
      type: "offer",
      title: text.trim().slice(0, 40) || to.title,
      score: res.score,
    });
    toast.success(t.common.verdict + ": " + res.score + "%");
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  const currency = locale === "ar" ? "ر.س" : "SAR";

  return (
    <>
      <PageHeader icon={Tag} title={to.title} subtitle={to.subtitle} />
      <div className="container -mt-8 pb-20">
        <Card className="mx-auto max-w-2xl shadow-xl">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="offer-text">{to.inputLabel}</Label>
                <Textarea
                  id="offer-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={to.inputPlaceholder}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offer-price">{to.priceLabel}</Label>
                <Input
                  id="offer-price"
                  type="number"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={to.pricePlaceholder}
                  className="ltr-nums"
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

              {/* price reveal */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="size-5 text-teal" />
                    {to.resultTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {result.advertisedPrice !== null && (
                      <div className="rounded-xl border border-border bg-muted/40 p-4 text-center">
                        <p className="text-xs text-muted-foreground">{to.advertised}</p>
                        <p className="ltr-nums font-display text-2xl font-extrabold text-muted-foreground line-through">
                          {formatNumber(result.advertisedPrice, locale)} {currency}
                        </p>
                      </div>
                    )}
                    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-center">
                      <p className="text-xs text-red-600">{to.realPrice}</p>
                      <p className="ltr-nums font-display text-2xl font-extrabold text-red-600">
                        {formatNumber(result.realPrice, locale)} {currency}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">{to.hiddenCosts}</p>
                    {result.hiddenCosts.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2.5 text-sm"
                      >
                        <span className="text-foreground">{c.label[locale]}</span>
                        <span className="ltr-nums font-semibold text-red-500">
                          + {formatNumber(c.amount, locale)} {currency}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{to.metrics.inclusions}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MetricBars metrics={result.metrics} labels={metricLabels} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-500">{to.catches}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FlagList items={result.redFlags} tone="red" />
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
