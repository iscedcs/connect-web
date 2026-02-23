'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { Booking, BookingStatus } from '@/lib/types/artisan';
import { BASE_URLS, URLS } from '@/lib/const';
import {
	ArrowLeft,
	Loader2,
	Calendar,
	Clock,
	ChevronRight,
	ClipboardList,
} from 'lucide-react';
import Link from 'next/link';

interface ArtisanBookingsClientProps {
	bookingsData: {
		bookings: Booking[];
		total: number;
		page: number;
		totalPages: number;
	};
	accessToken: string;
	profileId: string;
}

const STATUS_FILTERS: { value: string; label: string }[] = [
	{ value: '', label: 'All' },
	{ value: 'PENDING', label: 'Pending' },
	{ value: 'CONFIRMED', label: 'Confirmed' },
	{ value: 'IN_PROGRESS', label: 'In Progress' },
	{ value: 'COMPLETED', label: 'Completed' },
	{ value: 'CANCELLED', label: 'Cancelled' },
	{ value: 'NO_SHOW', label: 'No Show' },
];

function statusColor(status: BookingStatus): string {
	switch (status) {
		case 'PENDING':
			return 'bg-amber-500/20 text-amber-300';
		case 'CONFIRMED':
			return 'bg-blue-500/20 text-blue-300';
		case 'IN_PROGRESS':
			return 'bg-purple-500/20 text-purple-300';
		case 'COMPLETED':
			return 'bg-emerald-500/20 text-emerald-300';
		case 'CANCELLED':
			return 'bg-red-500/20 text-red-300';
		case 'NO_SHOW':
			return 'bg-orange-500/20 text-orange-300';
		default:
			return 'bg-white/10 text-white/60';
	}
}

function statusLabel(status: BookingStatus): string {
	switch (status) {
		case 'PENDING':
			return 'Pending';
		case 'CONFIRMED':
			return 'Confirmed';
		case 'IN_PROGRESS':
			return 'In Progress';
		case 'COMPLETED':
			return 'Completed';
		case 'CANCELLED':
			return 'Cancelled';
		case 'NO_SHOW':
			return 'No Show';
		default:
			return status;
	}
}

function buildUrl(template: string, params: Record<string, string>): string {
	let url = template;
	for (const [key, value] of Object.entries(params)) {
		url = url.replace(`{${key}}`, encodeURIComponent(value));
	}
	return url;
}

