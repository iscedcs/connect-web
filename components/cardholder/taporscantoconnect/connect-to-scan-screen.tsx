'use client';

import { Button } from '@/components/ui/button';
import { InfoIcon } from '@/lib/icons';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import QrScanner from 'qr-scanner';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { extractDeviceFromURL } from '@/lib/device-extract';

export default function ConnectScanScreen({
	onTapInstead,
	backHref = '/',
}: {
	onTapInstead?: () => void;
	backHref?: string;
}) {
	const router = useRouter();

	const videoRef = useRef<HTMLVideoElement | null>(null);
	const scannerRef = useRef<QrScanner | null>(null);
	const hasNavigatedRef = useRef(false);

	const [hasCamera, setHasCamera] = useState(true);
	const [scanning, setScanning] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState('Starting camera…');

	// ---- helpers -------------------------------------------------------------

	const stopScan = useCallback(() => {
		if (scannerRef.current) {
			scannerRef.current.stop();
			scannerRef.current.destroy();
			scannerRef.current = null;
		}
		setScanning(false);
	}, []);

	const navigateWith = useCallback(
		(resultText: string) => {
			if (hasNavigatedRef.current) return;

			const extracted = extractDeviceFromURL(resultText);
			console.log('[QR Scanner] extractDeviceFromURL result:', extracted);

			if (!extracted?.cardid) {
				console.log(
					'[QR Scanner] Invalid QR — no cardid found in:',
					resultText,
				);
				setStatus('Invalid ISCE QR code');
				return;
			}

			console.log(
				'[QR Scanner] Navigating with cardid:',
				extracted.cardid,
			);
			hasNavigatedRef.current = true;
			stopScan();

			const params = new URLSearchParams({
				cardid: extracted.cardid,
			});

			if (extracted.type) {
				params.set('type', extracted.type);
			}

			router.push(`/otp/idle?${params.toString()}`);
		},
		[router, stopScan],
	);

	// ---- handle scan result --------------------------------------------------

	const handleScanResult = useCallback(
		(result: QrScanner.ScanResult) => {
			console.log('[QR Scanner] Scan result received:', result);
			if (result.data) {
				console.log('[QR Scanner] QR data:', result.data);
				setStatus('Code detected. Processing…');
				navigateWith(result.data);
			}
		},
		[navigateWith],
	);

	// ---- start scanner -------------------------------------------------------

	useEffect(() => {
		let cancelled = false;

		(async () => {
			setError(null);
			setStatus('Starting camera…');
			console.log('[QR Scanner] Checking camera availability…');

			// Check if device has a camera
			const cameraAvailable = await QrScanner.hasCamera();
			console.log('[QR Scanner] Camera available:', cameraAvailable);
			if (!cameraAvailable) {
				setHasCamera(false);
				setError('No camera found. Use NFC Tap instead.');
				return;
			}

			if (!videoRef.current || cancelled) return;

			try {
				const scanner = new QrScanner(
					videoRef.current,
					handleScanResult,
					{
						preferredCamera: 'environment',
						highlightScanRegion: false,
						highlightCodeOutline: false,
						returnDetailedScanResult: true,
					},
				);

				scannerRef.current = scanner;
				console.log('[QR Scanner] Starting scanner…');
				await scanner.start();
				console.log(
					'[QR Scanner] Scanner started successfully. Actively scanning for QR codes.',
				);

				if (cancelled) {
					scanner.stop();
					scanner.destroy();
					scannerRef.current = null;
					return;
				}

				setScanning(true);
				setStatus('Point your camera at the code');
			} catch (e: unknown) {
				const err = e as { name?: string; message?: string };
				console.error('Camera error:', e);

				if (err?.name === 'NotAllowedError') {
					setError(
						'Camera permission denied. Allow camera access or use NFC Tap instead.',
					);
				} else {
					setError('Unable to start camera. Try NFC Tap instead.');
				}
			}
		})();

		return () => {
			cancelled = true;
			stopScan();
		};
	}, [handleScanResult, stopScan]);

	// ---- UI ------------------------------------------------------------------

	return (
		<div className='h-[100svh] bg-black text-white flex flex-col'>
			<div className='mx-auto w-full'>
				<div className='flex bg-white/10 px-3 py-2 text-xs backdrop-blur'>
					<span className='mr-2'>
						<InfoIcon />
					</span>
					Ensure your NFC is turned on to connect successfully — or
					scan the QR.
				</div>
			</div>

			{/* top bar */}
			<div className='mx-auto w-full max-w-screen-sm px-4 py-3 flex items-center justify-between'>
				<Link
					href={backHref}
					className='text-white/90 text-xl'
				>
					<ArrowLeft />
				</Link>
			</div>

			{/* camera preview */}
			<div className='mx-auto w-full max-w-screen-sm flex-1 px-4 pb-4'>
				<div className='relative w-full overflow-hidden rounded-xl'>
					<div className='w-full aspect-[9/12] bg-black'>
						{error ?
							<div className='w-full h-full flex items-center justify-center text-center px-6'>
								<p className='text-sm text-white/80'>{error}</p>
							</div>
						:	<video
								ref={videoRef}
								playsInline
								muted
								className='w-full h-full object-cover'
							/>
						}
					</div>

					{/* overlay guide */}
					{!error && scanning && (
						<div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
							<div className='w-3/4 h-1/3 rounded-xl border-2 border-white/50' />
						</div>
					)}
				</div>

				{/* status text */}
				<p className='mt-3 text-center text-xs text-white/70'>
					{status}
				</p>
			</div>

			{/* bottom button */}
			<div className='mx-auto w-full max-w-screen-sm px-4 pb-6'>
				<Button
					onClick={onTapInstead}
					className='w-full rounded-2xl bg-white text-black py-6 text-base font-medium shadow-sm active:translate-y-px'
				>
					Tap device instead
				</Button>
			</div>
		</div>
	);
}
