export function extractDeviceFromURL(text: string) {
  try {
    const url = new URL(text);

    const parts = url.pathname.split("/").filter(Boolean);
    const deviceId = parts[parts.length - 1];

    const type = url.searchParams.get("type") ?? undefined;

    return deviceId ? { cardid: deviceId, type } : null;
  } catch {
    return null;
  }
}
