import { getAuthInfo } from "@/actions/auth";
import { NEXT_PUBLIC_CONNECT_API_ORIGIN, URLS } from "../const";

export async function getConnectProfile(): Promise<ConnectProfile | null> {
  const auth = await getAuthInfo();
  if ("error" in auth || auth.isExpired) return null;

  const base = NEXT_PUBLIC_CONNECT_API_ORIGIN;

  const defaultRes = await fetch(`${base}${URLS.multi_profile.get_default}`, {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    cache: "no-store",
  });

  const defaultJson = await defaultRes.json();
  if (defaultJson?.data?.profile) {
    return defaultJson.data.profile;
  }

  // 2. If no default → fallback to first profile
  const allRes = await fetch(`${base}${URLS.multi_profile.all}`, {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    cache: "no-store",
  });

  const allJson = await allRes.json();
  if (allJson?.data?.profiles?.length) {
    return allJson.data.profiles[0];
  }

  return null;
}
