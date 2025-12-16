/**
 * These routes don't require authentication
 * @type {string[]}
 */
export const publicRoutes = ["/customer", "/terms", "/privacy", "/support"];

/**
 * Protected routes that require authentication
 * @type {string[]}
 */
export const protectedRoutes = [
  "/",
  "/bvn",
  "/home",
  "/connect",
  "/devices",
  "/otp",
  "/profile",
  "/device",
  "/settings",
  "/wallet",
  "/wearables",
];
