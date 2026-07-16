import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";
import { isAdminEmail, parseAdminEmails } from "@/lib/auth/access";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

function redirectTo(path: string, request: NextRequest, from?: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  const res = NextResponse.redirect(url);
  from?.cookies.getAll().forEach((c) => res.cookies.set(c));
  return res;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminPath = path === "/admin" || path.startsWith("/admin/");
  const isDashboardPath = path === "/dashboard" || path.startsWith("/dashboard/");

  // Demo mode: no Supabase → no auth exists. Admin is never accessible.
  // (The server layout also enforces this; this is a helper layer.)
  if (!isSupabaseConfigured) {
    if (isAdminPath) return redirectTo("/auth", request);
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Helper-layer route protection (the server layout/page stays authoritative).
  if (isAdminPath) {
    if (!user) return redirectTo("/auth", request, response);
    const admins = parseAdminEmails(process.env.ADMIN_EMAILS);
    if (!isAdminEmail(user.email, admins)) return redirectTo("/", request, response);
  } else if (isDashboardPath) {
    if (!user) return redirectTo("/auth", request, response);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.svg$).*)"],
};
