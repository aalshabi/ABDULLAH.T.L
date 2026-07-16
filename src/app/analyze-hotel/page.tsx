import type { Metadata } from "next";
import { HotelAnalyzer } from "@/components/analyzers/hotel-analyzer";

export const metadata: Metadata = {
  title: "تحليل فندق — AI Hotel Analyzer",
  description:
    "الصق اسم أو رابط أي فندق لتقييم شامل: درجة من ١٠٠، القيمة والموقع والعائلات وشهر العسل والفخامة والطعام، الإيجابيات والسلبيات، ومن يناسبه، وبدائل مقترحة. A full AI hotel report: score out of 100, category ratings, pros/cons, audience fit and alternatives.",
  alternates: { canonical: "/analyze-hotel" },
};

export default function Page() {
  return <HotelAnalyzer />;
}
