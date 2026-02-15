'use client';

import { useEffect, useRef } from 'react';

/**
 * Fire-and-forget component that records a QR scan interaction
 * when mounted. Renders nothing.
 */
export default function ScanRecorder({
	deviceId,
	slug,
}: {
	deviceId?: string;
	slug?: string;
}) {
	const recorded = useRef(false);

	useEffect(() => {
		if (recorded.current) return;
		if (!deviceId && !slug) return;
		recorded.current = true;

		const body: Record<string, string> = { method: 'SCAN' };
		if (deviceId) body.deviceId = deviceId;
		if (slug) body.slug = slug;

		fetch('/api/connect/card-interactions/record', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		}).catch(() => {});
	}, [deviceId, slug]);

	return null;
}
