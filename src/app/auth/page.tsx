import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "تسجيل الدخول — Authentication",
  description: "سجّل الدخول أو أنشئ حساباً للبدء في سافر بوعي.",
  alternates: { canonical: "/auth" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <AuthForm />
    </Suspense>
  );
}
