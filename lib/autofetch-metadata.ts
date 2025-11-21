export async function fetchSpotifyMetadata(url: string) {
  try {
    const res = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`
    );
    if (!res.ok) return null;

    const data = await res.json();

    return {
      title: data.title ?? "",
      thumbnail: data.thumbnail_url ?? "",
      html: data.html ?? "",
      provider: data.provider_name ?? "Spotify",
    };
  } catch {
    return null;
  }
}
