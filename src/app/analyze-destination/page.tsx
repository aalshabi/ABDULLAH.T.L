import type { Metadata } from "next";
import { DestinationAdvisor } from "@/components/analyzers/destination-advisor";

export const metadata: Metadata = {
  title: "مراجعة وجهة — Destination review (preview)",
  description:
    "معاينة أداة لمراجعة عوامل الوجهة قبل السفر — مشروع تجريبي قيد التطوير، لم يتم التحقق بعد. Preview of a destination-review tool — experimental, under development.",
  alternates: { canonical: "/analyze-destination" },
};

export default function Page() {
  return <DestinationAdvisor />;
}
