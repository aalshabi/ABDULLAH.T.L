import type { Metadata } from "next";
import { CompareHotels } from "@/components/analyzers/compare-hotels";

export const metadata: Metadata = {
  title: "مقارنة الفنادق — Compare Hotels",
  description:
    "قارن حتى أربعة فنادق جنباً إلى جنب باتخاذ قرار موضوعي. Compare up to four hotels side by side on objective criteria.",
  alternates: { canonical: "/compare-hotels" },
};

export default function Page() {
  return <CompareHotels />;
}
