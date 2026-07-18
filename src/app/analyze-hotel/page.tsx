import type { Metadata } from "next";
import { HotelAnalyzer } from "@/components/analyzers/hotel-analyzer";

export const metadata: Metadata = {
  title: "مراجعة فندق — Hotel review (preview)",
  description:
    "معاينة أداة لمراجعة إشارات الفندق قبل الحجز — مشروع تجريبي قيد التطوير، لم يتم التحقق بعد. Preview of a hotel-review tool — experimental, under development.",
  alternates: { canonical: "/analyze-hotel" },
};

export default function Page() {
  return <HotelAnalyzer />;
}
