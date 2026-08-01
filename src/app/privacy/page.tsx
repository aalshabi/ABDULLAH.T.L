import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "سياسة الخصوصية — Privacy Policy",
  description: "سياسة خصوصية سافر بوعي لنطاق ما قبل الإطلاق وبحث هوية الفندق المخطط. SafrBwai pre-launch privacy disclosures.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return <LegalPage doc="privacy" />;
}
