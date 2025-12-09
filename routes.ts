/**
 * These routes don't require authentication
 * @type {string[]}
 */
export const publicRoutes = ["/"];

/**
 * Protected routes that require authentication
 * @type {string[]}
 */
export const protectedRoutes = [
  "/bvn",
  "/connect", // captures EVERYTHING inside /connect/**
  "/devices",
  "/otp",
  "/profile",
  "/device",
  "/links",
  "/settings", // captures /settings and all sublinks
  "/settings/account",
  "/wallet",
  "/wearables",
];
