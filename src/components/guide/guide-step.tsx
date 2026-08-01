import type { GuideStep as GuideStepDefinition } from "@/lib/guide/types";
import type { Locale } from "@/lib/i18n/config";

export function GuideStep({ step, locale }: { step: GuideStepDefinition; locale: Locale }) {
  return (
    <div className="space-y-3">
      <h2 id="guide-title" className="font-display text-xl font-bold text-foreground">
        {step.title[locale]}
      </h2>
      <p id="guide-description" className="text-sm leading-7 text-muted-foreground">
        {step.body[locale]}
      </p>
    </div>
  );
}
