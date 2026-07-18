import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "سياسة الخصوصية — Privacy Policy",
  description: "مسودة أولية لسياسة الخصوصية في منصة سافر بوعي التجريبية. Preliminary privacy policy draft.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return <LegalPage doc="privacy" />;
}
