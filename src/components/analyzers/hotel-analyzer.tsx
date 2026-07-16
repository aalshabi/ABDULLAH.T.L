"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Search,
  Wallet,
  MapPin,
  Users,
  Heart,
  Gem,
  UtensilsCrossed,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Hotel,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/provider";
import { analyzeHotelDeep, ANALYSIS_DELAY_MS, type HotelDeepResult } from "@/lib/analysis/engine";
import { saveAnalysis } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { ScoreRing } from "@/components/shared/score-ring";
import { AnalyzerLoading } from "@/components/analyzers/analyzer-loading";
import { DemoNotice, DemoUnavailable } from "@/components/shared/demo-notice";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  valueForMoney: Wallet,
  location: MapPin,
  family: Users,
  honeymoon: Heart,
  luxury: Gem,
  food: UtensilsCrossed,
};

function barColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-teal";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function CategoryCard({ label, score, Icon }: { label: string; score: number; Icon: LucideIcon }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-teal/40 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="grid size-10 place-items-center rounded-xl bg-teal/10 text-teal">
          <Icon className="size-5" />
        </div>
        <span className="ltr-nums font-display text-2xl font-extrabold text-foreground">{score}</span>
      </div>
      <p className="mb-2 text-sm font-semibold text-foreground">{label}</p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function AudienceList({
  items,
  tone,
}: {
  items: { ar: string; en: string }[];
  tone: "book" | "avoid";
}) {
  const { locale } = useLanguage();
  const Icon = tone === "book" ? CheckCircle2 : XCircle;
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <Icon
            className={cn(
              "mt-0.5 size-5 shrink-0",
              tone === "book" ? "text-emerald-500" : "text-red-500"
            )}
          />
          <span className="text-sm text-foreground/90">{item[locale]}</span>
        </li>
      ))}
    </ul>
  );
}

export function HotelAnalyzer() {
  const { t, locale } = useLanguage();
  const [name, setName] = React.useState("");
  const [city, setCity] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<HotelDeepResult | null>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);

  const th = t.analyzeHotel;
  const d = th.deep;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, ANALYSIS_DELAY_MS));
    const res = analyzeHotelDeep(name, city, locale);
    setResult(res);
    setLoading(false);
    saveAnalysis({ type: "hotel", title: name.trim(), score: res.overall });
    toast.success(`${d.overall}: ${res.overall}/100`);
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

        <div ref={resultRef} className="mx-auto mt-8 max-w-4xl scroll-mt-24">
          {loading && <AnalyzerLoading />}
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Demo notice — shown before any score or recommendation */}
              <DemoNotice />

              {/* Overall hero card */}
              <Card className="overflow-hidden">
                <div className="grid gap-6 p-8 md:grid-cols-[auto_1fr] md:items-center">
                  <div className="mx-auto md:mx-0">
                    <ScoreRing score={result.overall} size={168} label={d.outOf} />
                  </div>
                  <div className="text-center md:text-start">
                    {result.name && (
                      <h2 className="font-display text-2xl font-extrabold text-foreground">
                        {result.name}
                      </h2>
                    )}
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                      <Badge variant="navy">{d.overall}</Badge>
                    </div>
                    {/* Decisive verdict + recommendation are disabled while the
                        engine is demo-only, to avoid misleading claims. */}
                    <div className="mt-4">
                      <DemoUnavailable />
                    </div>
                    <Button asChild variant="outline" size="sm" className="mt-5">
                      <Link href="/compare-hotels">
                        <Hotel className="size-4" />
                        {d.compareCta}
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Category scores */}
              <Card>
                <CardHeader>
                  <CardTitle>{d.categoriesTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {result.categories.map((c) => (
                      <CategoryCard
                        key={c.key}
                        label={d.categories[c.key as keyof typeof d.categories]}
                        score={c.score}
                        Icon={CATEGORY_ICONS[c.key] ?? Building2}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pros & Cons */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-500">
                      <ThumbsUp className="size-5" />
                      {d.pros}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                          <span className="text-sm text-foreground/90">{p[locale]}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-500">
                      <ThumbsDown className="size-5" />
                      {d.cons}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.cons.map((c, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <XCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
                          <span className="text-sm text-foreground/90">{c[locale]}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Audience fit */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
                  <CardHeader>
                    <CardTitle className="text-emerald-600">{d.whoShouldBook}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AudienceList items={result.whoShouldBook} tone="book" />
                  </CardContent>
                </Card>
                <Card className="border-red-500/20 bg-red-500/[0.03]">
                  <CardHeader>
                    <CardTitle className="text-red-600">{d.whoShouldAvoid}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AudienceList items={result.whoShouldAvoid} tone="avoid" />
                  </CardContent>
                </Card>
              </div>

              {/* Alternatives */}
              <Card>
                <CardHeader>
                  <CardTitle>{d.alternatives}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {result.alternatives.map((alt, i) => (
                      <div
                        key={i}
                        className="group flex flex-col gap-3 rounded-2xl border border-border bg-gradient-to-b from-card to-muted/30 p-5 transition-all hover:border-teal/40 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div className="grid size-10 place-items-center rounded-xl bg-navy text-white">
                            <Hotel className="size-5 text-teal-400" />
                          </div>
                          <div className="text-end">
                            <p className="text-[11px] text-muted-foreground">{d.altScore}</p>
                            <p className="ltr-nums font-display text-xl font-extrabold text-teal">
                              {alt.score}
                            </p>
                          </div>
                        </div>
                        <p className="font-display font-bold text-foreground">{alt.name}</p>
                        <p className="text-sm text-muted-foreground">{alt.reason[locale]}</p>
                      </div>
                    ))}
                  </div>
                  <Button asChild variant="ghost" className="mt-5">
                    <Link href="/compare-hotels">
                      {d.compareCta}
                      <ArrowLeft className="size-4 ltr:rotate-180" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
