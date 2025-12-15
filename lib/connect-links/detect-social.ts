export type SocialPlatform =
  | "youtube"
  | "instagram"
  | "twitter"
  | "linkedin"
  | "tiktok"
  | "telegram"
  | "whatsapp"
  | "unknown";

export function detectSocialPlatform(url: string): SocialPlatform {
  const u = url.toLowerCase();

  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("wa.me") || u.includes("whatsapp.com")) return "whatsapp";
  if (u.includes("t.me") || u.includes("telegram.me")) return "telegram";
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("tiktok.com")) return "tiktok";

  return "unknown";
}
