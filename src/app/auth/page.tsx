import type { Metadata } from "next";
import { AuthUnavailable } from "@/components/auth-unavailable";

export const metadata: Metadata = {
  title: "الحسابات غير متاحة — Accounts unavailable",
  description:
    "الحسابات غير مفعّلة في الـBeta المغلقة الحالية. Accounts are not enabled in the current Closed Beta.",
  alternates: { canonical: "/auth" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AuthUnavailable />;
}
