// lib/connect-social/detect-provider.ts
export type SocialPlatform =
  | "LinkedIn"
  | "Facebook"
  | "Instagram"
  | "Twitter"
  | "TikTok"
  | "GitHub"
  | "YouTube"
  | "WhatsApp"
  | "Telegram"
  | "Website"
  | "Unknown";

const PLATFORM_PATTERNS: Record<SocialPlatform, RegExp[]> = {
  LinkedIn: [/linkedin\.com/],
  Facebook: [/facebook\.com/],
  Instagram: [/instagram\.com/],
  Twitter: [/twitter\.com/, /x\.com/],
  TikTok: [/tiktok\.com/],
  GitHub: [/github\.com/],
  YouTube: [/youtube\.com/, /youtu\.be/],
  WhatsApp: [/wa\.me/, /whatsapp\.com/],
  Telegram: [/t\.me/],
  Website: [
    /^https:\/\/(?!.*(linkedin|facebook|instagram|twitter|github|youtube|tiktok))/,
  ],
  Unknown: [/./],
};

export function detectSocialPlatform(value: string): SocialPlatform {
  const url = value.toLowerCase();
  for (const platform in PLATFORM_PATTERNS) {
    const patterns = PLATFORM_PATTERNS[platform as SocialPlatform];
    if (patterns.some((p) => p.test(url))) {
      return platform as SocialPlatform;
    }
  }
  return "Unknown";
}

export function autoLabel(platform: SocialPlatform): string {
  switch (platform) {
    case "LinkedIn":
      return "LinkedIn Profile";
    case "Facebook":
      return "Facebook Page";
    case "Instagram":
      return "Instagram Profile";
    case "Twitter":
      return "Twitter Profile";
    case "TikTok":
      return "TikTok Profile";
    case "GitHub":
      return "GitHub Profile";
    case "YouTube":
      return "YouTube Channel";
    case "WhatsApp":
      return "WhatsApp Contact";
    case "Telegram":
      return "Telegram Channel";
    case "Website":
      return "Website";
    default:
      return "Social Link";
  }
}
