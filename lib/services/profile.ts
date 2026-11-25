import { getAuthInfo } from "@/actions/auth";
import { BASE_URLS, URLS } from "../const";

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

  const base = BASE_URLS.CONNECT_API;
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
    if (
      allRes.ok &&
      Array.isArray(allJson?.data?.profiles) &&
      allJson.data.profiles.length === 0
    ) {
      const ensured = await ensureDefaultProfile({});
      if (ensured.profile) {
        return ensured.profile;
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[getConnectProfile] failed to fetch profile", error);
    }
  }

  return null;
}

export async function getAllConnectProfiles(
  accessToken?: string,
): Promise<ConnectProfile[] | null> {
  let token = accessToken;
  if (!token) {
    const auth = await getAuthInfo();
    if ("error" in auth || auth.isExpired) return null;
    token = auth.accessToken;
  }

  const base = BASE_URLS.CONNECT_API;
  if (!base) return null;

  try {
    const res = await fetch(`${base}${URLS.multi_profile.all}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = await safeJson(res);
    if (json?.data?.profiles) {
      return json.data.profiles;
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[getAllConnectProfiles] failed to fetch profiles", error);
    }
  }

  return null;
}

export async function ensureDefaultProfile(
  payload: EnsureDefaultProfilePayload = {},
): Promise<EnsureDefaultProfileResult> {
  const auth = await getAuthInfo();
  if ("error" in auth || auth.isExpired)
    return {
      success: false,
      profile: null,
      status: 401,
      message: "Not authenticated",
    };
  const token = auth.accessToken;
  const base = BASE_URLS.CONNECT_API;
  if (!base)
    return {
      success: false,
      profile: null,
      status: 503,
      message: "Connect API is not configured",
    };
  try {
    const res = await fetch(`${base}${URLS.profile.ensure_default}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const json = await safeJson(res);

    if (!res.ok) {
      return {
        success: false,
        created: false,
        profile: null,
        status: res.status,
        message:
          json?.message || `Failed to ensure a default profile(${res.status})`,
      };
    }
    return {
      success: json?.success !== false,
      created: json?.created,
      profile: json?.data.profile ?? null,
      status: res.status,
      message: json?.message,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ensureDefaultProfile] failed to create default profile");
    }
    return {
      success: false,
      created: false,
      profile: null,
      status: 502,
      message: "Could not reach the profile service",
    };
  }
}
