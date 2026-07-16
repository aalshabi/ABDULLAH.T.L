import type { Metadata } from "next";
import { OfferAnalyzer } from "@/components/analyzers/offer-analyzer";

export const metadata: Metadata = {
  title: "تحليل عرض سفر — Analyze Travel Offer",
  description:
    "الصق أي عرض سفر لكشف السعر الحقيقي والترانزيت الوهمي والتكاليف المخفية. Expose the real price and fake transit in any travel offer.",
  alternates: { canonical: "/analyze-offer" },
};

export default function Page() {
  return <OfferAnalyzer />;
}
