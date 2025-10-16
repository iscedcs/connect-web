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
  "/",
  "/bvn",
  "/connect",
  "/connect/links",
  "/connect/success",
  "/otp",
  "/otp/error",
  "/otp/idle",
  "/otp/resending",
  "/otp/success",
  "/profile",
  "/profile/edit",
  "/device",
  "/links",
  "/settings",
  "/wallet",
  "/wallet/empty",
  "/wearables",
];
