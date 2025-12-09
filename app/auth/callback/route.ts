import { verifyToken } from "@/lib/verify-jwt";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const redirectTo = searchParams.get("redirect") || "/";

  const appBase = process.env.NEXT_PUBLIC_URL!;

  if (!token) {
    return NextResponse.redirect(
      `${process.env.AUTH_BASE_URL}/sign-in?redirect_uri=${appBase}`
    );
  }

  const { valid } = await verifyToken(token);

  if (!valid) {
    return NextResponse.redirect(
      `${process.env.AUTH_BASE_URL}/sign-in?redirect_uri=${appBase}`
    );
  }

  const safeRedirect =
    redirectTo.startsWith("/") || redirectTo.startsWith(appBase);
  const safe = safeRedirect ? redirectTo : "/";

  let maxAge = 60 * 60 * 24;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload?.exp) {
      const nowSec = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, payload.exp - nowSec);
      maxAge = Math.min(remaining, 60 * 60 * 24 * 7);
    }
  } catch {}

  const absoluteRedirect = new URL(safe, appBase).toString();

  const isProduction = process.env.NODE_ENV === "production";
  const res = NextResponse.redirect(absoluteRedirect, { status: 302 });

  res.cookies.set("accessToken", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge,
  });

  // console.log("Redirecting with headers:", res.headers);

  return res;
}
