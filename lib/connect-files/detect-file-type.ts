export type FileType =
  | "image"
  | "pdf"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "zip"
  | "audio"
  | "video"
  | "other";

export function detectFileType(filename: string): FileType {
  const ext = filename.toLowerCase();

  if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(ext)) return "image";
  if (/\.(pdf)$/.test(ext)) return "pdf";
  if (/\.(doc|docx|txt|rtf)$/.test(ext)) return "document";
  if (/\.(xls|xlsx|csv)$/.test(ext)) return "spreadsheet";
  if (/\.(ppt|pptx)$/.test(ext)) return "presentation";
  if (/\.(zip|rar|7z)$/.test(ext)) return "zip";
  if (/\.(mp3|wav|aac)$/.test(ext)) return "audio";
  if (/\.(mp4|mov|avi|mkv)$/.test(ext)) return "video";

  return "other";
}
