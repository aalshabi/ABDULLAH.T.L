import type { Metadata } from "next";
import { DestinationAnalyzer } from "@/components/analyzers/destination-analyzer";

export const metadata: Metadata = {
  title: "تحليل وجهة — Analyze Destination",
  description:
    "قيّم أي وجهة قبل السفر: السلامة، أفضل موسم، التكلفة الحقيقية والفخاخ السياحية. Rate safety, season, real cost and tourist traps.",
  alternates: { canonical: "/analyze-destination" },
};

export default function Page() {
  return <DestinationAnalyzer />;
}
