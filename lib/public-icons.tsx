export function getIconForItem(
  item: ConnectItem | null | undefined,
  type?: string
) {
  const iconMap: Record<string, string> = {
    globe: "🌐",
    facebook: "📘",
    youtube: "▶️",
    link: "🔗",
    file: "📄",
    pdf: "📄",
    spotify: "🎵",
    form: "📝",
    meeting: "📆",
    appointment: "🗓️",
  };

  const key = (item && item.icon) || type || "link";
  const icon = iconMap[key] || "🔗";

  return <span className="text-2xl">{icon}</span>;
}
