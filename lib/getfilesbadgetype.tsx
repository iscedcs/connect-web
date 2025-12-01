import { FileType } from "./connect-files/detect-file-type";

export function FileTypeBadge({ type }: { type: FileType }) {
  const style: Record<FileType, string> = {
    image: "bg-blue-500/20 text-blue-300",
    pdf: "bg-red-500/20 text-red-300",
    document: "bg-indigo-500/20 text-indigo-300",
    spreadsheet: "bg-green-500/20 text-green-300",
    presentation: "bg-orange-500/20 text-orange-300",
    zip: "bg-yellow-500/20 text-yellow-300",
    audio: "bg-purple-500/20 text-purple-300",
    video: "bg-pink-500/20 text-pink-300",
    other: "bg-white/10 text-white/40",
  };

  return (
    <span
      className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wide ${style[type]}`}
      style={{ animation: "badgePop .3s ease" }}>
      {type}
    </span>
  );
}
