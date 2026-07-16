/**
 * Pure, dependency-free access-control helpers.
 *
 * These are intentionally decoupled from Supabase so they can be unit-tested
 * in isolation. The server (layout / middleware) resolves the real user +
 * env, then delegates the decision to these functions.
 */

/** Parse a comma-separated ADMIN_EMAILS env value into a normalized list. */
export function parseAdminEmails(raw?: string | null): string[] {
  return (raw ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** True only when a concrete email is present in the admin allow-list. */
export function isAdminEmail(email: string | null | undefined, admins: string[]): boolean {
  if (!email) return false;
  return admins.includes(email.toLowerCase());
}

export type AdminDecision = "allow" | "redirect-auth" | "redirect-home";

/**
 * Authoritative admin-access decision.
 * - Demo mode (Supabase not configured): never allow the admin dashboard.
 * - Not signed in: send to /auth.
 * - Signed in but not in ADMIN_EMAILS: send home (no access).
 */
export function evaluateAdminAccess(opts: {
  configured: boolean;
  userEmail?: string | null;
  adminEmailsRaw?: string | null;
}): AdminDecision {
  if (!opts.configured) return "redirect-auth";
  if (!opts.userEmail) return "redirect-auth";
  const admins = parseAdminEmails(opts.adminEmailsRaw);
  return isAdminEmail(opts.userEmail, admins) ? "allow" : "redirect-home";
}

export type DashboardDecision = "allow" | "redirect-auth";

/**
 * Dashboard-access decision.
 * - When Supabase is configured, a signed-in user is required.
 * - In demo mode (not configured) the page is shown with a clear "local,
 *   temporary, not tied to a real account" banner — no auth to enforce.
 */
export function evaluateDashboardAccess(opts: {
  configured: boolean;
  hasUser: boolean;
}): DashboardDecision {
  if (opts.configured && !opts.hasUser) return "redirect-auth";
  return "allow";
}
