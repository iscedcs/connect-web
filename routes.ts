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
  "/wallet",
  "/wearables",
];
// export const protectedRoutes = [
//   "/",
//   "/bvn",
//   "/connect",
//   "/connect/links",
//   "/connect/links/appoinments*",
//   "/connect/links/contact",
//   "/connect/links/files",
//   "/connect/links/form",
//   "/connect/links/links",
//   "/connect/links/meetings",
//   "/connect/links/socials",
//   "/connect/links/spotify",
//   "/connect/links/video",
//   "/devices",
//   "/otp",
//   "/otp/error",
//   "/otp/idle",
//   "/otp/resending",
//   "/otp/success",
//   "/profile",
//   "/profile/edit",
//   "/device",
//   "/links",
//   "/settings*",
//   "/wallet",
//   "/wallet/empty",
//   "/wearables",
// ];
