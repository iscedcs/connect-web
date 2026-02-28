'use client';

import Link from 'next/link';

export default function OfflinePage() {
	return (
		<div className='flex min-h-svh flex-col items-center justify-center bg-black px-6 text-center text-white'>
			<div className='mb-6 text-6xl'>📡</div>
			<h1 className='mb-2 text-2xl font-bold'>You&apos;re offline</h1>
			<p className='mb-8 max-w-sm text-sm text-neutral-400'>
				It looks like you&apos;ve lost your internet connection. Check
				your network and try again.
			</p>
			<button
				onClick={() => window.location.reload()}
				className='rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200'
			>
				Try again
			</button>
			<Link
				href='/'
				className='mt-4 text-sm text-neutral-500 underline underline-offset-4 hover:text-white'
			>
				Go home
			</Link>
		</div>
	);
}
