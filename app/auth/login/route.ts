import { NextResponse } from "next/server";
import { buildAuthLoginUrl } from "@/lib/auth-urls";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const appBase = process.env.NEXT_PUBLIC_URL || `${url.protocol}//${url.host}`;

  const redirectParam = url.searchParams.get("redirect") || "/";
  // always absolute for safety:
  const absoluteBack = new URL(redirectParam, appBase).toString();

  const loginUrl = buildAuthLoginUrl(absoluteBack);
  return NextResponse.redirect(loginUrl);
}
