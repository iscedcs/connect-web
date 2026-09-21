import { NextResponse } from "next/server";
import { authLogger } from "@/lib/auth-logger";

// Server-side only. Both values unset = legacy exchange (no client auth);
// exactly one set is a misconfiguration and sends nothing rather than half.
function getClientCredentials(): { clientId?: string; clientSecret?: string } {
  const clientId = process.env.ISCE_AUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.ISCE_AUTH_CLIENT_SECRET?.trim();
  if (clientId && clientSecret) return { clientId, clientSecret };
  if (clientId || clientSecret) {
    authLogger.error(
      "CALLBACK",
      "ISCE_AUTH_CLIENT_ID and ISCE_AUTH_CLIENT_SECRET must be set together; sending no client credentials",
    );
  }
  return {};
}

// Relative paths, or absolute URLs whose origin is exactly one of ours.
// "//evil.com" and "/\evil.com" start with "/" but resolve to another site, and a
// prefix check would accept "https://app.example.com.evil.com".
function isSafeRedirect(target: string, allowedBases: string[]): boolean {
  if (target.startsWith("/")) {
    return !target.startsWith("//") && !target.startsWith("/\\");
  }
  try {
    const origin = new URL(target).origin;
    return allowedBases.some((base) => new URL(base).origin === origin);
  } catch {
    return false;
  }
}

function buildSignInRedirect(callbackUrl: URL): string {
  const base = (process.env.NEXT_PUBLIC_AUTH_WEB_URL || "").trim();
  const signInUrl = new URL("/sign-in", base);
  signInUrl.searchParams.set("redirect_uri", callbackUrl.toString());
  signInUrl.searchParams.set("prompt", "login");
  return signInUrl.toString();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect") || "/";

  // Backwards compatibility: accept token param during migration
  const legacyToken = searchParams.get("token");

  authLogger.log("CALLBACK", `Auth callback received`, {
    hasCode: !!code,
    hasLegacyToken: !!legacyToken,
    redirect: redirectTo,
  });

  const requestOrigin = new URL(req.url).origin;
  const appBase = process.env.NEXT_PUBLIC_URL || requestOrigin;
  const authApiBase =
    process.env.AUTH_API_URL || process.env.NEXT_PUBLIC_AUTH_API_URL;

  const safeRedirect = isSafeRedirect(redirectTo, [appBase, requestOrigin]);
  const safe = safeRedirect ? redirectTo : "/";

  const callbackUrl = new URL("/auth/callback", appBase);
  callbackUrl.searchParams.set("redirect", safe);

  if (!code && !legacyToken) {
    authLogger.warn("CALLBACK", "No code or token — redirecting to sign-in");
    return NextResponse.redirect(buildSignInRedirect(callbackUrl));
  }

  let accessToken: string;
  let refreshToken: string | undefined;

  if (code) {
    // Phase 3: Exchange the auth code for tokens server-to-server
    authLogger.log(
      "CALLBACK",
      `Exchanging auth code via POST ${authApiBase}/auth/token`,
    );
    const tokenRes = await fetch(`${authApiBase}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, ...getClientCredentials() }),
    });

    if (!tokenRes.ok) {
      authLogger.error("CALLBACK", `Auth code exchange failed`, {
        status: tokenRes.status,
        statusText: tokenRes.statusText,
      });
      return NextResponse.redirect(buildSignInRedirect(callbackUrl));
    }

    const tokenData = await tokenRes.json();
    accessToken = tokenData.accessToken;
    refreshToken = tokenData.refreshToken;
    authLogger.log(
      "CALLBACK",
      `Auth code exchange successful, tokens received`,
    );
  } else {
    // Legacy flow: direct token (remove after full migration)
    authLogger.warn("CALLBACK", "Using legacy token flow (deprecated)");
    accessToken = legacyToken!;
  }

  let maxAge = 60 * 60; // 1 hour — matches short-lived access token
  let finalRedirect = safe;
  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    if (payload?.exp) {
      const nowSec = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, payload.exp - nowSec);
      maxAge = Math.min(remaining, 60 * 60 * 24 * 7);
    }
    // Business users are routed to Connect Plus; the org page
    // handles the workspace lookup after cookies are set.
    if (payload?.userType === "BUSINESS_USER") {
      finalRedirect = "/cp/org";
      authLogger.log("CALLBACK", "Business user → redirecting to /cp/org");
    }
  } catch {}

  const targetUrl = new URL(finalRedirect, appBase);
  const callbackReferral =
    searchParams.get("referralCode") ||
    searchParams.get("referral") ||
    searchParams.get("ref");
  if (callbackReferral && !targetUrl.searchParams.has("referralCode")) {
    targetUrl.searchParams.set("referralCode", callbackReferral);
  }
  const absoluteRedirect = targetUrl.toString();

  const isProduction = process.env.NODE_ENV === "production";
  const res = NextResponse.redirect(absoluteRedirect, { status: 302 });

  res.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  if (refreshToken) {
    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  return res;
}
