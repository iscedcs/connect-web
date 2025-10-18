"use server";

import { NextResponse } from "next/server";
import { AUTH_API, URLS } from "@/lib/const";
import { getAuthInfo } from "@/actions/auth";

export async function POST(req: Request) {
  const auth = await getAuthInfo();
  if ("error" in auth || auth.isExpired) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { token?: string; userId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.token || !body?.userId) {
    return NextResponse.json(
      { error: "token and userId are required" },
      { status: 400 }
    );
  }

  const upstreamUrl = `${AUTH_API}${URLS.device.verify_token}`;
  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.accessToken}`,
        Accept: "application/json",
      },
      body: JSON.stringify({ token: body.token, userId: body.userId }),
      cache: "no-store",
    });

    const text = await upstream.text();
    const contentType =
      upstream.headers.get("content-type") ?? "application/json";

    return new NextResponse(text, {
      status: upstream.status,
      headers: { "content-type": contentType },
    });
  } catch (e) {
    console.error("verify-token proxy error:", e);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 502 }
    );
  }
}
