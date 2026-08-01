"use client";

import { useEffect } from "react";
import { guideTargetSelector } from "@/lib/guide/selectors";
import type { GuideTarget } from "@/lib/guide/types";

export function GuideSpotlight({
  target,
  onAvailabilityChange,
}: {
  target?: GuideTarget;
  onAvailabilityChange: (available: boolean) => void;
}) {
  useEffect(() => {
    if (!target) {
      onAvailabilityChange(true);
      return;
    }

    const element = document.querySelector<HTMLElement>(guideTargetSelector(target));
    onAvailabilityChange(Boolean(element));
    if (!element) return;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    element.dataset.guideActive = "true";
    element.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });

    const frame = window.requestAnimationFrame(() => {
      const panel = document.querySelector<HTMLElement>("[data-guide-panel]");
      if (!panel || window.innerWidth >= 1280) return;

      const targetRect = element.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const overlap = targetRect.bottom - (panelRect.top - 16);
      if (overlap > 0) {
        window.scrollBy({ top: overlap, behavior: reducedMotion ? "auto" : "smooth" });
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      delete element.dataset.guideActive;
    };
  }, [onAvailabilityChange, target]);

  return null;
}
