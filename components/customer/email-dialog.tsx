'use client';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { EmailIcon } from '@/lib/icons';
import { Mail } from 'lucide-react';

type EmailItem = {
	id: string;
	username?: string;
	url?: string;
};

type Props = {
	emails: EmailItem[];
};

export default function EmailDialog({ emails }: Props) {
	if (emails.length === 0) {
		return null;
	}

	// Single email - direct mailto link
	if (emails.length === 1) {
		const email = emails[0].username || emails[0].url;
		return (
			<a
				href={`mailto:${email}`}
				title='email'
				className='hover:opacity-80 transition'
			>
				<EmailIcon />
			</a>
		);
	}

	// Multiple emails - show modal
	return (
		<Dialog>
			<DialogTrigger asChild>
				<button
					title='emails'
					className='hover:opacity-80 transition'
				>
					<EmailIcon />
				</button>
			</DialogTrigger>
			<DialogContent className='bg-[#151515] border-white/10 text-white max-w-sm'>
				<DialogHeader>
					<DialogTitle>Email Addresses</DialogTitle>
				</DialogHeader>
				<div className='space-y-2 mt-4'>
					{emails.map((item) => {
						const email = item.username || item.url;
						return (
							<a
								key={item.id}
								href={`mailto:${email}`}
								className='flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition'
							>
								<div className='w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center shrink-0'>
									<Mail className='w-5 h-5 text-white/70' />
								</div>
								<span className='text-sm text-white truncate'>
									{email}
								</span>
							</a>
						);
					})}
				</div>
			</DialogContent>
		</Dialog>
	);
}
