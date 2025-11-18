// lib/connect-meetings/providers.ts
export type MeetingProvider =
  | "google_meet"
  | "zoom"
  | "teams"
  | "webex"
  | "discord"
  | "slack"
  | "unknown";

export function detectMeetingProvider(url: string): MeetingProvider {
  const u = url.toLowerCase();

  if (u.includes("meet.google.com")) return "google_meet";
  if (u.includes("zoom.us") || u.includes("zoom.com")) return "zoom";
  if (u.includes("teams.microsoft.com")) return "teams";
  if (u.includes("webex.com")) return "webex";
  if (u.includes("discord.com")) return "discord";
  if (u.includes("slack.com") || u.includes("app.slack.com")) return "slack";

  return "unknown";
}

export function providerLabel(provider: MeetingProvider): string {
  switch (provider) {
    case "google_meet":
      return "Google Meet";
    case "zoom":
      return "Zoom";
    case "teams":
      return "Microsoft Teams";
    case "webex":
      return "Webex";
    case "discord":
      return "Discord";
    case "slack":
      return "Slack";
    default:
      return "Meeting Link";
  }
}
