import type { Metadata } from "next";
import { OfferAnalyzer } from "@/components/analyzers/offer-analyzer";

export const metadata: Metadata = {
  title: "تحليل عرض سفر — AI Offer Analyzer",
  description:
    "ارفع عرض السفر (PDF أو صورة أو لقطة واتساب) لاستخراج تفاصيله وتحليل الخدمات الناقصة والتكاليف المخفية، مع درجة شفافية وعدالة سعر ومخاطر رحلة. Upload a PDF, image or WhatsApp screenshot to extract and analyze any travel offer.",
  alternates: { canonical: "/analyze-offer" },
};

export default function Page() {
  return <OfferAnalyzer />;
}
