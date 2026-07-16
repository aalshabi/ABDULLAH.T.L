import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "الشروط والأحكام — Terms & Conditions",
  description: "مسودة أولية للشروط والأحكام في منصة سافر بوعي التجريبية. Preliminary terms & conditions draft.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <LegalPage doc="terms" />;
}
