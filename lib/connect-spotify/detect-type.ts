export type SpotifyType = "playlist" | "track" | "album" | "artist" | "other";

export function detectSpotifyType(url: string): SpotifyType {
  try {
    const u = new URL(url);
    const segments = u.pathname.split("/");

    // example: /playlist/{id}
    const type = segments[1];

    if (["playlist", "track", "album", "artist"].includes(type)) {
      return type as SpotifyType;
    }

    return "other";
  } catch {
    return "other";
  }
}
