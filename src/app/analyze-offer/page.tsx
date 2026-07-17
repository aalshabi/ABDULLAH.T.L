import type { Metadata } from "next";
import { OfferAnalyzer } from "@/components/analyzers/offer-analyzer";

export const metadata: Metadata = {
  title: "مراجعة عرض سفر — Offer review (preview)",
  description:
    "معاينة أداة رفع عروض السفر — الاستخراج الفعلي (قراءة الملف/OCR) قيد التطوير ولم يُفعّل بعد. Preview of the offer-upload tool — real extraction (file reading / OCR) is under development.",
  alternates: { canonical: "/analyze-offer" },
};

export default function Page() {
  return <OfferAnalyzer />;
}
