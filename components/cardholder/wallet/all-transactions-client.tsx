'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WalletTransaction } from '@/lib/services/wallet';

/** Format a Decimal string as ₦X,XXX.XX */
function formatNaira(value: number | string | null): string {
	const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
	return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
	const d = new Date(iso);
	return d.toLocaleDateString('en-NG', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

function formatTime(iso: string) {
	const d = new Date(iso);
	return d.toLocaleTimeString('en-NG', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
	});
}

export default function AllTransactionsClient({
	transactions,
	pagination,
}: {
	transactions: WalletTransaction[];
	pagination: { page: number; perPage: number; total: number; pages: number };
}) {
	const router = useRouter();
	const searchParams = useSearchParams();

	function goToPage(p: number) {
		const params = new URLSearchParams(searchParams.toString());
		params.set('page', String(p));
		router.push(`/wallet/transactions?${params.toString()}`);
	}

	return (
		<div className='min-h-screen bg-black text-white'>
			{/* Header */}
			<div className='flex items-center gap-3 px-4 pt-6 pb-4'>
				<button
					onClick={() => router.back()}
					className='text-white'
					aria-label='Go back'
				>
					<ArrowLeft size={20} />
				</button>
				<h1 className='text-lg font-semibold'>All Transactions</h1>
			</div>

			{/* Transaction list */}
			<div className='px-4 space-y-3'>
				{transactions.length === 0 && (
					<p className='text-center text-white/50 py-10'>
						No transactions yet.
					</p>
				)}

				{transactions.map((tx) => {
					const amount = parseFloat(tx.amount);
					const prefix = tx.flow === 'CREDIT' ? '+' : '-';
					const amountStr = `${prefix}${formatNaira(amount)}`;

					return (
						<Link
							key={tx.id}
							href={`/wallet/tx/${tx.reference}`}
							className='flex items-center justify-between rounded-xl bg-neutral-900 px-3 py-3'
						>
							<div className='flex items-start gap-3'>
								<span className='w-8 h-8 rounded-full bg-white/10 overflow-hidden flex items-center justify-center'>
									<img
										src='/assets/Vector.svg'
										alt=''
										className='w-full h-full object-cover'
									/>
								</span>
								<div className='min-w-0'>
									<p className='text-sm line-clamp-1'>
										{tx.description ||
											tx.type.replace(/_/g, ' ')}
									</p>
									<p className='text-[11px] text-white/60'>
										{formatDate(tx.createdAt)}{' '}
										<span className='ml-2'>
											{formatTime(tx.createdAt)}
										</span>
									</p>
								</div>
							</div>
							<div
								className={cn(
									'text-sm whitespace-nowrap ml-2',
									amountStr.startsWith('-') ? 'text-red-300'
									:	'text-green-300',
								)}
							>
								{amountStr}
							</div>
						</Link>
					);
				})}
			</div>

			{/* Pagination */}
			{pagination.pages > 1 && (
				<div className='flex items-center justify-center gap-4 py-6'>
					<button
						onClick={() => goToPage(pagination.page - 1)}
						disabled={pagination.page <= 1}
						className='p-2 rounded-lg bg-neutral-900 disabled:opacity-30'
						aria-label='Previous page'
					>
						<ChevronLeft size={18} />
					</button>
					<span className='text-sm text-white/70'>
						Page {pagination.page} of {pagination.pages}
					</span>
					<button
						onClick={() => goToPage(pagination.page + 1)}
						disabled={pagination.page >= pagination.pages}
						className='p-2 rounded-lg bg-neutral-900 disabled:opacity-30'
						aria-label='Next page'
					>
						<ChevronRight size={18} />
					</button>
				</div>
			)}
		</div>
	);
}
