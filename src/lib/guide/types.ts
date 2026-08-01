import type { Locale } from "@/lib/i18n/config";
import type { ProductCapabilityKey } from "@/lib/product/capabilities";

export type GuideRoute =
  | "/"
  | "/analyze-offer"
  | "/analyze-hotel"
  | "/analyze-destination"
  | "/compare-hotels"
  | "/knowledge"
  | "/dashboard";

export type GuideTarget =
  | "offer-source-text"
  | "offer-textarea"
  | "offer-review"
  | "offer-submit"
  | "result-confirmed"
  | "result-missing"
  | "result-contradictions"
  | "result-questions"
  | "copy-questions"
  | "copy-summary";

export type LocalizedGuideText = Readonly<Record<Locale, string>>;

export type GuideStep = Readonly<{
  id: string;
  route: GuideRoute;
  target?: GuideTarget;
  title: LocalizedGuideText;
  body: LocalizedGuideText;
  href?: GuideRoute;
  capability?: ProductCapabilityKey;
}>;

export type GuideDefinition = Readonly<{
  route: GuideRoute;
  steps: readonly GuideStep[];
}>;
