import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "لوحة الإدارة — Admin Dashboard",
  description: "نظرة شاملة على أداء المنصة: المستخدمون، عمليات البحث، الوجهات والعروض الأكثر رواجاً، والزوار ومعدل التحويل.",
  alternates: { canonical: "/admin" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminDashboard />;
}
