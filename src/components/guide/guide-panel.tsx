"use client";

import * as React from "react";
import Link from "next/link";
import { RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { GuideStep as GuideStepDefinition } from "@/lib/guide/types";
import type { Locale } from "@/lib/i18n/config";
import { GuideProgress } from "./guide-progress";
import { GuideStep } from "./guide-step";

type GuidePanelProps = {
  step: GuideStepDefinition;
  locale: Locale;
  copy: Dictionary["guide"];
  current: number;
  total: number;
  targetAvailable: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  onFinish: () => void;
  onClose: () => void;
  onRestart: () => void;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function GuidePanel({
  step,
  locale,
  copy,
  current,
  total,
  targetAvailable,
  onPrevious,
  onNext,
  onSkip,
  onFinish,
  onClose,
  onRestart,
}: GuidePanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const isLast = current === total;

  React.useEffect(() => {
    panelRef.current?.querySelector<HTMLButtonElement>("[data-guide-initial-focus]")?.focus();
  }, []);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
    ).filter((element) => !element.hasAttribute("disabled"));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-40 bg-navy/25" aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        aria-describedby="guide-description"
        data-guide-panel
        dir={locale === "ar" ? "rtl" : "ltr"}
        onKeyDown={onKeyDown}
        className="fixed inset-x-0 bottom-0 z-[60] max-h-[55dvh] overflow-y-auto rounded-t-3xl border border-border bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl xl:inset-y-0 xl:end-0 xl:start-auto xl:max-h-none xl:w-[19rem] xl:rounded-none xl:border-y-0 xl:border-e-0 xl:border-s xl:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-sm font-bold text-teal">{copy.name}</p>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={onRestart}>
              <RotateCcw className="size-4" aria-hidden />
              <span className="hidden min-[360px]:inline">{copy.restart}</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label={copy.close}
              data-guide-initial-focus
            >
              <X className="size-5" aria-hidden />
            </Button>
          </div>
        </div>

        <div className="mt-5">
          <GuideProgress current={current} total={total} locale={locale} label={copy.progress} />
        </div>

        <div className="mt-7">
          <GuideStep step={step} locale={locale} />
          {!targetAvailable && step.target && (
            <p role="status" className="mt-4 rounded-xl border border-border bg-muted/50 p-3 text-xs leading-6 text-muted-foreground">
              {copy.targetUnavailable}
            </p>
          )}
          {step.href && (
            <Button asChild className="mt-5 w-full">
              <Link href={step.href}>{copy.openAnalyzer}</Link>
            </Button>
          )}
        </div>

        <p aria-live="polite" className="sr-only">
          {copy.progress.replace("{current}", String(current)).replace("{total}", String(total))}
        </p>

        <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-5">
          <Button type="button" variant="ghost" onClick={onSkip} className="me-auto">
            {copy.skip}
          </Button>
          <Button type="button" variant="outline" onClick={onPrevious} disabled={current === 1}>
            {copy.previous}
          </Button>
          {isLast ? (
            <Button type="button" onClick={onFinish}>{copy.finish}</Button>
          ) : (
            <Button type="button" onClick={onNext}>{copy.next}</Button>
          )}
        </div>
      </div>
    </>
  );
}
