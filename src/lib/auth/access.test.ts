import { describe, it, expect } from "vitest";
import {
  parseAdminEmails,
  isAdminEmail,
  evaluateAdminAccess,
  evaluateDashboardAccess,
} from "./access";

describe("parseAdminEmails / isAdminEmail", () => {
  it("normalizes, trims and drops empties", () => {
    expect(parseAdminEmails(" A@x.com , b@Y.com ,")).toEqual(["a@x.com", "b@y.com"]);
    expect(parseAdminEmails("")).toEqual([]);
    expect(parseAdminEmails(undefined)).toEqual([]);
  });
  it("matches case-insensitively and rejects blanks", () => {
    const list = parseAdminEmails("admin@x.com");
    expect(isAdminEmail("Admin@X.com", list)).toBe(true);
    expect(isAdminEmail(null, list)).toBe(false);
    expect(isAdminEmail("other@x.com", list)).toBe(false);
  });
});

describe("evaluateAdminAccess (/admin guard)", () => {
  // (1) unauthenticated user cannot open /admin
  it("redirects an unauthenticated user to /auth", () => {
    expect(
      evaluateAdminAccess({ configured: true, userEmail: null, adminEmailsRaw: "admin@x.com" })
    ).toBe("redirect-auth");
  });

  // (2) signed-in but not in ADMIN_EMAILS cannot open /admin
  it("redirects a signed-in non-admin home", () => {
    expect(
      evaluateAdminAccess({ configured: true, userEmail: "user@x.com", adminEmailsRaw: "admin@x.com" })
    ).toBe("redirect-home");
  });

  it("allows an admin present in the allow-list", () => {
    expect(
      evaluateAdminAccess({
        configured: true,
        userEmail: "Admin@X.com",
        adminEmailsRaw: "admin@x.com, ops@x.com",
      })
    ).toBe("allow");
  });

  // (3) with Supabase not configured, admin is never opened (demo mode)
  it("never opens /admin in demo mode", () => {
    expect(
      evaluateAdminAccess({ configured: false, userEmail: "admin@x.com", adminEmailsRaw: "admin@x.com" })
    ).toBe("redirect-auth");
  });
});

describe("evaluateDashboardAccess (/dashboard guard)", () => {
  it("requires a signed-in user when Supabase is configured", () => {
    expect(evaluateDashboardAccess({ configured: true, hasUser: false })).toBe("redirect-auth");
    expect(evaluateDashboardAccess({ configured: true, hasUser: true })).toBe("allow");
  });
  it("allows demo mode (shown with a local-storage banner)", () => {
    expect(evaluateDashboardAccess({ configured: false, hasUser: false })).toBe("allow");
  });
});
