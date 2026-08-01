import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "الشروط والأحكام — Terms & Conditions",
  description: "شروط سافر بوعي لنطاق ما قبل الإطلاق وبيانات الفنادق الرسمية المخططة. SafrBwai pre-launch terms.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <LegalPage doc="terms" />;
}
