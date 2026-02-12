import { getAuthInfo } from "@/actions/auth";
import { NEXT_PUBLIC_CONNECT_API_ORIGIN, URLS } from "../const";

async function safeJson(res: Response): Promise<any | null> {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return null;
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function getConnectProfile(): Promise<ConnectProfile | null> {
  const auth = await getAuthInfo();
  if ("error" in auth || auth.isExpired) return null;

  const base = NEXT_PUBLIC_CONNECT_API_ORIGIN;
  if (!base) return null;

  try {
    const defaultRes = await fetch(`${base}${URLS.multi_profile.get_default}`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      cache: "no-store",
    });
    const defaultJson = await safeJson(defaultRes);
    if (defaultJson?.data?.profile) {
      return defaultJson.data.profile;
    }

    // If no default -> fallback to first profile
    const allRes = await fetch(`${base}${URLS.multi_profile.all}`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      cache: "no-store",
    });
    const allJson = await safeJson(allRes);
    if (allJson?.data?.profiles?.length) {
      return allJson.data.profiles[0];
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[getConnectProfile] failed to fetch profile", error);
    }
  }

  return null;
}
