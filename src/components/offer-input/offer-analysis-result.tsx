"use client";

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ListChecks,
  ClipboardCheck,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Bi } from "@/lib/offer-pipeline/types";
import type {
  ChecklistItem,
  ChecklistStatus,
  Contradiction,
  FieldRequirement,
  OfferAnalysis,
} from "@/lib/offer-pipeline/analysis/types";
import { Card, CardContent } from "@/components/ui/card";

function bi(value: Bi, locale: Locale): string {
  return locale === "ar" ? value.ar : value.en;
}

function formatValue(value: unknown, locale: Locale, labels: { yes: string; no: string; adults: string; children: string }): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? labels.yes : labels.no;
  if (typeof value === "number") return formatNumber(value, locale);
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const v = value as Record<string, unknown>;
    if (typeof v.amount === "number" && typeof v.currency === "string") {
      return `${formatNumber(v.amount, locale)} ${v.currency}`;
    }
    if (typeof v.included === "boolean") return v.included ? labels.yes : labels.no;
    if ("adults" in v || "children" in v) {
      const parts: string[] = [];
      if (typeof v.adults === "number") parts.push(`${labels.adults}: ${formatNumber(v.adults, locale)}`);
      if (typeof v.children === "number") parts.push(`${labels.children}: ${formatNumber(v.children, locale)}`);
      return parts.join("، ");
    }
  }
  return String(value);
}

function Section({ id, icon: Icon, title, children }: { id: string; icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className="mb-3 flex items-center gap-2 font-display text-base font-bold text-foreground">
        <Icon className="size-4 text-teal" aria-hidden />
        {title}
      </h3>
      {children}
    </section>
  );
}

/**
 * A secondary section that starts collapsed. The decision-critical parts of the
 * report (completeness, questions, contradictions) stay open; the exhaustive
 * per-field detail is one click away instead of a wall of text.
 */
function FoldableSection({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: LucideIcon;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-xl border border-border">
      <summary className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-3 font-display text-base font-bold text-foreground hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Icon className="size-4 shrink-0 text-teal" aria-hidden />
        <span>{title}</span>
        {count !== undefined && <span className="ltr-nums text-xs font-normal text-muted-foreground">({count})</span>}
        <ChevronDown className="ms-auto size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-border px-4 py-4">{children}</div>
    </details>
  );
}

const CHECK_STATUS: Record<ChecklistStatus, { icon: LucideIcon; className: string }> = {
  present: { icon: CheckCircle2, className: "text-teal-700 dark:text-teal-300" },
  missing: { icon: XCircle, className: "text-muted-foreground" },
  conflicting: { icon: AlertTriangle, className: "text-amber-700 dark:text-amber-400" },
};

