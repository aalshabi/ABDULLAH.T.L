import type { Metadata } from "next";
import { DestinationAdvisor } from "@/components/analyzers/destination-advisor";

export const metadata: Metadata = {
  title: "مستشار الوجهات — AI Destination Advisor",
  description:
    "أدخل الدولة والمدينة وتاريخ السفر والميزانية وعدد المسافرين، واحصل على الطقس والازدحام والأسعار والفعاليات والأمان وفنادق موصى بها ومتوسط التكلفة وبرنامج مقترح ودرجة من ١٠٠. Get weather, crowds, prices, events, safety, hotels, average cost and a recommended itinerary.",
  alternates: { canonical: "/analyze-destination" },
};

export default function Page() {
  return <DestinationAdvisor />;
}
