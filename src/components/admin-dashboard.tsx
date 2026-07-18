"use client";

import * as React from "react";
import {
  Users,
  Search as SearchIcon,
  Eye,
  Percent,
  TrendingUp,
  TrendingDown,
  Building2,
  Compass,
  Tag,
  BarChart3,
  BookOpen,
  Download,
  ShieldQuestion,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/provider";
import { getAnalyses } from "@/lib/storage";
import { buildAdminData, toCsv, type AdminData, type RankItem } from "@/lib/admin-analytics";
import { cn, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { VisitorsChart } from "@/components/admin/visitors-chart";

const TOOL_ICONS: Record<string, LucideIcon> = {
  hotel: Building2,
  destination: Compass,
  offer: Tag,
  compare: BarChart3,
  knowledge: BookOpen,
};

function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  suffix,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: number;
  suffix?: string;
}) {
  const { t } = useLanguage();
  const up = delta >= 0;
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="grid size-10 place-items-center rounded-xl bg-teal/10 text-teal">
            <Icon className="size-5" />
          </div>
          <span
            className={cn(
              "ltr-nums inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
              up ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
            )}
          >
            {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {up ? "+" : ""}
            {delta}%
          </span>
        </div>
        <p className="ltr-nums font-display text-2xl font-extrabold text-foreground">
          {value}
          {suffix}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/70">{t.admin.vsPrev}</p>
      </CardContent>
    </Card>
  );
}

function RankList({ items, unit }: { items: RankItem[]; unit: string }) {
  const { locale } = useLanguage();
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={item.name} className="flex items-center gap-3">
          <span
            className={cn(
              "grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold ltr-nums",
              i === 0 ? "bg-teal text-white" : "bg-muted text-muted-foreground"
            )}
          >
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
              <span className="ltr-nums shrink-0 text-xs font-semibold text-muted-foreground">
                {formatNumber(item.count, locale)} {unit}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-teal/70"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function AdminDashboard() {
  const { t, locale } = useLanguage();
  const ad = t.admin;
  const [data, setData] = React.useState<AdminData | null>(null);

  React.useEffect(() => {
    setData(buildAdminData(locale, getAnalyses(), new Date()));
  }, [locale]);

  function exportCsv() {
    if (!data) return;
    const labels = {
      metric: locale === "ar" ? "المؤشر" : "Metric",
      value: locale === "ar" ? "القيمة" : "Value",
      count: locale === "ar" ? "العدد" : "Count",
      kUsers: ad.kUsers,
      kSearches: ad.kSearches,
      kVisitors: ad.kVisitors,
      kConversion: ad.kConversion,
      topHotels: ad.topHotels,
      topDestinations: ad.topDestinations,
      topOffers: ad.topOffers,
      visitorsTitle: ad.visitorsTitle,
    };
    download("safer-bewae-report.csv", "﻿" + toCsv(data, labels), "text/csv;charset=utf-8");
    toast.success(ad.exported);
  }

  function exportJson() {
    if (!data) return;
    download("safer-bewae-report.json", JSON.stringify(data, null, 2), "application/json");
    toast.success(ad.exported);
  }

  const totalTool = data ? data.searchesByTool.reduce((s, x) => s + x.value, 0) : 1;

  return (
    <>
      <PageHeader icon={ShieldQuestion} title={ad.title} subtitle={ad.subtitle} />
      <div className="container -mt-8 space-y-6 pb-20">
        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="warning">{ad.demoBadge}</Badge>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={!data}>
              <Download className="size-4" />
              {ad.exportCsv}
            </Button>
            <Button variant="outline" size="sm" onClick={exportJson} disabled={!data}>
              <Download className="size-4" />
              {ad.exportJson}
            </Button>
          </div>
        </div>

        {!data ? (
          <div className="grid h-64 place-items-center">
            <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-teal" />
          </div>
        ) : (
          <>
            {/* KPI row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard icon={Users} label={ad.kUsers} value={formatNumber(data.users, locale)} delta={data.usersDelta} />
              <KpiCard
                icon={SearchIcon}
                label={ad.kSearches}
                value={formatNumber(data.searches, locale)}
                delta={data.searchesDelta}
              />
              <KpiCard
                icon={Eye}
                label={ad.kVisitors}
                value={formatNumber(data.visitorsToday, locale)}
                delta={data.visitorsDelta}
              />
              <KpiCard
                icon={Percent}
                label={ad.kConversion}
                value={String(data.conversion)}
                suffix="%"
                delta={data.conversionDelta}
              />
            </div>

            {/* Visitors chart + searches by tool */}
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{ad.visitorsTitle}</span>
                    <span className="text-xs font-normal text-muted-foreground">{ad.visitorsSub}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VisitorsChart series={data.visitorSeries} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{ad.searchesByTool}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.searchesByTool
                    .slice()
                    .sort((a, b) => b.value - a.value)
                    .map((tool) => {
                      const Icon = TOOL_ICONS[tool.key] ?? SearchIcon;
                      const pct = Math.round((tool.value / totalTool) * 100);
                      return (
                        <div key={tool.key} className="flex items-center gap-3">
                          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy text-white">
                            <Icon className="size-4 text-teal-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="truncate font-medium text-foreground">
                                {ad.tools[tool.key as keyof typeof ad.tools]}
                              </span>
                              <span className="ltr-nums text-xs font-semibold text-muted-foreground">
                                {formatNumber(tool.value, locale)}
                              </span>
                            </div>
                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>
            </div>

            {/* Rankings */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="size-5 text-teal" />
                    {ad.topHotels}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RankList items={data.topHotels} unit={ad.analysesUnit} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="size-5 text-teal" />
                    {ad.topDestinations}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RankList items={data.topDestinations} unit={ad.searchesUnit} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="size-5 text-teal" />
                    {ad.topOffers}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RankList items={data.topOffers} unit={ad.searchesUnit} />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}
