"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Tag,
  Sparkles,
  MapPin,
  CalendarDays,
  Users,
  BedDouble,
  Plane,
  Car,
  ShieldCheck,
  Scale,
  AlertTriangle,
  Gauge,
  Lightbulb,
  CircleX,
  UtensilsCrossed,
  Route,
  Luggage,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/provider";
import { analyzeOfferDeep, ANALYSIS_DELAY_MS, type OfferDeepResult } from "@/lib/analysis/engine";
import { saveAnalysis } from "@/lib/storage";
import { cn, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { ScoreRing } from "@/components/shared/score-ring";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { AnalyzerLoading } from "@/components/analyzers/analyzer-loading";

function barColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-teal";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-teal/10 text-teal">
        <Icon className="size-[18px]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function QualityBar({ label, score, note }: { label: string; score: number; note: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="ltr-nums font-display text-lg font-extrabold text-foreground">{score}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", barColor(score))} style={{ width: `${score}%` }} />
      </div>
      <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{note}</p>
    </div>
  );
}

export function OfferAnalyzer() {
  const { t, locale } = useLanguage();
  const to = t.analyzeOffer;
  const u = to.upload;
  const d = to.deep;

  const [tab, setTab] = React.useState("upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [text, setText] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<OfferDeepResult | null>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);

  const currency = locale === "ar" ? "ر.س" : "SAR";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const seed =
      tab === "upload" && file
        ? `file:${file.name}:${file.size}:${file.type}`
        : text.trim();
    if (!seed) {
      toast.error(u.needInput);
      return;
    }
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, ANALYSIS_DELAY_MS + 400));
    const res = analyzeOfferDeep(seed, price ? Number(price) : null, locale);
    setResult(res);
    setLoading(false);
    saveAnalysis({
      type: "offer",
      title: file?.name || text.trim().slice(0, 40) || to.title,
      score: res.scores.overallValue,
    });
    toast.success(`${d.transparencyScore}: ${res.scores.transparency}%`);
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  const risk = result?.travelRisk;
  const riskLabel = risk
    ? risk.level === "low"
      ? d.riskLow
      : risk.level === "medium"
        ? d.riskMedium
        : d.riskHigh
    : "";
  const riskStyle =
    risk?.level === "low"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
      : risk?.level === "medium"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
        : "border-red-500/30 bg-red-500/10 text-red-600";

  return (
    <>
      <PageHeader icon={Tag} title={to.title} subtitle={to.subtitle} />
      <div className="container -mt-8 pb-20">
        <Card className="mx-auto max-w-2xl shadow-xl">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">{u.tabUpload}</TabsTrigger>
                  <TabsTrigger value="paste">{u.tabPaste}</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                  <FileDropzone
                    file={file}
                    onFile={setFile}
                    labels={{
                      dropTitle: u.dropTitle,
                      dropHint: u.dropHint,
                      browse: u.browse,
                      selected: u.selected,
                      remove: u.remove,
                      formatError: u.formatError,
                      sizeError: u.sizeError,
                    }}
                  />
                </TabsContent>
                <TabsContent value="paste">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={to.inputPlaceholder}
                    className="min-h-[160px]"
                  />
                </TabsContent>
              </Tabs>

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
                  u.extracting
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    {u.extractCta}
                  </>
                )}
              </Button>
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
              className="space-y-6"
            >
              {/* Final indicators */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="size-5 text-teal" />
                    {d.scoresTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <ScoreRing score={result.scores.transparency} size={120} />
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        <ShieldCheck className="size-4 text-teal" />
                        {d.transparencyScore}
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <ScoreRing score={result.scores.priceFairness} size={120} />
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        <Scale className="size-4 text-teal" />
                        {d.priceFairness}
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <ScoreRing score={result.scores.overallValue} size={120} />
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        <Gauge className="size-4 text-teal" />
                        {d.overallValue}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center",
                        riskStyle
                      )}
                    >
                      <AlertTriangle className="size-7" />
                      <span className="ltr-nums font-display text-2xl font-extrabold">{risk?.score}</span>
                      <span className="text-sm font-bold">
                        {d.travelRisk}: {riskLabel}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendation */}
              <div className="flex items-start gap-3 rounded-2xl border border-teal/30 bg-teal/5 p-5">
                <Lightbulb className="mt-0.5 size-6 shrink-0 text-teal" />
                <div>
                  <p className="font-display font-bold text-foreground">{d.recommendation}</p>
                  <p className="mt-1 text-sm text-foreground/90">{result.recommendation[locale]}</p>
                </div>
              </div>

              {/* Extracted information */}
              <Card>
                <CardHeader>
                  <CardTitle>{d.extractedTitle}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <Fact icon={MapPin} label={d.destination} value={result.extracted.destination[locale]} />
                  <Fact
                    icon={CalendarDays}
                    label={d.duration}
                    value={<span className="ltr-nums">{result.extracted.nights} {d.nights}</span>}
                  />
                  <Fact
                    icon={Users}
                    label={d.travelers}
                    value={
                      <span className="ltr-nums">
                        {result.extracted.travelers} {d.traveler}
                      </span>
                    }
                  />
                  <Fact
                    icon={BedDouble}
                    label={d.hotel}
                    value={
                      <span>
                        {result.extracted.hotel.name[locale]}{" "}
                        <span className="ltr-nums text-teal">
                          {"★".repeat(result.extracted.hotel.stars)}
                        </span>
                      </span>
                    }
                  />
                  <Fact icon={UtensilsCrossed} label={d.board} value={result.extracted.hotel.board[locale]} />
                  <Fact icon={Plane} label={d.airline} value={result.extracted.flight.airline} />
                  <Fact icon={Route} label={d.route} value={result.extracted.flight.route[locale]} />
                  <Fact icon={Luggage} label={d.baggage} value={result.extracted.flight.baggage[locale]} />
                  <Fact
                    icon={Car}
                    label={d.transfer}
                    value={
                      <span className={result.extracted.transfer.included ? "text-emerald-600" : "text-red-600"}>
                        {result.extracted.transfer.type[locale]}
                      </span>
                    }
                  />
                </CardContent>
              </Card>

              {/* Daily itinerary */}
              <Card>
                <CardHeader>
                  <CardTitle>{d.itineraryTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="relative space-y-4 border-s-2 border-dashed border-border ps-6">
                    {result.extracted.itinerary.map((item) => (
                      <li key={item.day} className="relative">
                        <span className="absolute -start-[31px] grid size-6 place-items-center rounded-full bg-teal text-[11px] font-bold text-white ltr-nums">
                          {item.day}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {d.day} {item.day}
                        </p>
                        <p className="font-semibold text-foreground">{item.title[locale]}</p>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-5 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                    {result.itineraryNote[locale]}
                  </p>
                </CardContent>
              </Card>

              {/* Analysis: missing + hidden costs */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-500">
                      <CircleX className="size-5" />
                      {d.missingServices}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.missingServices.map((m, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CircleX className="mt-0.5 size-5 shrink-0 text-amber-500" />
                          <span className="text-sm text-foreground/90">{m[locale]}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="size-5" />
                      {to.hiddenCosts}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.hiddenCosts.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-muted/40 px-3.5 py-2.5 text-sm"
                      >
                        <span className="text-foreground">{c.label[locale]}</span>
                        <span className="ltr-nums font-semibold text-red-500">
                          + {formatNumber(c.amount, locale)} {currency}
                        </span>
                      </div>
                    ))}
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
                      <span className="text-sm font-bold text-foreground">{to.realPrice}</span>
                      <span className="ltr-nums font-display text-lg font-extrabold text-red-600">
                        {formatNumber(result.realPrice, locale)} {currency}
                      </span>
                    </div>
                    {result.advertisedPrice !== null && (
                      <div className="flex items-center justify-between px-4 text-xs text-muted-foreground">
                        <span>{to.advertised}</span>
                        <span className="ltr-nums line-through">
                          {formatNumber(result.advertisedPrice, locale)} {currency}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quality breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>{d.analysisTitle}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <QualityBar label={d.hotelQuality} score={result.scores.hotelQuality} note={result.hotelNote[locale]} />
                  <QualityBar label={d.flightsQuality} score={result.scores.flights} note={result.flightNote[locale]} />
                  <QualityBar
                    label={d.transfersQuality}
                    score={result.scores.transfers}
                    note={result.transferNote[locale]}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
