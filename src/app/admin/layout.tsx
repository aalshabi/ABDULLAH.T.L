import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";
import { evaluateAdminAccess } from "@/lib/auth/access";

// Always evaluate the guard per-request (never bake a static decision).
export const dynamic = "force-dynamic";

/**
 * Server-side guard for the whole /admin subtree. Runs on the server before
 * any admin UI is sent to the browser, so it cannot be bypassed by tampering
 * with client state. Middleware provides an additional (non-authoritative)
 * layer. ADMIN_EMAILS is a server-only env var (never NEXT_PUBLIC_*).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Demo mode (no Supabase): the admin dashboard is never accessible.
  if (!isSupabaseConfigured) {
    redirect("/auth");
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = (await supabase!.auth.getUser()) ?? { data: { user: null } };

  const decision = evaluateAdminAccess({
    configured: true,
    userEmail: user?.email,
    adminEmailsRaw: process.env.ADMIN_EMAILS,
  });

  if (decision === "redirect-auth") redirect("/auth");
  if (decision === "redirect-home") redirect("/");

  return <>{children}</>;
}
