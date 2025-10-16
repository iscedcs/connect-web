import "server-only";
import { cookies } from "next/headers";

const CONNECT_API_ORIGIN =
  process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL!;

export async function connectFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return new Response(JSON.stringify({ message: "Not authenticated" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const url = `${CONNECT_API_ORIGIN}${path}`;
  const headers = new Headers(init.headers as any);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  headers.set("authorization", `Bearer ${token}`);

  return fetch(url, {
    ...init,
    headers,
    credentials: "omit",
    cache: "no-store",
  });
}

// tiny helper to decode JWT payload; use jose if you need signature verification
export function decodeJwt<T = any>(jwt?: string): T | null {
  if (!jwt) return null;
  try {
    const [, payload] = jwt.split(".");
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}
