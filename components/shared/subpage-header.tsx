import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SubpageHeaderProps {
	title: string;
	backHref: string;
	children?: React.ReactNode; // optional right-side actions
}

/**
 * Consistent page header for cardholder sub-pages.
 * Provides a back link, a title, and an optional right-side slot.
 */
export default function SubpageHeader({
	title,
	backHref,
	children,
}: SubpageHeaderProps) {
	return (
		<div className='flex items-center justify-between px-4 py-3 border-b border-white/5'>
			<div className='flex items-center gap-3'>
				<Link
					href={backHref}
					className='p-1.5 -ml-1.5 rounded-full hover:bg-white/10 transition text-white/80 hover:text-white'
					aria-label='Go back'
				>
					<ArrowLeft className='w-5 h-5' />
				</Link>
				<h1 className='text-lg font-semibold tracking-tight'>
					{title}
				</h1>
			</div>
			{children && (
				<div className='flex items-center gap-2'>{children}</div>
			)}
		</div>
	);
}
