"use server";

import { NextResponse } from "next/server";
import { AUTH_API, URLS } from "@/lib/const";
import { getAuthInfo } from "@/actions/auth";

export async function POST(req: Request) {
  const auth = await getAuthInfo();
  if ("error" in auth || auth.isExpired) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { token?: string; productId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.token || !body?.productId) {
    return NextResponse.json(
      { error: "token and productId are required" },
      { status: 400 }
    );
  }

  const upstreamUrl = `${AUTH_API}${URLS.device.create}`;
  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.accessToken}`,
        Accept: "application/json",
      },
      body: JSON.stringify({ token: body.token, productId: body.productId }),
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
    console.error("create-device proxy error:", e);
    return NextResponse.json(
      { error: "Failed to create device" },
      { status: 502 }
    );
  }
}