export default function ArtisanBookingsClient({
	bookingsData,
	accessToken,
	profileId,
}: ArtisanBookingsClientProps) {
	const router = useRouter();
	const [bookings, setBookings] = useState<Booking[]>(bookingsData.bookings);
	const [activeFilter, setActiveFilter] = useState('');
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const [cancelReason, setCancelReason] = useState('');

	const filteredBookings =
		activeFilter ?
			bookings.filter((b) => b.status === activeFilter)
		:	bookings;

	const executeAction = async (
		action: 'confirm' | 'start' | 'complete' | 'cancel',
		bookingId: string,
		body?: Record<string, unknown>,
	) => {
		setActionLoading(`${action}-${bookingId}`);
		try {
			const urlMap: Record<string, string> = {
				confirm: URLS.artisan.confirm_booking,
				start: URLS.artisan.start_booking,
				complete: URLS.artisan.complete_booking,
				cancel: URLS.artisan.cancel_booking,
			};

			const url = buildUrl(urlMap[action], {
				profileId,
				bookingId,
			});
			const res = await fetch(`${BASE_URLS.CONNECT_API}${url}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: body ? JSON.stringify(body) : undefined,
			});

			const json = await res.json().catch(() => null);

			if (!res.ok) {
				toast.error(json?.message || `Failed to ${action} booking`);
				return;
			}

			toast.success(
				`Booking ${
					action === 'confirm' ? 'confirmed'
					: action === 'start' ? 'started'
					: action === 'complete' ? 'completed'
					: 'cancelled'
				}`,
			);
			setCancelReason('');
			setExpandedId(null);
			router.refresh();
		} catch {
			toast.error('Network error');
		} finally {
			setActionLoading(null);
		}
	};

	const getActions = (booking: Booking) => {
		const actions: {
			key: string;
			label: string;
			action: 'confirm' | 'start' | 'complete' | 'cancel';
			variant: 'default' | 'destructive';
		}[] = [];

		switch (booking.status) {
			case 'PENDING':
				actions.push({
					key: 'confirm',
					label: 'Confirm',
					action: 'confirm',
					variant: 'default',
				});
				actions.push({
					key: 'cancel',
					label: 'Decline',
					action: 'cancel',
					variant: 'destructive',
				});
				break;
			case 'CONFIRMED':
				actions.push({
					key: 'start',
					label: 'Start Job',
					action: 'start',
					variant: 'default',
				});
				actions.push({
					key: 'cancel',
					label: 'Cancel',
					action: 'cancel',
					variant: 'destructive',
				});
				break;
			case 'IN_PROGRESS':
				actions.push({
					key: 'complete',
					label: 'Mark Complete',
					action: 'complete',
					variant: 'default',
				});
				break;
		}

		return actions;
	};

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-3'>
				<Link
					href='/connect/artisan'
					className='p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'
				>
					<ArrowLeft className='size-4' />
				</Link>
				<div className='flex-1'>
					<h1 className='text-xl font-semibold'>Bookings</h1>
					<p className='text-xs text-white/50'>
						{bookingsData.total} total booking
						{bookingsData.total !== 1 ? 's' : ''}
					</p>
				</div>
			</div>

			{/* Status Filters */}
			<div className='flex gap-2 overflow-x-auto pb-1 scrollbar-none'>
				{STATUS_FILTERS.map((f) => (
					<button
						key={f.value}
						type='button'
						onClick={() => setActiveFilter(f.value)}
						className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
							activeFilter === f.value ?
								'bg-purple-600 text-white'
							:	'bg-white/5 text-white/60 hover:bg-white/10'
						}`}
					>
						{f.label}
					</button>
				))}
			</div>

			{/* Booking List */}
			{filteredBookings.length === 0 ?
				<div className='flex flex-col items-center py-16 gap-4 text-center'>
					<ClipboardList className='size-10 text-white/20' />
					<div>
						<p className='text-sm text-white/50'>
							No bookings
							{activeFilter ? ' with this status' : ' yet'}
						</p>
						<p className='text-xs text-white/30 mt-1'>
							Bookings from clients will appear here
						</p>
					</div>
				</div>
			:	<div className='space-y-2'>
					{filteredBookings.map((booking) => {
						const isExpanded = expandedId === booking.id;
						const actions = getActions(booking);

						return (
							<div
								key={booking.id}
								className='bg-white/5 rounded-xl border border-white/5 overflow-hidden'
							>
								{/* Booking Row */}
								<button
									type='button'
									onClick={() =>
										setExpandedId(
											isExpanded ? null : booking.id,
										)
									}
									className='w-full p-4 flex items-center gap-3 text-left'
								>
									<div className='flex-1 min-w-0'>
										<div className='flex items-center gap-2'>
											<p className='text-sm font-medium truncate'>
												{booking.service?.name ||
													'General Booking'}
											</p>
											<span
												className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColor(booking.status)}`}
											>
												{statusLabel(booking.status)}
											</span>
										</div>
										<div className='flex items-center gap-3 mt-1.5 text-xs text-white/40'>
											<span className='flex items-center gap-1'>
												<Calendar className='size-3' />
												{new Date(
													booking.scheduledDate,
												).toLocaleDateString('en-NG', {
													month: 'short',
													day: 'numeric',
												})}
											</span>
											{booking.scheduledTime && (
												<span className='flex items-center gap-1'>
													<Clock className='size-3' />
													{booking.scheduledTime}
												</span>
											)}
										</div>
									</div>
									{booking.agreedPrice != null && (
										<p className='text-sm font-medium text-white/70'>
											₦
											{booking.agreedPrice.toLocaleString()}
										</p>
									)}
									<ChevronRight
										className={`size-4 text-white/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
									/>
								</button>

								{/* Expanded Detail */}
								{isExpanded && (
									<div className='border-t border-white/5 p-4 space-y-3'>
										{booking.note && (
											<div>
												<p className='text-[10px] text-white/40 uppercase mb-1'>
													Note
												</p>
												<p className='text-xs text-white/70'>
													{booking.note}
												</p>
											</div>
										)}

										{booking.cancellationReason && (
											<div>
												<p className='text-[10px] text-white/40 uppercase mb-1'>
													Cancellation Reason
												</p>
												<p className='text-xs text-red-300'>
													{booking.cancellationReason}
												</p>
											</div>
										)}

										<p className='text-[10px] text-white/30'>
											Booked{' '}
											{new Date(
												booking.createdAt,
											).toLocaleDateString('en-NG', {
												month: 'long',
												day: 'numeric',
												year: 'numeric',
											})}
										</p>

										{/* Cancel Reason Input */}
										{actions.some(
											(a) => a.action === 'cancel',
										) && (
											<div className='space-y-1.5'>
												<input
													type='text'
													value={cancelReason}
													onChange={(e) =>
														setCancelReason(
															e.target.value,
														)
													}
													placeholder='Reason for cancellation (required)'
													className='w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20'
												/>
											</div>
										)}

										{/* Actions */}
										{actions.length > 0 && (
											<div className='flex gap-2'>
												{actions.map((a) => (
													<Button
														key={a.key}
														size='sm'
														variant={
															(
																a.variant ===
																'destructive'
															) ?
																'outline'
															:	'default'
														}
														disabled={
															actionLoading ===
																`${a.action}-${booking.id}` ||
															(a.action ===
																'cancel' &&
																!cancelReason.trim())
														}
														onClick={() =>
															executeAction(
																a.action,
																booking.id,
																(
																	a.action ===
																		'cancel'
																) ?
																	{
																		reason: cancelReason.trim(),
																	}
																:	undefined,
															)
														}
														className={
															(
																a.variant ===
																'default'
															) ?
																'bg-purple-600 hover:bg-purple-700'
															:	'border-red-500/30 text-red-400 hover:bg-red-500/10'
														}
													>
														{(
															actionLoading ===
															`${a.action}-${booking.id}`
														) ?
															<Loader2 className='size-3.5 animate-spin' />
														:	a.label}
													</Button>
												))}
											</div>
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			}
		</div>
	);
}
