"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Compass,
  Search,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Users,
  CircleDollarSign,
  ShieldCheck,
  CalendarDays,
  PartyPopper,
  BedDouble,
  Wallet,
  Lightbulb,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/provider";
import {
  adviseDestination,
  ANALYSIS_DELAY_MS,
  type DestinationAdvice,
} from "@/lib/analysis/engine";
import { saveAnalysis } from "@/lib/storage";
import { cn, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { ScoreRing } from "@/components/shared/score-ring";
import { AnalyzerLoading } from "@/components/analyzers/analyzer-loading";

const WEATHER_ICON: Record<string, LucideIcon> = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  snow: Snowflake,
};

function levelStyle(level: "low" | "medium" | "high") {
  return level === "low"
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
    : level === "medium"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
      : "border-red-500/30 bg-red-500/10 text-red-600";
}

export function DestinationAdvisor() {
  const { t, locale } = useLanguage();
  const td = t.analyzeDestination;
  const a = td.advisor;

  const [country, setCountry] = React.useState("");
  const [city, setCity] = React.useState("");
  const [date, setDate] = React.useState("");
  const [budget, setBudget] = React.useState("");
  const [adults, setAdults] = React.useState("2");
  const [children, setChildren] = React.useState("0");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<DestinationAdvice | null>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);

  const currency = locale === "ar" ? "ر.س" : "SAR";

  function levelLabel(level: "low" | "medium" | "high") {
    return level === "low" ? a.levelLow : level === "medium" ? a.levelMedium : a.levelHigh;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!country.trim() || !city.trim()) {
      toast.error(a.needPlace);
      return;
    }
    setLoading(true);
    setResult(null);
    const month = date ? new Date(date).getMonth() : new Date().getMonth();
    await new Promise((r) => setTimeout(r, ANALYSIS_DELAY_MS));
    const res = adviseDestination(
      {
        country,
        city,
        month: Number.isNaN(month) ? new Date().getMonth() : month,
        budget: budget ? Number(budget) : null,
        adults: Math.max(1, Number(adults) || 1),
        children: Math.max(0, Number(children) || 0),
      },
      locale
    );
    setResult(res);
    setLoading(false);
    saveAnalysis({ type: "destination", title: `${city.trim()}، ${country.trim()}`, score: res.score });
    toast.success(`${a.scoreLabel}: ${res.score}/100`);
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  const WeatherIcon = result ? WEATHER_ICON[result.weather.icon] ?? Sun : Sun;

  return (
    <>
      <PageHeader icon={Compass} title={td.title} subtitle={td.subtitle} />
      <div className="container -mt-8 pb-20">
        <Card className="mx-auto max-w-2xl shadow-xl">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="d-country">{a.country}</Label>
                  <Input
                    id="d-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder={a.countryPlaceholder}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-city">{a.city}</Label>
                  <Input
                    id="d-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={a.cityPlaceholder}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="d-date">{a.travelDate}</Label>
                  <Input
                    id="d-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="ltr-nums"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-budget">{a.budget}</Label>
                  <Input
                    id="d-budget"
                    type="number"
                    inputMode="numeric"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder={a.budgetPlaceholder}
                    className="ltr-nums"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="d-adults">{a.adults}</Label>
                  <Input
                    id="d-adults"
                    type="number"
                    min={1}
                    value={adults}
                    onChange={(e) => setAdults(e.target.value)}
                    className="ltr-nums"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="d-children">{a.children}</Label>
                  <Input
                    id="d-children"
                    type="number"
                    min={0}
                    value={children}
                    onChange={(e) => setChildren(e.target.value)}
                    className="ltr-nums"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  a.advising
                ) : (
                  <>
                    <Search className="size-4" />
                    {a.adviseCta}
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
              {/* Hero */}
              <Card>
                <div className="grid gap-6 p-8 md:grid-cols-[auto_1fr] md:items-center">
                  <div className="mx-auto md:mx-0">
                    <ScoreRing score={result.score} size={168} label={a.scoreLabel} />
                  </div>
                  <div className="text-center md:text-start">
                    <h2 className="font-display text-2xl font-extrabold text-foreground">
                      {city.trim()}
                      {country.trim() ? `، ${country.trim()}` : ""}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                      {result.summary[locale]}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Conditions grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="flex flex-col gap-2 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground">{a.weather}</span>
                      <WeatherIcon className="size-6 text-teal" />
                    </div>
                    <span className="ltr-nums font-display text-3xl font-extrabold text-foreground">
                      {result.weather.tempC}°
                    </span>
                    <span className="text-sm text-muted-foreground">{result.weather.condition[locale]}</span>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex flex-col gap-2 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground">{a.crowd}</span>
                      <Users className="size-6 text-teal" />
                    </div>
                    <Badge className={cn("w-fit", levelStyle(result.crowdLevel.level))}>
                      {levelLabel(result.crowdLevel.level)}
                    </Badge>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {result.crowdLevel.note[locale]}
                    </span>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex flex-col gap-2 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground">{a.price}</span>
                      <CircleDollarSign className="size-6 text-teal" />
                    </div>
                    <Badge className={cn("w-fit", levelStyle(result.priceLevel.level))}>
                      {levelLabel(result.priceLevel.level)}
                    </Badge>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {result.priceLevel.note[locale]}
                    </span>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex flex-col gap-2 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground">{a.safetyTitle}</span>
                      <ShieldCheck className="size-6 text-teal" />
                    </div>
                    <span className="ltr-nums font-display text-3xl font-extrabold text-foreground">
                      {result.safety.score}
                    </span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {result.safety.note[locale]}
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PartyPopper className="size-5 text-teal" />
                    {a.events}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {result.events.map((ev, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3.5"
                      >
                        <CalendarDays className="size-5 shrink-0 text-teal" />
                        <div>
                          <p className="font-semibold text-foreground">{ev.name[locale]}</p>
                          <p className="text-xs text-muted-foreground">{ev.when[locale]}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Recommended hotels */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BedDouble className="size-5 text-teal" />
                    {a.hotels}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {result.recommendedHotels.map((h, i) => (
                      <div
                        key={i}
                        className="flex flex-col gap-2 rounded-2xl border border-border bg-gradient-to-b from-card to-muted/30 p-5 transition-all hover:border-teal/40 hover:shadow-md"
                      >
                        <p className="font-display font-bold text-foreground">{h.name[locale]}</p>
                        <p className="ltr-nums text-sm text-teal">{"★".repeat(h.stars)}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3.5" />
                          {h.area[locale]}
                        </p>
                        <p className="ltr-nums mt-auto pt-2 font-display text-lg font-extrabold text-foreground">
                          {formatNumber(h.pricePerNight, locale)} {currency}
                          <span className="text-xs font-normal text-muted-foreground"> {a.perNight}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Average cost */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="size-5 text-teal" />
                    {a.avgCost}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {result.averageCost.breakdown.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2.5 text-sm"
                      >
                        <span className="text-foreground">{b.label[locale]}</span>
                        <span className="ltr-nums font-semibold text-foreground">
                          {formatNumber(b.amount, locale)} {currency}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal/30 bg-teal/5 px-5 py-4">
                    <div>
                      <p className="text-xs text-muted-foreground">{a.perPersonDay}</p>
                      <p className="ltr-nums font-display text-xl font-extrabold text-foreground">
                        {formatNumber(result.averageCost.perPersonPerDay, locale)} {currency}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="text-xs text-muted-foreground">
                        {a.totalTrip} · {a.forNights} {result.averageCost.days} {a.nights}
                      </p>
                      <p className="ltr-nums font-display text-2xl font-extrabold text-teal">
                        {formatNumber(result.averageCost.total, locale)} {currency}
                      </p>
                    </div>
                    {result.averageCost.budgetFit !== "none" && (
                      <Badge
                        className={
                          result.averageCost.budgetFit === "under"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                            : "border-red-500/30 bg-red-500/10 text-red-600"
                        }
                      >
                        {result.averageCost.budgetFit === "under" ? a.budgetUnder : a.budgetOver}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Itinerary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="size-5 text-teal" />
                    {a.itinerary}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="relative space-y-5 border-s-2 border-dashed border-border ps-6">
                    {result.itinerary.map((item) => (
                      <li key={item.day} className="relative">
                        <span className="absolute -start-[31px] grid size-6 place-items-center rounded-full bg-teal text-[11px] font-bold text-white ltr-nums">
                          {item.day}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {a.day} {item.day}
                        </p>
                        <p className="font-semibold text-foreground">{item.title[locale]}</p>
                        <p className="text-xs text-muted-foreground">{item.detail[locale]}</p>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
