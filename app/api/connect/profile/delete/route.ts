import { NEXT_PUBLIC_CONNECT_API_ORIGIN, URLS } from "@/lib/const";
import { getBearerAndUserId } from "../../_lib/auth";

export async function DELETE() {
  const got = await getBearerAndUserId();
  if (got.error) return got.error;

  const { token, userId } = got;

  const base = NEXT_PUBLIC_CONNECT_API_ORIGIN!;
  const upstream = `${base}${URLS.profile.delete}`;

  const res = await fetch(upstream, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify({ userId }),
  });

  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
