import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard-view";

export const metadata: Metadata = {
  title: "لوحة التحكم — Dashboard",
  description: "كل تحليلاتك ورحلاتك وتوفيراتك في مكان واحد.",
  alternates: { canonical: "/dashboard" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <DashboardView />;
}
