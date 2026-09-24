import { NextResponse } from "next/server";
import { authLogger } from "@/lib/auth-logger";
import { attachReferral } from "@/lib/services/referral";

/**
 * Recover the referral code from a callback URL.
 *
 * getSignUpUrl/getSignInUrl nest it inside the `redirect` param
 * (`?redirect=%2Fdashboard%3FreferralCode%3Dada`), so it is usually NOT a
 * top-level param on this callback. Check both shapes.
 */
function extractReferralCode(
  redirectTarget: string,
  params: URLSearchParams,
): string | null {
  const direct =
    params.get("referralCode") || params.get("referral") || params.get("ref");
  if (direct) return direct;

  const queryStart = redirectTarget.indexOf("?");
  if (queryStart === -1) return null;
  const nested = new URLSearchParams(redirectTarget.slice(queryStart + 1));
  return (
    nested.get("referralCode") || nested.get("referral") || nested.get("ref")
  );
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

  const safeRedirect =
    redirectTo.startsWith("/") ||
    redirectTo.startsWith(appBase) ||
    redirectTo.startsWith(requestOrigin);
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
      body: JSON.stringify({ code, ...(process.env.ISCE_AUTH_CLIENT_ID && process.env.ISCE_AUTH_CLIENT_SECRET ? { clientId: process.env.ISCE_AUTH_CLIENT_ID, clientSecret: process.env.ISCE_AUTH_CLIENT_SECRET } : (process.env.OAUTH_CLIENT_ID && process.env.OAUTH_CLIENT_SECRET ? { clientId: process.env.OAUTH_CLIENT_ID, clientSecret: process.env.OAUTH_CLIENT_SECRET } : {})) }),
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
    // Business users are routed to LYNCON Plus; the org page
    // handles the workspace lookup after cookies are set.
    if (payload?.userType === "BUSINESS_USER") {
      finalRedirect = "/cp/org";
      authLogger.log("CALLBACK", "Business user → redirecting to /cp/org");
    }
  } catch {}

  const targetUrl = new URL(finalRedirect, appBase);

  // Read the code off `redirectTo`, not `finalRedirect` — business users are
  // rewritten to /cp/org above, which would otherwise drop it.
  const referralCode = extractReferralCode(redirectTo, searchParams);
  if (referralCode && !targetUrl.searchParams.has("referralCode")) {
    targetUrl.searchParams.set("referralCode", referralCode);
  }

  // Bind the user to their referrer. Awaited, so it can't be lost to a frozen
  // serverless instance; bounded, so it can't stall sign-in; non-fatal, so a
  // referral problem never blocks login — but loudly logged either way, since
  // silently dropping this is what left the referral ledger empty.
  if (referralCode) {
    const attach = await attachReferral(accessToken, referralCode);
    if (attach.success) {
      authLogger.log("CALLBACK", "Referral attached", {
        referralCode,
        message: attach.message,
      });
    } else {
      authLogger.error("CALLBACK", "Referral attach FAILED", {
        referralCode,
        message: attach.message,
      });
    }
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
