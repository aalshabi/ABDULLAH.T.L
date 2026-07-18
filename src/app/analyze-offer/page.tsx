import type { Metadata } from "next";
import { OfferAnalyzer } from "@/components/analyzers/offer-analyzer";

export const metadata: Metadata = {
  title: "حلّل عرض سفرك — Analyze your travel offer",
  description:
    "ألصق تفاصيل العرض أو ارفع الملف أو الصورة أو أدخل الرابط، وراجع مدخلاتك قبل الحجز. محرك التحليل الحقيقي قيد التطوير. Enter your offer by text, PDF, image or link and review it before booking — the real analysis engine is under development.",
  alternates: { canonical: "/analyze-offer" },
};

export default function Page() {
  return <OfferAnalyzer />;
}
