import { URLS } from "@/lib/const";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, accessToken, ...payload } = body;

    if (!id || !accessToken)
      return NextResponse.json(
        { message: "Missing id or token" },
        { status: 400 }
      );

    const BASE_URL = process.env.NEXT_PUBLIC_LIVE_ISCEAUTH_BACKEND_URL;
    const target = `${BASE_URL}${URLS.device.update.replace("{id}", id)}`;
    console.log("🟢 Target URL:", target);
    console.log("🟢 Payload:", payload);

    const res = await fetch(target, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    let text = await res.text();
    console.log("🟢 Raw backend response text:", text);

    // Attempt JSON parse
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }

    console.log("🟢 Parsed JSON:", json);
    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    console.error("❌ Device update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
