import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const redirectTo = searchParams.get("redirect") || "/";

  const appBase = process.env.NEXT_PUBLIC_URL!;
  const safeRedirect =
    redirectTo.startsWith("/") || redirectTo.startsWith(appBase);
  const safe = safeRedirect ? redirectTo : "/";

  if (!token) {
    const loginUrl = `${process.env.AUTH_BASE_URL}${
      process.env.AUTH_LOGIN_PATH || "/sign-in"
    }?redirect_uri=${encodeURIComponent(new URL(safe, appBase).toString())}`;
    return NextResponse.redirect(loginUrl);
  }

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

  const res = NextResponse.redirect(absoluteRedirect);
  res.cookies.set("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return res;
}
