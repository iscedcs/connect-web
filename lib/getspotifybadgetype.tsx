export function SpotifyTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    playlist: "bg-emerald-500/20 text-emerald-300",
    track: "bg-blue-500/20 text-blue-300",
    album: "bg-purple-500/20 text-purple-300",
    artist: "bg-pink-500/20 text-pink-300",
    other: "bg-white/10 text-white/40",
  };

  return (
    <span
      className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wide ${
        colors[type] || colors.other
      }`}>
      {type}
    </span>
  );
}
