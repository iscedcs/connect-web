export function SpotifyTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    playlist: "bg-emerald-400/10 text-emerald-300 border border-emerald-500/20",
    album: "bg-purple-400/10 text-purple-300 border border-purple-500/20",
    track: "bg-blue-400/10 text-blue-300 border border-blue-500/20",
    artist: "bg-pink-400/10 text-pink-300 border border-pink-500/20",
    other: "bg-white/10 text-white/40 border border-white/5",
  };

  return (
    <span
      className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wide ${
        styles[type] || styles.other
      }`}
      style={{
        animation: "badgePop 0.3s ease",
      }}>
      {type}
    </span>
  );
}
