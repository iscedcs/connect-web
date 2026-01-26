export async function verifyToken(token: string) {
  try {
    const decoded = decodeJwt(token);
    console.log("Decoded token payload:", decoded);

    if (!decoded) {
      console.log("Token could not be decoded.");
      return { valid: false };
    }

    if (isTokenExpired(token)) {
      // console.log("Token is expired.");
      return { valid: false };
    }

    // If we get here, the token is considered valid
    return { valid: true, payload: decoded };
  } catch (error) {
    console.error("Error during token verification:", error);
    return { valid: false };
  }
}

export function isTokenExpired(token: string | null): boolean {
  const decoded = decodeJwt(token!);

  if (!decoded?.exp) return true;
  const nowSec = Math.floor(Date.now() / 1000);
  // console.log("Current server time:", nowSec, "Token expiration:", decoded.exp);

  return decoded.exp <= nowSec;
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  if (typeof globalThis.atob === "function") {
    return globalThis.atob(padded);
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }
  throw new Error("No base64 decoder available");
}

export function decodeJwt<T = any>(jwt?: string): T | null {
  if (!jwt) return null;
  try {
    const [, payload] = jwt.split(".");
    if (!payload) return null;
    return JSON.parse(base64UrlDecode(payload)) as T;
  } catch {
    return null;
  }
}
