'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Renders a floating "Back to Thread" button when navigated from a thread conversation.
 * Reads `from=thread` and `threadId=X` from URL search params.
 */
export default function BackToThreadButton() {
	const searchParams = useSearchParams();
	const from = searchParams.get('from');
	const threadId = searchParams.get('threadId');

	if (from !== 'thread' || !threadId) return null;

	return (
		<Link
			href={`/connect/artisan/threads/${threadId}`}
			className='fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md shadow-lg transition hover:bg-white/20 active:scale-95'
		>
			<ArrowLeft className='h-4 w-4' />
			Back to Thread
		</Link>
	);
}
