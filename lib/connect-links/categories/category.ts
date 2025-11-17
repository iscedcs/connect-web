// lib/connect-links/categories.ts

export type LinkCategory =
  | "Social"
  | "Music"
  | "Portfolio"
  | "Payments"
  | "Shopping"
  | "Messaging"
  | "Video"
  | "Crypto"
  | "Website"
  | "Other";

const CATEGORY_PATTERNS: Record<LinkCategory, RegExp[]> = {
  Social: [
    /instagram\.com/,
    /facebook\.com/,
    /twitter\.com/,
    /x\.com/,
    /snapchat\.com/,
  ],
  Music: [/spotify\.com/, /audiomack\.com/, /soundcloud\.com/, /apple\.music/],
  Portfolio: [/behance\.net/, /dribbble\.com/, /github\.com/, /gitlab\.com/],
  Payments: [/paystack\.com/, /flutterwave\.com/, /paypal\.com/, /stripe\.com/],
  Shopping: [/jumia/, /konga/],
  Messaging: [/whatsapp\.com/, /wa\.me/],
  Video: [/youtube\.com/, /youtu\.be/, /tiktok\.com/],
  Crypto: [/binance\.com/, /trustwallet/, /coinbase\.com/],
  Website: [
    /^https?:\/\/(?!.*(?:instagram|facebook|spotify|youtube|jumia|binance))/,
  ],
  Other: [/./],
};

export function detectCategory(url: string): LinkCategory {
  for (const category in CATEGORY_PATTERNS) {
    const patterns = CATEGORY_PATTERNS[category as LinkCategory];
    if (patterns.some((p) => p.test(url.toLowerCase()))) {
      return category as LinkCategory;
    }
  }
  return "Other";
}
