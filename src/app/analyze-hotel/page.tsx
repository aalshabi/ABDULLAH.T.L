import type { Metadata } from "next";
import { HotelAnalyzer } from "@/components/analyzers/hotel-analyzer";

export const metadata: Metadata = {
  title: "تحليل فندق — Analyze Hotel",
  description:
    "حلّل أي فندق واكشف المراجعات المزيفة والصور المضلّلة والرسوم المخفية قبل الحجز. Detect fake reviews and hidden fees before you book.",
  alternates: { canonical: "/analyze-hotel" },
};

export default function Page() {
  return <HotelAnalyzer />;
}
