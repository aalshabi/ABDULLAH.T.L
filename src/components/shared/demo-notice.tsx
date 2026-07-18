"use client";

import { FlaskConical, Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Prominent, unmissable notice shown ABOVE every analysis result to make clear
 * the output is generated for UX demonstration and is not based on real data.
 */
export function DemoNotice({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm font-medium text-amber-800 dark:text-amber-300",
        className
      )}
    >
      <FlaskConical className="mt-0.5 size-5 shrink-0" />
      <span>{t.demo.badge}</span>
    </div>
  );
}

/**
 * Inline placeholder that replaces any decisive verdict / concrete money /
 * fairness claim while the engine is demo-only. Keeps the layout, removes the
 * misleading claim.
 */
export function DemoUnavailable({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground",
        className
      )}
    >
      <Lock className="size-4 shrink-0" />
      <span>{t.demo.unavailable}</span>
    </div>
  );
}
