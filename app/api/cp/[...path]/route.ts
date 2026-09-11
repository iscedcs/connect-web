import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BASE_URLS } from "@/lib/const";

async function proxyCpRequest(req: NextRequest, params: { path: string[] }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const rawBase =
    process.env.CONNECT_API_URL ||
    process.env.NEXT_PUBLIC_CONNECT_API_URL ||
    BASE_URLS.CONNECT_API ||
    "https://test-connect-api.isce.app";

  const cleanBase = rawBase.replace(/\/$/, "");
  const path = params.path.join("/");
  const search = req.nextUrl.search;

  let targetUrl = "";
  if (cleanBase.endsWith("/api/cp")) {
    targetUrl = `${cleanBase}/${path}${search}`;
  } else if (cleanBase.endsWith("/api")) {
    targetUrl = `${cleanBase}/cp/${path}${search}`;
  } else {
    targetUrl = `${cleanBase}/api/cp/${path}${search}`;
  }

  // console.log(`[CP Proxy] ${req.method} -> ${targetUrl}`)

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const wsId = req.headers.get("x-workspace-id");
  if (wsId) {
    headers["x-workspace-id"] = wsId;
  }

  let body: string | undefined = undefined;
  if (["POST", "PATCH", "PUT"].includes(req.method)) {
    try {
      const json = await req.json();
      body = JSON.stringify(json);
    } catch {
      // Empty body
    }
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    });

    const data = await upstreamRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstreamRes.status });
  } catch (error: any) {
    console.error(
      `[CP Proxy Error] ${req.method} ${targetUrl} failed:`,
      error?.message || error,
    );
    return NextResponse.json(
      { message: error?.message || "Upstream service unavailable" },
      { status: 502 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyCpRequest(req, await params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyCpRequest(req, await params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyCpRequest(req, await params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyCpRequest(req, await params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyCpRequest(req, await params);
}
