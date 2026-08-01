"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/provider";
import { GUIDE_CONFIG } from "@/lib/guide/config";
import { getGuideDefinition } from "@/lib/guide/routes";
import { guideTargetSelector, isGuideRoute } from "@/lib/guide/selectors";
import { GUIDE_STORAGE_VERSION, readGuideState, writeGuideState } from "@/lib/guide/storage";
import { GuideLauncher } from "./guide-launcher";
import { GuidePanel } from "./guide-panel";
import { GuideSpotlight } from "./guide-spotlight";

export function GuideProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale, t } = useLanguage();
  const launcherRef = React.useRef<HTMLButtonElement>(null);
  const autoStartedRef = React.useRef(false);
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [targetAvailable, setTargetAvailable] = React.useState(true);

  const route = isGuideRoute(pathname) ? pathname : null;
  const definition = route ? getGuideDefinition(route) : null;
  const step = definition?.steps[stepIndex];

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    setOpen(false);
    setStepIndex(0);
    setTargetAvailable(true);
  }, [pathname]);

  React.useEffect(() => {
    if (
      !mounted ||
      !GUIDE_CONFIG.autoStartOnFirstOfferVisit ||
      route !== "/analyze-offer" ||
      !definition ||
      autoStartedRef.current ||
      window.innerWidth < GUIDE_CONFIG.minimumAutoStartWidth
    ) {
      return;
    }

    const saved = readGuideState();
    if (saved.completed || saved.skipped || saved.lastRoute === route) return;
    const firstTarget = definition.steps[0]?.target;
    if (firstTarget && !document.querySelector(guideTargetSelector(firstTarget))) return;
    if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;

    const timer = window.setTimeout(() => {
      autoStartedRef.current = true;
      writeGuideState({ ...saved, lastRoute: route, version: GUIDE_STORAGE_VERSION });
      setOpen(true);
    }, GUIDE_CONFIG.autoStartDelayMs);

    return () => window.clearTimeout(timer);
  }, [definition, mounted, route]);

  const restoreLauncherFocus = React.useCallback(() => {
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);

  function startGuide() {
    if (!route) return;
    const saved = readGuideState();
    writeGuideState({ ...saved, lastRoute: route, version: GUIDE_STORAGE_VERSION });
    setStepIndex(0);
    setOpen(true);
  }

  function closeGuide() {
    setOpen(false);
    restoreLauncherFocus();
  }

  function skipGuide() {
    if (!route) return;
    writeGuideState({ completed: false, skipped: true, lastRoute: route, version: GUIDE_STORAGE_VERSION });
    closeGuide();
  }

  function finishGuide() {
    if (!route) return;
    writeGuideState({ completed: true, skipped: false, lastRoute: route, version: GUIDE_STORAGE_VERSION });
    closeGuide();
  }

  function restartGuide() {
    if (!route) return;
    writeGuideState({ completed: false, skipped: false, lastRoute: route, version: GUIDE_STORAGE_VERSION });
    setStepIndex(0);
    setOpen(true);
  }

  return (
    <>
      {children}
      {mounted && definition && (
        <>
          <GuideLauncher ref={launcherRef} label={t.guide.launcher} onOpen={startGuide} />
          {open && step && (
            <>
              <GuideSpotlight target={step.target} onAvailabilityChange={setTargetAvailable} />
              <GuidePanel
                step={step}
                locale={locale}
                copy={t.guide}
                current={stepIndex + 1}
                total={definition.steps.length}
                targetAvailable={targetAvailable}
                onPrevious={() => setStepIndex((index) => Math.max(0, index - 1))}
                onNext={() => setStepIndex((index) => Math.min(definition.steps.length - 1, index + 1))}
                onSkip={skipGuide}
                onFinish={finishGuide}
                onClose={closeGuide}
                onRestart={restartGuide}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
