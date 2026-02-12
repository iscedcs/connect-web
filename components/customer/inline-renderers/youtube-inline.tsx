"use client";

function extractYouTubeId(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;

    const watchVideoId = u.searchParams.get("v");
    if (watchVideoId) return watchVideoId;

    const path = u.pathname.toLowerCase();
    if (path.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
    if (path.startsWith("/embed/")) return u.pathname.split("/")[2] || null;

    return null;
  } catch {
    return null;
  }
}

export default function YouTubeInline({ url }: { url: string }) {
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block rounded-xl border border-white/10 bg-[#0f0f0f] p-3 text-sm text-white/80 hover:bg-[#1a1a1a] transition"
      >
        Open this YouTube link
      </a>
    );
  }

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
