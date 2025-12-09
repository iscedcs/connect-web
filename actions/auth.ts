"use server";

import { cookies } from "next/headers";
import { format } from "date-fns";

/**
 * Server action to get the current access token and user info
 * Reads from the accessToken cookie and decodes the JWT payload
 */
export async function getAuthInfo(): Promise<AuthInfo | AuthError> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return { error: "Not authenticated - no access token found" };
  }

  try {
    // Decode JWT payload (middle part of token)
    const base64Payload = accessToken.split(".")[1];
    const payload: UserInfo = JSON.parse(
      Buffer.from(base64Payload, "base64").toString("utf-8")
    );

    // Check if token is expired
    const nowSec = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp ? payload.exp <= nowSec : true;
    const willExpireAt = payload.exp
      ? format(new Date(payload.exp * 1000), "yyyy-MM-dd HH:mm:ss")
      : null;

    return {
      accessToken,
      user: payload,
      expiresAt: payload.exp || 0,
      isExpired,
      willExpireAt,
    };
  } catch (error) {
    return { error: "Invalid token format" };
  }
}

/**
 * Server action to check if user is authenticated
 * Returns true if valid access token exists and is not expired
 */
export async function isAuthenticated(): Promise<boolean> {
  const authInfo = await getAuthInfo();

  if ("error" in authInfo) {
    return false;
  }

  return !authInfo.isExpired;
}

/**
 * Server action to get just the user info without the token
 */
export async function getCurrentUser(): Promise<UserInfo | null> {
  const authInfo = await getAuthInfo();

  if ("error" in authInfo || authInfo.isExpired) {
    return null;
  }

  return authInfo.user;
}
