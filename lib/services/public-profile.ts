import { URLS } from "@/lib/const";
import { http } from "./http";
import axios from "axios";

const CONNECT_API = process.env.NEXT_PUBLIC_CONNECT_API_URL;

export type PublicProfileLookupReason =
  | "ok"
  | "device_not_found"
  | "profile_not_set_up"
  | "unknown";

export type PublicProfileLookupResult = {
  data: any | null;
  reason: PublicProfileLookupReason;
  message?: string;
};

/** ---------------------------------------
 * FETCH A DEVICE HOLDER PUBLIC PROFILE
 -----------------------------------------*/
export async function fetchPublicProfile(deviceId: string) {
  try {
    const url = `${CONNECT_API}${URLS.profile.public.replace(
      "{deviceId}",
      deviceId,
    )}`;

    const res = await http.get(url);
    return res.data?.data ?? null;
  } catch (err) {
    return null;
  }
}

/** ---------------------------------------
 * FETCH DEVICE HOLDER PUBLIC PROFILE WITH LOOKUP STATE
 -----------------------------------------*/
export async function fetchPublicProfileWithLookup(
  deviceId: string,
): Promise<PublicProfileLookupResult> {
  try {
    const url = `${CONNECT_API}${URLS.profile.public.replace(
      "{deviceId}",
      deviceId,
    )}`;

    const res = await axios.get(url, { timeout: 10000 });
    const data = res.data?.data ?? null;

    if (data) {
      return { data, reason: "ok" };
    }

    return { data: null, reason: "profile_not_set_up" };
  } catch (err) {
    const axiosErr = axios.isAxiosError(err) ? err : null;
    const message =
      axiosErr?.response?.data?.message ||
      axiosErr?.message ||
      "Network or server error";
    const normalizedMessage = String(message).toLowerCase();

    if (
      normalizedMessage.includes("device") &&
      (normalizedMessage.includes("not found") ||
        normalizedMessage.includes("does not exist") ||
        normalizedMessage.includes("doesn't exist"))
    ) {
      return { data: null, reason: "device_not_found", message };
    }

    if (
      normalizedMessage.includes("profile") &&
      (normalizedMessage.includes("not found") ||
        normalizedMessage.includes("not set") ||
        normalizedMessage.includes("not attached") ||
        normalizedMessage.includes("missing"))
    ) {
      return { data: null, reason: "profile_not_set_up", message };
    }

    if (axiosErr?.response?.status === 404) {
      return { data: null, reason: "device_not_found", message };
    }

    return { data: null, reason: "unknown", message };
  }
}
