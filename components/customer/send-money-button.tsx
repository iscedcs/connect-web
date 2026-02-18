'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SendHorizonal, ExternalLink } from 'lucide-react';

interface SendMoneyButtonProps {
	recipientUserId: string;
	recipientName: string;
	recipientPhoto?: string;
	recipientPosition?: string;
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

export default function SendMoneyButton({
	recipientUserId,
	recipientName,
	recipientPhoto,
	recipientPosition,
}: SendMoneyButtonProps) {
	const [open, setOpen] = useState(false);

	const walletUrl = process.env.NEXT_PUBLIC_WALLET_WEB_URL || '';
	const sendUrl =
		walletUrl ?
			`${walletUrl}/send?toUserId=${encodeURIComponent(recipientUserId)}&toName=${encodeURIComponent(recipientName)}`
		:	null;

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
				<DialogContent className='bg-[#0d0d0d] border border-white/10 text-white max-w-sm rounded-2xl'>
					<DialogHeader>
						<DialogTitle className='text-base font-semibold'>
							Send money
						</DialogTitle>
						<DialogDescription className='text-white/50 text-xs'>
							You&apos;ll complete the transfer in the ISCE Wallet
							app.
						</DialogDescription>
					</DialogHeader>

					{/* Recipient card */}
					<div className='flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mt-1'>
						<Avatar className='w-12 h-12 shrink-0'>
							<AvatarImage
								src={recipientPhoto}
								alt={recipientName}
								className='object-cover'
							/>
							<AvatarFallback className='bg-white/10 text-white text-sm font-semibold'>
								{getInitials(recipientName)}
							</AvatarFallback>
						</Avatar>
						<div className='min-w-0'>
							<p className='font-semibold text-sm truncate'>
								{recipientName}
							</p>
							{recipientPosition && (
								<p className='text-xs text-white/50 truncate'>
									{recipientPosition}
								</p>
							)}
							<p className='text-xs text-green-400 mt-0.5 flex items-center gap-1'>
								<span className='w-1.5 h-1.5 rounded-full bg-green-400 inline-block' />
								ISCE Wallet active
							</p>
						</div>
					</div>

					<div className='flex flex-col gap-2 mt-2'>
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
				</DialogContent>
			</Dialog>
		</>
	);
}
