// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { protectedRoutes } from "./routes";
import { buildAuthLoginUrl } from "./lib/auth-urls";

function isProtectedPath(pathname: string) {
  // Exact or “startsWith” match for nested pages (e.g., /connect/links/...)
  return protectedRoutes.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function hasNextAuthSessionCookie(req: NextRequest) {
  return (
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value
  );
}

function isExpired(jwt?: string) {
  if (!jwt) return true;
  try {
    // Edge runtime: use atob (Buffer not available)
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    if (!payload?.exp) return true;
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp <= nowSec;
  } catch {
    return true;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static/assets/callback/etc.
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/logout") ||
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Only guard protected paths
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api")) return NextResponse.next();

  const token = req.cookies.get("accessToken")?.value;
  const nextAuthCookie = hasNextAuthSessionCookie(req);

  const hasValidAccessToken = token && !isExpired(token);

  if (hasValidAccessToken || nextAuthCookie) {
    return NextResponse.next();
  }
  const currentUrl =
    req.nextUrl.origin + req.nextUrl.pathname + (req.nextUrl.search || "");
  const authUrl = buildAuthLoginUrl(currentUrl);
  return NextResponse.redirect(authUrl);
}

export const config = {
  // Run on everything except static files (we still early-return in code)
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
