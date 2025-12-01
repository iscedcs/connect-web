import {
  FileText,
  FileArchive,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";

export function getFileIcon(mediaType?: string) {
  if (!mediaType) return <File className="w-5 h-5 text-white/60" />;

  if (mediaType.includes("pdf"))
    return <FileText className="w-5 h-5 text-red-400" />;

  if (mediaType.includes("image"))
    return <FileImage className="w-5 h-5 text-blue-300" />;

  if (mediaType.includes("zip") || mediaType.includes("compressed"))
    return <FileArchive className="w-5 h-5 text-yellow-300" />;

  if (mediaType.includes("audio"))
    return <FileAudio className="w-5 h-5 text-purple-300" />;

  if (mediaType.includes("video"))
    return <FileVideo className="w-5 h-5 text-green-300" />;

  if (mediaType.includes("spreadsheet") || mediaType.includes("excel"))
    return <FileSpreadsheet className="w-5 h-5 text-emerald-300" />;

  if (
    mediaType.includes("json") ||
    mediaType.includes("javascript") ||
    mediaType.includes("html")
  )
    return <FileCode className="w-5 h-5 text-orange-300" />;

  return <File className="w-5 h-5 text-white/60" />;
}
