'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowRight, Copy, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralStoreCardProps {
	compact?: boolean;
	referralCode?: string | null;
}

export default function ReferralStoreCard({
	compact,
	referralCode: propCode,
}: ReferralStoreCardProps) {
	const [activeCode, setActiveCode] = useState<string | null>(propCode || null);
	const [dismissed, setDismissed] = useState(false);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (propCode) {
			setActiveCode(propCode.replace(/^@/, ''));
		} else {
			try {
				const params = new URLSearchParams(window.location.search);
				const urlCode =
					params.get('referralCode') ||
					params.get('ref') ||
					params.get('referral');
				if (urlCode) {
					setActiveCode(urlCode.replace(/^@/, ''));
				}
			} catch {
				// window.location unavailable
			}
		}
	}, [propCode]);

	if (!activeCode || dismissed) {
		return null;
	}

	const storeUrl = 'https://store.isce.tech/';

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(activeCode);
			setCopied(true);
			toast.success('Referral code copied to clipboard!');
			setTimeout(() => setCopied(false), 2500);
		} catch {
			toast.error('Failed to copy referral code');
		}
	};

	const handleDismiss = () => {
		setDismissed(true);
	};

	return (
		<div className='lg:col-span-2 relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-black p-6 shadow-2xl transition-all duration-300 hover:border-emerald-500/50 group'>
			{/* Ambient Glowing Backdrops */}
			<div className='absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none' />
			<div className='absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none' />

			{/* Dismiss Button */}
			<button
				onClick={handleDismiss}
				className='absolute top-4 right-4 rounded-full p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors'
				title='Dismiss card'
				aria-label='Dismiss card'
			>
				<X className='size-4' />
			</button>

			<div className='relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6'>
				<div className='space-y-3 max-w-xl'>
					<div className='space-y-1'>
						<h3 className='text-xl font-bold text-white tracking-tight'>
							Get Your Smart NFC Card
						</h3>
						<p className='text-sm text-neutral-300 leading-relaxed'>
							You signed up using @{activeCode}&apos;s referral invite. Visit
							our store to buy your contactless card or wearable and start smart
							networking.
						</p>
					</div>
				</div>

				{/* Main Action CTAs */}
				<div className='flex flex-wrap items-center gap-3 shrink-0 pt-2 md:pt-0'>
					<a
						href={storeUrl}
						target='_blank'
						rel='noopener noreferrer'
					>
						<Button
							size='lg'
							className='rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold shadow-lg shadow-emerald-500/20 gap-2 transition-transform active:scale-95'
						>
							<ShoppingBag className='size-4' />
							<span>Go to Store</span>
							<ArrowRight className='size-4 transition-transform group-hover:translate-x-0.5' />
						</Button>
					</a>

					<Button
						onClick={handleCopy}
						variant='outline'
						size='lg'
						className='rounded-full border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium gap-2 transition-all active:scale-95'
						title='Copy referral code'
					>
						{copied ? (
							<>
								<Check className='size-4 text-emerald-400' />
								<span className='text-emerald-400'>Copied Code</span>
							</>
						) : (
							<>
								<Copy className='size-4 text-neutral-400' />
								<span>Copy Code</span>
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
