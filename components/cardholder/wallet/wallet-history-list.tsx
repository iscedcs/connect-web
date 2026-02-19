'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import WalletHeader from './wallet-header';

export type WalletTxn = {
	id: string;
	title: string; // "Wallet Top-up"
	date: string; // "Oct 14, 2024"
	time: string; // "04:31 PM"
	amount: string; // "+₦100,000.00"
	iconSrc?: string; // small circle icon
	href?: string;
};

export default function WalletHistoryList({
	items,
	...headerProps
}: {
	items: WalletTxn[];
} & React.ComponentProps<typeof WalletHeader>) {
	const router = useRouter();
	return (
		<div className='min-h-screen bg-black text-white'>
			<WalletHeader
				{...headerProps}
				onSend={
					headerProps.onSend ?? (() => router.push('/wallet/send'))
				}
			/>

			<div className='px-4 mt-5'>
				{/* header row */}
				<div className='flex items-baseline justify-between'>
					<h3 className='text-lg font-medium'>History</h3>
					<Link
						href='/wallet/transactions'
						className='text-xs text-white/70'
					>
						View all
					</Link>
				</div>

				{/* list */}
				<div className='mt-3 space-y-3'>
					{items.map((t) => (
						<Link
							key={t.id}
							href={t.href ?? '#'}
							className='flex items-center justify-between rounded-xl bg-neutral-900 px-3 py-3'
						>
							<div className='flex items-start gap-3'>
								<span className='w-8 h-8 rounded-full bg-white/10 overflow-hidden flex items-center justify-center'>
									{t.iconSrc ?
										<img
											src={t.iconSrc}
											alt=''
											className='w-full h-full object-cover'
										/>
									:	<span className='text-xs sm:text-sm'>
											🏦
										</span>
									}
								</span>
								<div className='min-w-0'>
									<p className='text-xs sm:text-sm line-clamp-1'>
										{t.title}
									</p>
									<p className='text-[11px] text-white/60'>
										{t.date}{' '}
										<span className='ml-2'>{t.time}</span>
									</p>
								</div>
							</div>
							<div
								className={cn(
									'text-xs sm:text-sm',
									t.amount.startsWith('-') ?
										'text-red-300'
									:	'text-green-300',
								)}
							>
								{t.amount}
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
