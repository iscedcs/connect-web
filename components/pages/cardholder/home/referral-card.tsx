'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Share2, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ReferralCardProps {
	username?: string | null;
	slug?: string | null;
}

export default function ReferralCard({ username, slug }: ReferralCardProps) {
	const referralCode = (username || slug || 'alex_connect').replace(/^@/, '');
	const baseUrl =
		process.env.NEXT_PUBLIC_URL ||
		(typeof window !== 'undefined' ? window.location.origin : '');
	const shareUrl = `${baseUrl.replace(/\/$/, '')}/r/${referralCode}`;

	const [copied, setCopied] = useState(false);

	const handleShare = async () => {
		if (typeof navigator !== 'undefined' && navigator.share) {
			try {
				await navigator.share({
					title: 'Join ISCE Connect',
					text: `Join me on ISCE Connect using my referral code ${referralCode}!`,
					url: shareUrl,
				});
			} catch {
				// User cancelled share sheet or error
			}
		} else {
			handleCopy();
		}
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			toast.success('Referral link copied to clipboard!');
			setTimeout(() => setCopied(false), 2500);
		} catch {
			toast.error('Failed to copy referral link');
		}
	};

	return (
		<div>
			<div className='bg-neutral-900 rounded-2xl p-5 py-5 space-y-4 overflow-hidden border border-white/5'>
				<div className='space-y-1'>
					<div className='flex justify-between items-center'>
						<h3 className='text-lg font-medium text-white'>Referrals</h3>
						<Link
							href={'/referral'}
							className='flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors'
						>
							View analytics
							<ArrowRight className='size-3.5' />
						</Link>
					</div>
					<p className='text-sm text-gray-400'>
						Share your referral code and link with friends and receive a bonus
						reward from us for the referral.
					</p>
				</div>
				<div className='flex items-center gap-2 pt-1'>
					<Button
						onClick={handleShare}
						className='rounded-full px-4 py-2 w-fit gap-1.5 text-xs font-medium'
						variant='secondary'
					>
						<Share2 className='size-3.5' />
						Share link
					</Button>
					<Button
						onClick={handleCopy}
						className='rounded-full px-3 py-2 w-fit gap-1.5 text-xs font-medium text-neutral-300 hover:text-white'
						variant='ghost'
						title='Copy referral link'
					>
						{copied ? (
							<>
								<Check className='size-3.5 text-emerald-400' />
								<span className='text-emerald-400'>Copied</span>
							</>
						) : (
							<>
								<Copy className='size-3.5' />
								<span>Copy link</span>
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
