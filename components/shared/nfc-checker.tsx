'use client';
import { WebNFCUtils } from '@/lib/web-nfc.utils';
import { Badge } from '../ui/badge';
import { useEffect, useState } from 'react';

export default function NFCChecker() {
	const [hasNFC, setHasNFC] = useState(false);
	const [isCheckingNFC, setIsCheckingNFC] = useState(true);

	useEffect(() => {
		const checkNFCCapability = async () => {
			try {
				const nfcSupported = WebNFCUtils.isNFCSupported();
				const nfcCapable = await WebNFCUtils.hasNFCCapability();
				setHasNFC(nfcSupported && nfcCapable);
			} catch (error) {
				console.warn('Failed to check NFC capability:', error);
				setHasNFC(false);
			} finally {
				setIsCheckingNFC(false);
			}
		};

		checkNFCCapability();
	}, []);

	if (isCheckingNFC) {
		return (
			<div className='p-4 bg-neutral-900 rounded-lg text-center m-5 animate-pulse'>
				<p>Checking NFC capability...</p>
			</div>
		);
	}

	return (
		<div className='p-4 bg-neutral-900 rounded-lg text-center m-5'>
			<h2>NFC Checker</h2>
			<Badge variant={hasNFC ? 'secondary' : 'destructive'}>
				{hasNFC
					? 'NFC is supported on this device'
					: 'NFC is not supported on this device'}
			</Badge>
			<p className='text-sm text-gray-400 mt-2'>
				(Note: For full NFC capability check, please navigate to the
				Connect page)
			</p>
		</div>
	);
}
