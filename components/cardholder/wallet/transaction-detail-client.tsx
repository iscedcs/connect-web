'use client';

import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    XCircle,
    AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WalletTransactionDetail } from '@/lib/services/wallet';

function formatNaira(value: number | string | null): string {
	const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
	return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusIcon(status: string) {
	switch (status) {
		case 'COMPLETED':
			return (
				<CheckCircle2
					size={40}
					className='text-green-400'
				/>
			);
		case 'PENDING':
		case 'PROCESSING':
			return (
				<Clock
					size={40}
					className='text-yellow-400'
				/>
			);
		case 'FAILED':
			return (
				<XCircle
					size={40}
					className='text-red-400'
				/>
			);
		case 'REVERSED':
			return (
				<AlertTriangle
					size={40}
					className='text-orange-400'
				/>
			);
		default:
			return (
				<Clock
					size={40}
					className='text-white/50'
				/>
			);
	}
}

function statusColor(status: string) {
	switch (status) {
		case 'COMPLETED':
			return 'text-green-400';
		case 'PENDING':
		case 'PROCESSING':
			return 'text-yellow-400';
		case 'FAILED':
			return 'text-red-400';
		case 'REVERSED':
			return 'text-orange-400';
		default:
			return 'text-white/50';
	}
}

function formatType(type: string) {
	return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDateTime(iso: string) {
	const d = new Date(iso);
	const date = d.toLocaleDateString('en-NG', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
	const time = d.toLocaleTimeString('en-NG', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: true,
	});
	return `${date} at ${time}`;
}

function DetailRow({
	label,
	value,
	className,
}: {
	label: string;
	value: React.ReactNode;
	className?: string;
}) {
	if (!value) return null;
	return (
		<div className='flex items-start justify-between py-3 border-b border-white/5 last:border-b-0'>
			<span className='text-sm text-white/50'>{label}</span>
			<span
				className={cn(
					'text-sm text-right max-w-[55%] break-all',
					className,
				)}
			>
				{value}
			</span>
		</div>
	);
}

export default function TransactionDetailClient({
	transaction: tx,
}: {
	transaction: WalletTransactionDetail;
}) {
	const router = useRouter();
	const amount = parseFloat(tx.amount);
	const fee = parseFloat(tx.fee);
	const prefix = tx.flow === 'CREDIT' ? '+' : '-';

	return (
		<div className='min-h-screen bg-black text-white'>
			{/* Header */}
			<div className='flex items-center gap-3 px-4 pt-6 pb-2'>
				<button
                title='back'
					onClick={() => router.back()}
					className='text-white'
				>
					<ArrowLeft size={20} />
				</button>
				<h1 className='text-lg font-semibold'>Transaction Details</h1>
			</div>

			{/* Status + Amount hero */}
			<div className='flex flex-col items-center pt-6 pb-8'>
				{statusIcon(tx.status)}
				<p
					className={cn(
						'text-3xl font-bold mt-3',
						tx.flow === 'CREDIT' ?
							'text-green-300'
						:	'text-red-300',
					)}
				>
					{prefix}
					{formatNaira(amount)}
				</p>
				<p
					className={cn(
						'text-sm mt-1 capitalize',
						statusColor(tx.status),
					)}
				>
					{tx.status.toLowerCase()}
				</p>
			</div>

			{/* Details card */}
			<div className='mx-4 rounded-2xl bg-neutral-900 px-4 py-1'>
				<DetailRow
					label='Description'
					value={tx.description || formatType(tx.type)}
				/>
				<DetailRow
					label='Type'
					value={formatType(tx.type)}
				/>
				<DetailRow
					label='Flow'
					value={
						tx.flow === 'CREDIT' ?
							'Credit (incoming)'
						:	'Debit (outgoing)'
					}
				/>
				<DetailRow
					label='Fee'
					value={fee > 0 ? formatNaira(fee) : 'Free'}
				/>
				<DetailRow
					label='Reference'
					value={tx.reference}
					className='font-mono text-xs'
				/>
				<DetailRow
					label='Date'
					value={formatDateTime(tx.createdAt)}
				/>
				{tx.sourceModule && tx.sourceModule !== 'WALLET' && (
					<DetailRow
						label='Source'
						value={formatType(tx.sourceModule)}
					/>
				)}
				{tx.sourceReference && (
					<DetailRow
						label='Source Ref'
						value={tx.sourceReference}
						className='font-mono text-xs'
					/>
				)}
			</div>

			{/* Balance info */}
			<div className='mx-4 mt-4 rounded-2xl bg-neutral-900 px-4 py-1'>
				<DetailRow
					label='Balance Before'
					value={formatNaira(tx.balanceBefore)}
				/>
				<DetailRow
					label='Balance After'
					value={formatNaira(tx.balanceAfter)}
				/>
			</div>

			{/* Metadata (if any useful data) */}
			{tx.metadata && Object.keys(tx.metadata).length > 0 && (
				<div className='mx-4 mt-4 rounded-2xl bg-neutral-900 px-4 py-1 mb-6'>
					<p className='text-sm text-white/50 py-3 border-b border-white/5'>
						Additional Info
					</p>
					{Object.entries(tx.metadata).map(([key, val]) => (
						<DetailRow
							key={key}
							label={key
								.replace(/_/g, ' ')
								.replace(/\b\w/g, (c) => c.toUpperCase())}
							value={
								typeof val === 'object' ?
									JSON.stringify(val)
								:	String(val)
							}
						/>
					))}
				</div>
			)}

			<div className='h-8' />
		</div>
	);
}
