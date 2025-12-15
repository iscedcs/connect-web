"use client";

import { detectSocialPlatform } from "@/lib/connect-links/detect-social";
import { FileInline } from "./file-inline";
import { SpotifyInline } from "./spotify-inline";
import YouTubeInline from "./youtube-inline";
import InstagramInline from "./instagram-inline";
import LinkInline from "./link-inline";

export function InlineRenderer({ item }: { item: any }) {
  const url = item.url ?? "";
  const platform = detectSocialPlatform(item.url);

  switch (platform) {
    case "youtube":
      return <YouTubeInline url={item.url} />;

    case "instagram":
      return <InstagramInline url={item.url} />;

    default:
      if (url.includes("open.spotify.com")) {
        return <SpotifyInline url={url} />;
      }

      // Future:
      if (/\.(pdf|png|jpg|jpeg|webp)$/i.test(item.url)) {
        return <FileInline file={item} />;
      }
      return <LinkInline item={item} />;

    // if (url.includes("youtube.com")) return <YouTubeInline />
  }
}
