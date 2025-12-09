import { decodeJwt } from "./server/connect-fetch";

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
