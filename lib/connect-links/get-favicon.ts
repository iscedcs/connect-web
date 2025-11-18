export function getFaviconFromUrl(url: string, platform?: string, size: number = 64) {
  try {
    const hostname = new URL(url).hostname;

    // Google favicon service
    return `https://www.google.com/s2/favicons?sz=${size}&domain=${hostname}`;
  } catch {
    return "/icons/globe.svg";
  }
}
