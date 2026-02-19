'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SendHorizonal, Copy, ExternalLink, Check } from 'lucide-react';
import QRCode from 'qrcode';
import type { PublicWalletProfile } from '@/lib/services/wallet';

interface SendMoneyButtonProps {
	recipientUserId: string;
	recipientName: string;
	recipientPhoto?: string;
	recipientPosition?: string;
	wallet: PublicWalletProfile;
}

function getInitials(name: string) {
	return name
		.split(' ')
		.map((n) => n[0])
		.filter(Boolean)
		.slice(0, 2)
		.join('')
		.toUpperCase();
}

function CopyField({ label, value }: { label: string; value: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// fallback silently
		}
	};

	return (
		<div className='flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10'>
			<div className='min-w-0'>
				<p className='text-[10px] text-white/40 uppercase tracking-wider mb-0.5'>
					{label}
				</p>
				<p className='text-sm font-mono text-white truncate'>{value}</p>
			</div>
			<button
				onClick={handleCopy}
				className='shrink-0 text-white/50 hover:text-white transition'
				title='Copy'
			>
				{copied ?
					<Check className='w-4 h-4 text-emerald-400' />
				:	<Copy className='w-4 h-4' />}
			</button>
		</div>
	);
}

export default function SendMoneyButton({
	recipientUserId,
	recipientName,
	recipientPhoto,
	recipientPosition,
	wallet,
}: SendMoneyButtonProps) {
	const [open, setOpen] = useState(false);
	const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

	const walletUrl = process.env.NEXT_PUBLIC_WALLET_WEB_URL || '';
	const sendUrl =
		walletUrl ?
			`${walletUrl}/send?toUserId=${encodeURIComponent(recipientUserId)}&toName=${encodeURIComponent(recipientName)}`
		:	null;

	useEffect(() => {
		if (!open || !sendUrl) return;
		let cancelled = false;
		QRCode.toDataURL(sendUrl, {
			width: 220,
			margin: 2,
			color: { dark: '#FFFFFF', light: '#0d0d0d' },
			errorCorrectionLevel: 'M',
		})
			.then((url) => {
				if (!cancelled) setQrDataUrl(url);
			})
			.catch(() => {
				if (!cancelled) setQrDataUrl(null);
			});
		return () => {
			cancelled = true;
		};
	}, [open, sendUrl]);

	return (
		<>
			<button
				onClick={() => setOpen(true)}
				className='px-5 py-2 bg-white text-black rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-white/90 transition cursor-pointer'
			>
				<SendHorizonal className='w-3.5 h-3.5' />
				Send money
			</button>

			<Dialog
				open={open}
				onOpenChange={setOpen}
			>
				<DialogContent className='bg-[#0d0d0d] border border-white/10 text-white max-w-sm rounded-2xl p-0 overflow-hidden gap-0'>
					<DialogHeader className='px-5 pt-5 pb-0'>
						<DialogTitle className='text-base font-semibold'>
							Send money
						</DialogTitle>
					</DialogHeader>

					<div className='px-5 pt-4 pb-5 space-y-4'>
						{/* Recipient card */}
						<div className='flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10'>
							<Avatar className='w-11 h-11 shrink-0'>
								<AvatarImage
									src={recipientPhoto}
									alt={recipientName}
									className='object-cover'
								/>
								<AvatarFallback className='bg-white/10 text-white text-sm font-semibold'>
									{getInitials(recipientName)}
								</AvatarFallback>
							</Avatar>
							<div className='min-w-0 flex-1'>
								<p className='font-semibold text-sm truncate'>
									{recipientName}
								</p>
								{recipientPosition && (
									<p className='text-xs text-white/50 truncate'>
										{recipientPosition}
									</p>
								)}
								<p className='text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1'>
									<span className='w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block' />
									ISCE Wallet active
								</p>
							</div>
						</div>

						{/* Payment details */}
						<div className='space-y-2'>
							{wallet.isceTag && (
								<CopyField
									label='ISCE Tag'
									value={wallet.isceTag}
								/>
							)}
							{wallet.accountNumber && (
								<CopyField
									label={
										wallet.bankName ?
											`Account · ${wallet.bankName}`
										:	'Virtual Account Number'
									}
									value={wallet.accountNumber}
								/>
							)}
							{wallet.accountName && (
								<CopyField
									label='Account Name'
									value={wallet.accountName}
								/>
							)}
						</div>

						{/* QR Code */}
						{qrDataUrl && (
							<div className='flex flex-col items-center gap-2 pt-1'>
								<p className='text-[10px] text-white/40 uppercase tracking-wider'>
									Scan with ISCE Wallet app
								</p>
								<div className='rounded-xl overflow-hidden border border-white/10 p-2 bg-[#0d0d0d]'>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={qrDataUrl}
										alt='Payment QR Code'
										width={200}
										height={200}
										className='block'
									/>
								</div>
								{wallet.txLimit != null && (
									<p className='text-[11px] text-white/30'>
										Single tx limit: ₦
										{wallet.txLimit.toLocaleString('en-NG')}
									</p>
								)}
							</div>
						)}

						{/* CTAs */}
						<div className='flex flex-col gap-2'>
							{sendUrl ?
								<a
									href={sendUrl}
									target='_blank'
									rel='noopener noreferrer'
								>
									<Button className='w-full rounded-xl bg-white text-black hover:bg-white/90 font-semibold gap-2'>
										<ExternalLink className='w-4 h-4' />
										Open ISCE Wallet to send
									</Button>
								</a>
							:	<p className='text-xs text-white/40 text-center py-2'>
									Wallet service is currently unavailable.
								</p>
							}
							<Button
								variant='ghost'
								onClick={() => setOpen(false)}
								className='w-full rounded-xl text-white/60 hover:text-white hover:bg-white/5'
							>
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
