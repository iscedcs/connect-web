import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const here = new URL(req.url);
  const appBase =
    process.env.NEXT_PUBLIC_URL || `${here.protocol}//${here.host}`;

  const res = NextResponse.redirect(new URL("/", appBase));
  res.cookies.set("accessToken", "", {
    httpOnly: true, // match how it was set
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
