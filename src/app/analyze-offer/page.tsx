import type { Metadata } from "next";
import { OfferAnalyzer } from "@/components/analyzers/offer-analyzer";

export const metadata: Metadata = {
  title: "حلّل عرض سفرك — Analyze your travel offer",
  description:
    "ألصق نص عرض السفر وراجع المعلومات المذكورة فيه قبل الحجز. تحليل النص متاح في النسخة التجريبية المحدودة. Paste travel offer text and review the stated information before booking. Text analysis is available in the Limited Beta.",
  alternates: { canonical: "/analyze-offer" },
};

export default function Page() {
  return <OfferAnalyzer />;
}
