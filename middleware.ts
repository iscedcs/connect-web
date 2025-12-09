// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { protectedRoutes } from "./routes";
import { buildAuthLoginUrl } from "./lib/auth-urls";
import { verifyToken } from "./lib/verify-jwt";

function isProtectedPath(pathname: string) {
  // Exact or “startsWith” match for nested pages (e.g., /connect/links/...)
  return protectedRoutes.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function middleware(req: NextRequest) {
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
  if (!token) {
    const redirectUrl =
      req.nextUrl.origin + pathname + (req.nextUrl.search || "");
    return NextResponse.redirect(buildAuthLoginUrl(redirectUrl));
  }

  const { valid, payload } = await verifyToken(token);

  if (!valid || !payload) {
    const redirectUrl =
      req.nextUrl.origin + pathname + (req.nextUrl.search || "");
    return NextResponse.redirect(buildAuthLoginUrl(redirectUrl));
  }
  return NextResponse.next();
}

export const config = {
  // Run on everything except static files (we still early-return in code)
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/api/auth/:path*",
  ],
};