export function OfferAnalysisResult({ analysis }: { analysis: OfferAnalysis }) {
  const { t, locale } = useLanguage();
  const r = t.analyzeOffer.v2.result;
  const valueLabels = { yes: r.yes, no: r.no, adults: r.adults, children: r.children };

  const labelByKey = new Map<string, Bi>();
  for (const f of analysis.confirmedFacts) labelByKey.set(f.key, f.label);
  for (const m of analysis.missingFields) labelByKey.set(m.key, m.label);
  for (const c of analysis.checklist) labelByKey.set(c.key, c.label);

  const requirementLabel: Record<FieldRequirement, string> = {
    required: r.reqRequired,
    recommended: r.reqRecommended,
    "context-dependent": r.reqContext,
  };
  const statusLabel: Record<ChecklistStatus, string> = {
    present: r.statusPresent,
    missing: r.statusMissing,
    conflicting: r.statusConflicting,
  };

  return (
    <Card>
      <CardContent className="space-y-8 p-6 md:p-8">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">{r.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{r.note}</p>
        </div>

        {/* Completeness — present / required with the counted fields */}
        <Section id="oa-completeness" icon={ClipboardCheck} title={r.completenessTitle}>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="ltr-nums font-display text-xl font-bold text-foreground">
              {formatNumber(analysis.completeness.present, locale)} {r.completenessOf}{" "}
              {formatNumber(analysis.completeness.required, locale)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{r.completenessCaption}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {analysis.completeness.fields.map((f) => {
                const label = labelByKey.get(f.key);
                const Icon = f.present ? CheckCircle2 : XCircle;
                return (
                  <li
                    key={f.key}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                      f.present ? "border-teal/30 bg-teal/5 text-teal-700 dark:text-teal-300" : "border-border text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {label ? bi(label, locale) : f.key}
                  </li>
                );
              })}
            </ul>
          </div>
        </Section>

        {/* Suggested questions — the most actionable output, kept near the top. */}
        {analysis.suggestedQuestions.length > 0 && (
          <Section id="oa-questions" icon={HelpCircle} title={r.questionsTitle}>
            <ol className="space-y-2">
              {analysis.suggestedQuestions.map((q) => (
                <li key={q.key} className="flex items-start gap-2.5 rounded-xl border border-border p-3 text-sm text-foreground">
                  <HelpCircle className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                  <span>{bi(q.question, locale)}</span>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* Confirmed facts (secondary detail — collapsed) */}
        <FoldableSection icon={ClipboardCheck} title={r.confirmedTitle} count={analysis.confirmedFacts.length}>
          {analysis.confirmedFacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{r.confirmedEmpty}</p>
          ) : (
            <ul className="space-y-3">
              {analysis.confirmedFacts.map((f) => (
                <li key={f.key} className="rounded-xl border border-border p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">{bi(f.label, locale)}</span>
                    <span dir="auto" className="text-sm text-teal-700 dark:text-teal-300">
                      {formatValue(f.value, locale, valueLabels)}
                    </span>
                  </div>
                  <p dir="auto" className="mt-1.5 text-xs text-muted-foreground">
                    <span className="font-medium">{r.evidenceLabel}: </span>
                    <span className="italic">“{f.evidence}”</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </FoldableSection>

        {/* Checklist (secondary detail — collapsed) */}
        <FoldableSection icon={ListChecks} title={r.checklistTitle} count={analysis.checklist.length}>
          <ul className="space-y-2">
            {analysis.checklist.map((item: ChecklistItem) => {
              const s = CHECK_STATUS[item.status];
              const Icon = s.icon;
              return (
                <li key={item.key} className="flex items-start gap-2.5">
                  <Icon className={`mt-0.5 size-4 shrink-0 ${s.className}`} aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">
                      {bi(item.label, locale)}
                      <span className={`ms-2 text-xs ${s.className}`}>({statusLabel[item.status]})</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{bi(item.explanation, locale)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </FoldableSection>

        {/* Missing fields (secondary detail — collapsed) */}
        <FoldableSection icon={XCircle} title={r.missingTitle} count={analysis.missingFields.length}>
          {analysis.missingFields.length === 0 ? (
            <p className="text-sm text-muted-foreground">{r.missingEmpty}</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {analysis.missingFields.map((m) => (
                <li key={m.key} className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-foreground">
                  {bi(m.label, locale)}
                  <span className="text-muted-foreground">· {requirementLabel[m.requirement]}</span>
                </li>
              ))}
            </ul>
          )}
        </FoldableSection>

        {/* Contradictions */}
        <Section id="oa-contradictions" icon={AlertTriangle} title={r.contradictionsTitle}>
          {analysis.contradictions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{r.contradictionsEmpty}</p>
          ) : (
            <ul className="space-y-2">
              {analysis.contradictions.map((c: Contradiction) => (
                <li
                  key={c.code}
                  className={`rounded-xl border p-3 ${
                    c.severity === "critical"
                      ? "border-alarm/40 bg-alarm/5"
                      : "border-amber-500/30 bg-amber-500/5"
                  }`}
                >
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <AlertTriangle
                      className={`size-4 shrink-0 ${c.severity === "critical" ? "text-alarm" : "text-amber-600 dark:text-amber-400"}`}
                      aria-hidden
                    />
                    {bi(c.message, locale)}
                    <span className="text-xs text-muted-foreground">
                      ({c.severity === "critical" ? r.sevCritical : r.sevWarning})
                    </span>
                  </p>
                  {c.evidence.length > 0 && (
                    <p dir="auto" className="mt-1 text-xs italic text-muted-foreground">
                      {c.evidence.map((e) => `“${e}”`).join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </CardContent>
    </Card>
  );
}
