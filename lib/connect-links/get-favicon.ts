export function getFaviconFromUrl(url: string, size: number = 64) {
  try {
    const hostname = new URL(url).hostname;

    // Google favicon service
    return `https://www.google.com/s2/favicons?sz=${size}&domain=${hostname}`;
  } catch {
    return "/icons/globe.svg";
  }
}

export function getFileType(url: string) {
  if (url.match(/\.pdf$/i)) return "pdf";
  if (url.match(/\.(png|jpg|jpeg|webp)$/i)) return "image";
  if (url.match(/\.(doc|docx)$/i)) return "document";
  return "other";
}
