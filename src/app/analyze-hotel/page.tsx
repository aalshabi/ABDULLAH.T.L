import type { Metadata } from "next";
import { HotelAnalyzer } from "@/components/analyzers/hotel-analyzer";

export const metadata: Metadata = {
  title: "مراجعة فندق — Hotel review (preview)",
  description:
    "معاينة قبل الإطلاق لأداة مراجعة عرض الفندق؛ المراجعة الفعلية غير مفعّلة بعد. Pre-launch preview of a hotel-offer review tool; real review is not enabled yet.",
  alternates: { canonical: "/analyze-hotel" },
};

export default function Page() {
  return <HotelAnalyzer />;
}
