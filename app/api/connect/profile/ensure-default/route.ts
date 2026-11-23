import { BASE_URLS, URLS } from "@/lib/const";
import { getBearerAndUserId } from "../../_lib/auth";

export async function POST(req: Request) {
  const got = await getBearerAndUserId();
  if (got.error) return got.error;
  const { token } = got;
  const payload = await req.json().catch(() => ({}));

  const base = BASE_URLS.CONNECT_API;
  if (!base) {
    return new Response(
      JSON.stringify({ message: "Connect API is not configured" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  const upstream = `${base}${URLS.profile.ensure_default}`;

  const res = await fetch(upstream, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },

    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
