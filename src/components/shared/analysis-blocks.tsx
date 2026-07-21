"use client";

import { AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import { scoreLabelKey } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

/** A single named metric bar (0–100). */
export interface Metric {
  key: string;
  score: number;
}

export function VerdictBadge({ score }: { score: number }) {
  const { t } = useLanguage();
  const key = scoreLabelKey(score);
  const variant =
    key === "excellent" ? "success" : key === "good" ? "default" : key === "caution" ? "warning" : "danger";
  return (
    <Badge variant={variant} className="px-4 py-1.5 text-sm">
      {t.verdicts[key]}
    </Badge>
  );
}

export function MetricBars({
  metrics,
  labels,
}: {
  metrics: Metric[];
  labels: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      {metrics.map((m) => (
        <div key={m.key} className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{labels[m.key] ?? m.key}</span>
            <span className="ltr-nums font-semibold text-muted-foreground">{m.score}%</span>
          </div>
          <Progress value={m.score} />
        </div>
      ))}
    </div>
  );
}

export function FlagList({
  items,
  tone,
}: {
  items: { ar: string; en: string }[];
  tone: "red" | "green";
}) {
  const { locale } = useLanguage();
  if (items.length === 0) return null;
  const Icon = tone === "red" ? AlertTriangle : CheckCircle2;
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <Icon
            className={`mt-0.5 size-5 shrink-0 ${tone === "red" ? "text-red-500" : "text-emerald-500"}`}
          />
          <span className="text-sm text-foreground/90">{item[locale]}</span>
        </li>
      ))}
    </ul>
  );
}

export function Recommendation({ text }: { text: { ar: string; en: string } }) {
  const { locale } = useLanguage();
  return (
    <div className="flex items-start gap-3 rounded-xl border border-teal/30 bg-teal/5 p-4">
      <Lightbulb className="mt-0.5 size-5 shrink-0 text-teal" />
      <p className="text-sm font-medium text-foreground">{text[locale]}</p>
    </div>
  );
}
