import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardView } from "@/components/dashboard-view";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";
import { evaluateDashboardAccess } from "@/lib/auth/access";

export const metadata: Metadata = {
  title: "لوحة التحكم — Dashboard",
  description: "كل تحليلاتك ورحلاتك وتوفيراتك في مكان واحد.",
  alternates: { canonical: "/dashboard" },
  robots: { index: false, follow: false },
};

export default async function Page() {
  // When Supabase is configured, a signed-in user is required. In demo mode
  // the page renders with an explicit "local temporary storage" banner
  // (handled inside DashboardView) instead of implying a real account.
  let hasUser = false;
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = (await supabase!.auth.getUser()) ?? { data: { user: null } };
    hasUser = Boolean(user);
  }

  if (evaluateDashboardAccess({ configured: isSupabaseConfigured, hasUser }) === "redirect-auth") {
    redirect("/auth");
  }

  return <DashboardView />;
}
