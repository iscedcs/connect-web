import { CONNECT_API_ORIGIN, URLS } from "@/lib/const";
import { getBearerAndUserId } from "../../_lib/auth";

export async function PATCH(req: Request) {
  const got = await getBearerAndUserId();
  if (got.error) return got.error;

  const { token, userId } = got;

  const payload = await req.json().catch(() => ({}));

  const upstreamPayload = {
    userId,
    ...payload,
  };

  const base = CONNECT_API_ORIGIN!;
  const upstream = `${base}${URLS.profile.update}`;

  const res = await fetch(upstream, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(upstreamPayload),
  });

  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
