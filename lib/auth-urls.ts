///lib/auth-urls.ts
export function buildAuthLoginUrl(redirectTo: string) {
  const base = process.env.AUTH_BASE_URL!;
  const path = process.env.AUTH_LOGIN_PATH || "/sign-in";

  // Allowlist domain check (prevent open redirect)
  const appBase = process.env.NEXT_PUBLIC_URL!;
  const isSameOrigin =
    redirectTo.startsWith(appBase) || redirectTo.startsWith("/");
  const safeRedirect = isSameOrigin ? redirectTo : "/";

  const url = new URL(path, base);
  url.searchParams.set("redirect_uri", safeRedirect);
  url.searchParams.set("prompt", "login");
  return url.toString();
}
