import type { Metadata } from "next";
import { AuthUnavailable } from "@/components/auth-unavailable";

export const metadata: Metadata = {
  title: "الحسابات غير متاحة — Accounts unavailable",
  description:
    "الحسابات غير مفعّلة في إصدار ما قبل الإطلاق الحالي. Accounts are not enabled in the current pre-launch release.",
  alternates: { canonical: "/auth" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AuthUnavailable />;
}
