import type { GuideRoute, GuideTarget } from "./types";

export const GUIDE_ROUTES: readonly GuideRoute[] = [
  "/",
  "/analyze-offer",
  "/analyze-hotel",
  "/analyze-destination",
  "/compare-hotels",
  "/knowledge",
  "/dashboard",
];

export function isGuideRoute(value: string): value is GuideRoute {
  return (GUIDE_ROUTES as readonly string[]).includes(value);
}

export function guideTargetSelector(target: GuideTarget): string {
  return `[data-guide-id="${target}"]`;
}
