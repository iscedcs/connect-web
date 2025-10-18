import { NEXT_PUBLIC_CONNECT_API_ORIGIN, URLS } from "@/lib/const";
import { getBearerAndUserId } from "../../_lib/auth";

export async function GET() {
  const got = await getBearerAndUserId();
  if (got.error) return got.error;

  const { token } = got;

  const base = NEXT_PUBLIC_CONNECT_API_ORIGIN!;
  const upstream = `${base}${URLS.profile.profile}`;

  const res = await fetch(upstream, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
