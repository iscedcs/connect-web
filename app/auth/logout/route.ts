import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const here = new URL(req.url);
  const appBase =
    process.env.NEXT_PUBLIC_URL || `${here.protocol}//${here.host}`;

  const returnTo = new URL("/", appBase).toString();

  const authBase = process.env.AUTH_BASE_URL;

  const ssoLogout = new URL("/sso/logout", authBase);
  ssoLogout.searchParams.set("redirect", returnTo);

  const res = NextResponse.redirect(ssoLogout, { status: 302 });

  res.cookies.set("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
