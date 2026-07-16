import type { Metadata } from "next";
import { KnowledgeEngine } from "@/components/knowledge-engine";

export const metadata: Metadata = {
  title: "محرك معرفة السفر — Travel Knowledge Engine",
  description:
    "قاعدة معرفة شاملة عن الفنادق والوجهات ونصائح السفر والتأشيرات والطيران والطقس والأنشطة، مع بحث دلالي بالذكاء الاصطناعي. A travel knowledge base covering hotels, destinations, tips, visas, flights, weather and activities with AI semantic search.",
  alternates: { canonical: "/knowledge" },
};

export default function Page() {
  return <KnowledgeEngine />;
}
