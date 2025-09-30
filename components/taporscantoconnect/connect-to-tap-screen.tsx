'use client';

import { InfoIcon } from '@/lib/icons';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { nfcUtils, WebNFCUtils } from '@/lib/web-nfc.utils';
import { Button } from '../ui/button';

export default function ConnectTapScreen({
	onScanInstead,
	backHref = '/',
}: {
	onScanInstead?: () => void;
	backHref?: string;
}) {
	const router = useRouter();
	const [isScanning, setIsScanning] = useState(false);
	const [scanStatus, setScanStatus] = useState('Waiting to detect device...');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		startNFCScanning();

		// Cleanup function to stop scanning when component unmounts
		return () => {
			if (nfcUtils.isScanningActive) {
				nfcUtils.stopScan();
			}
		};
	}, []);

	const startNFCScanning = async () => {
		try {
			setIsScanning(true);
			setError(null);
			setScanStatus('Ready to scan - hold your card near the device');

			await nfcUtils.startScan(
				(event) => {
					setScanStatus('Card detected! Processing...');
					handleNFCRead(event);
				},
				(error) => {
					console.error('NFC scan error:', error);
					setError(error.message);
					setScanStatus('Scan failed - tap to retry');
					setIsScanning(false);
				}
			);
		} catch (error) {
			console.error('Failed to start NFC scanning:', error);
			setError(
				error instanceof Error
					? error.message
					: 'Failed to start NFC scanning'
			);
			setScanStatus('Unable to start scanning');
			setIsScanning(false);
		}
	};

	const handleNFCRead = (event: any) => {
		try {
			if (event.records.length === 0) {
				throw new Error('No data found on card');
			}

			const record = event.records[0];
			const cardId = WebNFCUtils.extractCardIdFromURL(record);
			const deviceType = WebNFCUtils.extractDeviceType(record);

			if (!cardId) {
				throw new Error('Invalid card - no ID found');
			}

			setScanStatus('Card verified! Redirecting...');

			// Stop scanning before redirecting
			nfcUtils.stopScan();

			// Build URL with card ID and device type (if available)
			const params = new URLSearchParams({ cardid: cardId });
			if (deviceType) {
				params.append('type', deviceType);
			}

			// Redirect to OTP page with card ID and type
			router.push(`/otp/idle?${params.toString()}`);
		} catch (error) {
			console.error('Error processing card data:', error);
			setError(
				error instanceof Error
					? error.message
					: 'Failed to process card data'
			);
			setScanStatus('Invalid card - try again');
			setIsScanning(false);
		}
	};

	const retryScanning = () => {
		setError(null);
		startNFCScanning();
	};
	return (
		<div className='min-h-screen relative text-white'>
			{/* gradient bg (replace with your asset if you prefer) */}
			<video
				className='absolute inset-0 w-full h-full object-cover'
				src='/assets/GettyImages-1297962402.mp4'
				autoPlay
				loop
				muted
				playsInline
			/>
			<div className='absolute inset-0 bg-black/40' />

			{/* top safety banner */}
			<div className='relative'>
				<div className='mx-auto w-full'>
					<div className=' flex bg-white/10 px-3 py-2 text-xs backdrop-blur'>
						<span className='mr-2'>
							<InfoIcon />
						</span>
						Ensure your NFC is turned on to connect successfully
					</div>
				</div>
			</div>

			{/* back */}
			<div className='relative mx-auto w-full max-w-screen-sm px-4 pt-3'>
				<Link
					href={backHref}
					className='inline-block text-white/90 text-xl'
				>
					<ArrowLeft />
				</Link>
			</div>

			{/* center content */}
			<div className='relative mx-auto w-full max-w-screen-sm px-4'>
				<div className='h-[76vh] flex items-center justify-center'>
					<div className='text-center'>
						<h1
							className={`text-2xl font-bold ${
								isScanning ? 'animate-pulse' : ''
							}`}
						>
							{isScanning ? 'Tap to connect' : 'Ready to scan'}
						</h1>
						<p className='mt-2 text-sm text-white/80'>
							{scanStatus}
						</p>
						{error && (
							<div className='mt-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30'>
								<p className='text-red-200 text-sm'>{error}</p>
								<Button
									onClick={retryScanning}
									className='mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm'
								>
									Retry
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* bottom button */}
			<div className='relative mx-auto w-full max-w-screen-sm px-4 pb-6'>
				<Button
					onClick={onScanInstead}
					disabled={isScanning}
					className='w-full rounded-2xl bg-white text-black py-6 text-base font-medium shadow-sm active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed'
				>
					Scan device instead
				</Button>
			</div>
		</div>
	);
}
