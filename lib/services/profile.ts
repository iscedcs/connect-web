import { getAuthInfo } from "@/actions/auth";
import { NEXT_PUBLIC_CONNECT_API_ORIGIN, URLS } from "../const";

export async function getConnectProfile(): Promise<ConnectProfile | null> {
  const auth = await getAuthInfo();
  if ("error" in auth || auth.isExpired) return null;

  const res = await fetch(
    `${NEXT_PUBLIC_CONNECT_API_ORIGIN}${URLS.profile.profile}`,
    {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${auth.accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (res.status === 404 || res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to load profile");

  const json = await res.json();
  return json?.data?.profile ?? json?.profile ?? null;
}
