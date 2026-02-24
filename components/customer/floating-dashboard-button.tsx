'use client';

import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

interface FloatingDashboardButtonProps {
	/** Optional: thread to return to if navigated from a thread */
	fromThreadId?: string;
}

export default function FloatingDashboardButton({
	fromThreadId,
}: FloatingDashboardButtonProps) {
	return (
		<Link
			href='/connect'
			className='fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-500 active:scale-95'
			title='Go to Dashboard'
		>
			<LayoutDashboard className='h-5 w-5' />
		</Link>
	);
}
