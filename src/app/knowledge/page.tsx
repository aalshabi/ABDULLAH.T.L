import type { Metadata } from "next";
import { KnowledgeGrid } from "@/components/knowledge-grid";

export const metadata: Metadata = {
  title: "معرفة السفر — Travel Knowledge",
  description:
    "مكتبة من الأدلة العملية لكشف كل خدعة سفر قبل أن تقع فيها. A library of practical guides to spot every travel trick.",
  alternates: { canonical: "/knowledge" },
};

export default function Page() {
  return <KnowledgeGrid />;
}
