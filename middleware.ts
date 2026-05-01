import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Old admin path should not be accessible.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Protect the new boss panel route.
  if (pathname === "/boss-panel" || pathname.startsWith("/boss-panel/")) {
    const key = process.env.BOSS_PANEL_KEY;
    const cookie = req.cookies.get("boss_panel_auth")?.value;

    // If no key is configured, allow access (dev-friendly default).
    // If a key is configured, require matching cookie.
    if (key && cookie !== key) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/boss-panel/:path*"],
};

