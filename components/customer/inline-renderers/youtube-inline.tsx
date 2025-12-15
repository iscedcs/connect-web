"use client";

function extractYouTubeId(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

export default function YouTubeInline({ url }: { url: string }) {
  const videoId = extractYouTubeId(url);

  if (!videoId) return null;

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-white/10 bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="w-full aspect-video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
