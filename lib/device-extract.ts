export function extractDeviceFromURL(text: string) {
	try {
		const url = new URL(text);

		// Primary: check `?id=` query param (e.g. https://isce.app?id=abc123&type=xyz)
		const idParam = url.searchParams.get('id');
		// Fallback: last path segment (e.g. https://isce.app/abc123?type=xyz)
		const parts = url.pathname.split('/').filter(Boolean);
		const pathId = parts[parts.length - 1];

		const deviceId = idParam || pathId;
		const type = url.searchParams.get('type') ?? undefined;

		return deviceId ? { cardid: deviceId, type } : null;
	} catch {
		return null;
	}
}
