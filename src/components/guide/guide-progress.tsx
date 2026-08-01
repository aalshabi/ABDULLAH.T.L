import { formatNumber } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

export function GuideProgress({
  current,
  total,
  locale,
  label,
}: {
  current: number;
  total: number;
  locale: Locale;
  label: string;
}) {
  const value = total === 0 ? 0 : Math.round((current / total) * 100);
  const text = label
    .replace("{current}", formatNumber(current, locale))
    .replace("{total}", formatNumber(total, locale));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{text}</span>
        <span className="ltr-nums" aria-hidden="true">{value}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={text}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-teal" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
