'use client';

import { Button } from '@/components/ui/button';
import { DeleteIcon, EditIcon } from '@/lib/icons';

export default function SubmissionCard({ submission, onView, onDelete }: any) {
	const preview =
		submission?.values ? Object.values(submission.values)[0] : 'No fields';

	return (
		<div
			className='
      bg-neutral-900/60 border border-white/10 rounded-xl p-4
      flex justify-between items-center
      hover:bg-neutral-900 hover:border-white/20 hover:shadow-lg
      transition-all
    '
		>
			<div className='flex flex-col min-w-0'>
				<p className='text-sm font-medium truncate'>
					{submission.submitterName || 'Anonymous'}
				</p>

				{/* <p className="text-xs text-white/50 truncate">{preview}</p> */}

				<p className='text-2.5 text-white/40 mt-1'>
					{new Date(submission.createdAt).toLocaleString()}
				</p>
			</div>

			<div className='flex items-center gap-3 ml-4 shrink-0'>
				<Button
					variant='ghost'
					size='icon'
					onClick={() => onView(submission)}
				>
					<EditIcon className='w-4 h-4 text-white/70' />
				</Button>

				<Button
					variant='ghost'
					size='icon'
					onClick={() => onDelete(submission.id)}
				>
					<DeleteIcon className='w-4 h-4 text-white/60' />
				</Button>
			</div>
		</div>
	);
}
