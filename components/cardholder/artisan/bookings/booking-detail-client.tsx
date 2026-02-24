'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { Booking, BookingStatus } from '@/lib/types/artisan';
import { BASE_URLS, URLS } from '@/lib/const';
import {
	ArrowLeft,
	Loader2,
	Calendar,
	Clock,
	DollarSign,
	ClipboardList,
	CheckCircle2,
	Play,
	CheckSquare,
	XCircle,
	AlertTriangle,
	MessageSquare,
	User,
} from 'lucide-react';
import Link from 'next/link';

// ─── Props ──────────────────────────────────────────────

interface BookingDetailClientProps {
	booking: Booking & {
		viewerRole: 'CLIENT' | 'ARTISAN';
		thread?: { id: string; status: string } | null;
	};
	accessToken: string;
	profileId: string;
	isArtisan: boolean;
	viewerRole: 'CLIENT' | 'ARTISAN';
}

// ─── Helpers ────────────────────────────────────────────

function buildUrl(template: string, params: Record<string, string>): string {
	let url = template;
	for (const [key, value] of Object.entries(params)) {
		url = url.replace(`{${key}}`, encodeURIComponent(value));
	}
	return url;
}

function statusColor(status: BookingStatus): string {
	switch (status) {
		case 'PENDING':
			return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
		case 'CONFIRMED':
			return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
		case 'IN_PROGRESS':
			return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
		case 'COMPLETED':
			return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
		case 'CANCELLED':
			return 'bg-red-500/20 text-red-300 border-red-500/30';
		case 'NO_SHOW':
			return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
		default:
			return 'bg-white/10 text-white/60 border-white/20';
	}
}

function statusLabel(status: BookingStatus): string {
	switch (status) {
		case 'IN_PROGRESS':
			return 'In Progress';
		case 'NO_SHOW':
			return 'No Show';
		default:
			return status.charAt(0) + status.slice(1).toLowerCase();
	}
}

function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString('en-NG', {
		weekday: 'short',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
}

// ─── Component ──────────────────────────────────────────

export default function BookingDetailClient({
	booking: initialBooking,
	accessToken,
	profileId,
	viewerRole,
}: BookingDetailClientProps) {
	const router = useRouter();
	const [booking, setBooking] = useState(initialBooking);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [showCancelDialog, setShowCancelDialog] = useState(false);
	const [cancelReason, setCancelReason] = useState('');
	const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
	const [showDisputeDialog, setShowDisputeDialog] = useState(false);
	const [disputeReason, setDisputeReason] = useState('');

	// ─── API helpers ────────────────────────────────────

	const apiCall = async (url: string, method: string, body?: unknown) => {
		const res = await fetch(`${BASE_URLS.CONNECT_API}${url}`, {
			method,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			...(body ? { body: JSON.stringify(body) } : {}),
		});
		const json = await res.json().catch(() => null);
		return { ok: res.ok, ...json };
	};

	// ─── Booking lifecycle actions ──────────────────────

	const handleAction = async (action: 'confirm' | 'start' | 'complete') => {
		setActionLoading(action);
		try {
			const urlMap: Record<string, string> = {
				confirm: URLS.artisan.confirm_booking,
				start: URLS.artisan.start_booking,
				complete: URLS.artisan.complete_booking,
			};

			const url = buildUrl(urlMap[action], {
				profileId,
				bookingId: booking.id,
			});

			const result = await apiCall(url, 'POST');
			if (!result.ok) {
				toast.error(result.message || `Failed to ${action} booking`);
			} else {
				const statusMap: Record<string, BookingStatus> = {
					confirm: 'CONFIRMED',
					start: 'IN_PROGRESS',
					complete: 'COMPLETED',
				};
				const labelMap: Record<string, string> = {
					confirm: 'confirmed',
					start: 'started',
					complete: 'completed',
				};
				toast.success(`Booking ${labelMap[action]}`);
				setBooking((prev) => ({
					...prev,
					status: statusMap[action],
					...(action === 'start' ?
						{ startedAt: new Date().toISOString() }
					:	{}),
					...(action === 'complete' ?
						{ completedAt: new Date().toISOString() }
					:	{}),
				}));
				router.refresh();
			}
		} catch {
			toast.error('Network error');
		} finally {
			setActionLoading(null);
		}
	};

	const handleCancel = async () => {
		if (!cancelReason.trim()) {
			toast.error('Please provide a reason');
			return;
		}
		setActionLoading('cancel');
		try {
			const url = buildUrl(URLS.artisan.cancel_booking, {
				profileId,
				bookingId: booking.id,
			});
			const result = await apiCall(url, 'POST', {
				reason: cancelReason,
			});
			if (!result.ok) {
				toast.error(result.message || 'Failed to cancel booking');
			} else {
				toast.success('Booking cancelled');
				setBooking((prev) => ({
					...prev,
					status: 'CANCELLED' as BookingStatus,
					cancelledAt: new Date().toISOString(),
					cancellationReason: cancelReason,
				}));
				setShowCancelDialog(false);
				setCancelReason('');
				router.refresh();
			}
		} catch {
			toast.error('Network error');
		} finally {
			setActionLoading(null);
		}
	};

	// ─── Payment actions ────────────────────────────────

	const handleConfirmPayment = async () => {
		setActionLoading('payment');
		try {
			const urlKey =
				viewerRole === 'CLIENT' ?
					URLS.threads.confirm_payment_sent
				:	URLS.threads.confirm_payment_received;
			const url = buildUrl(urlKey, { bookingId: booking.id });
			const result = await apiCall(url, 'POST');
			if (!result.ok) {
				toast.error(result.message || 'Failed to confirm payment');
			} else {
				toast.success('Payment confirmed');
				setBooking((prev) => ({
					...prev,
					...(viewerRole === 'CLIENT' ?
						{
							clientPaymentConfirmed: true,
							clientPaymentConfirmedAt: new Date().toISOString(),
						}
					:	{
							artisanPaymentConfirmed: true,
							artisanPaymentConfirmedAt: new Date().toISOString(),
						}),
				}));
				setShowPaymentConfirm(false);
				router.refresh();
			}
		} catch {
			toast.error('Network error');
		} finally {
			setActionLoading(null);
		}
	};

	const handleDispute = async () => {
		if (!disputeReason.trim()) {
			toast.error('Please provide a reason for the dispute');
			return;
		}
		setActionLoading('dispute');
		try {
			const url = buildUrl(URLS.threads.dispute_payment, {
				bookingId: booking.id,
			});
			const result = await apiCall(url, 'POST', {
				reason: disputeReason,
			});
			if (!result.ok) {
				toast.error(result.message || 'Failed to submit dispute');
			} else {
				toast.success('Dispute submitted');
				setBooking((prev) => ({
					...prev,
					paymentDisputed: true,
					paymentDisputeReason: disputeReason,
					paymentDisputedAt: new Date().toISOString(),
				}));
				setShowDisputeDialog(false);
				setDisputeReason('');
				router.refresh();
			}
		} catch {
			toast.error('Network error');
		} finally {
			setActionLoading(null);
		}
	};

	// ─── Computed ───────────────────────────────────────

	const isFinalStatus = ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(
		booking.status,
	);
	const clientConfirmed = booking.clientPaymentConfirmed;
	const artisanConfirmed = booking.artisanPaymentConfirmed;
	const disputed = booking.paymentDisputed;

	const paymentLabel =
		booking.paymentMethod === 'OFFLINE' ? 'Offline Payment'
		: booking.paymentMethod === 'WALLET' ? 'Wallet Payment'
		: 'Payment';

	// ─── Render ─────────────────────────────────────────

	return (
		<div className='mx-auto max-w-lg space-y-4'>
			{/* ── Header ── */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<Link href='/connect/artisan/bookings'>
						<Button
							variant='ghost'
							size='icon'
							className='text-white/60'
						>
							<ArrowLeft className='h-5 w-5' />
						</Button>
					</Link>
					<h1 className='text-lg font-semibold text-white'>
						Booking Details
					</h1>
				</div>
				<Badge
					variant='outline'
					className={`${statusColor(booking.status)}`}
				>
					{statusLabel(booking.status)}
				</Badge>
			</div>

			{/* ── Booking Info Card ── */}
			<div className='rounded-xl border border-white/10 bg-white/5 p-4 space-y-4'>
				{/* Service */}
				{booking.service?.name && (
					<div className='flex items-start gap-3'>
						<ClipboardList className='mt-0.5 h-4 w-4 text-purple-400 shrink-0' />
						<div>
							<p className='text-xs text-white/40'>Service</p>
							<p className='text-sm font-medium text-white'>
								{booking.service.name}
							</p>
						</div>
					</div>
				)}

				{/* Customer / Artisan */}
				<div className='flex items-start gap-3'>
					<User className='mt-0.5 h-4 w-4 text-purple-400 shrink-0' />
					<div>
						<p className='text-xs text-white/40'>
							{viewerRole === 'ARTISAN' ? 'Customer' : 'Artisan'}
						</p>
						<p className='text-sm font-medium text-white'>
							{viewerRole === 'ARTISAN' ?
								booking.customerName || 'Customer'
							:	booking.artisan?.profile?.name || 'Artisan'}
						</p>
					</div>
				</div>

				{/* Schedule */}
				{booking.scheduledDate && (
					<div className='flex items-start gap-3'>
						<Calendar className='mt-0.5 h-4 w-4 text-purple-400 shrink-0' />
						<div>
							<p className='text-xs text-white/40'>
								Scheduled Date
							</p>
							<p className='text-sm font-medium text-white'>
								{formatDate(booking.scheduledDate)}
							</p>
						</div>
					</div>
				)}

				{booking.scheduledTime && (
					<div className='flex items-start gap-3'>
						<Clock className='mt-0.5 h-4 w-4 text-purple-400 shrink-0' />
						<div>
							<p className='text-xs text-white/40'>Time</p>
							<p className='text-sm font-medium text-white'>
								{booking.scheduledTime}
							</p>
						</div>
					</div>
				)}

				{/* Price */}
				{booking.agreedPrice && (
					<div className='flex items-start gap-3'>
						<DollarSign className='mt-0.5 h-4 w-4 text-purple-400 shrink-0' />
						<div>
							<p className='text-xs text-white/40'>
								Agreed Price
							</p>
							<p className='text-sm font-medium text-white'>
								{booking.currency || '₦'}
								{Number(booking.agreedPrice).toLocaleString()}
							</p>
						</div>
					</div>
				)}

				{/* Note */}
				{booking.note && (
					<div className='rounded-lg bg-white/5 p-3'>
						<p className='text-xs text-white/40 mb-1'>Note</p>
						<p className='text-sm text-white/70 whitespace-pre-wrap'>
							{booking.note}
						</p>
					</div>
				)}

				{/* Timestamps */}
				<div className='border-t border-white/5 pt-3 space-y-1'>
					<p className='text-[10px] text-white/30'>
						Created: {formatDate(booking.createdAt)}
					</p>
					{booking.startedAt && (
						<p className='text-[10px] text-white/30'>
							Started: {formatDate(booking.startedAt)}
						</p>
					)}
					{booking.completedAt && (
						<p className='text-[10px] text-white/30'>
							Completed: {formatDate(booking.completedAt)}
						</p>
					)}
					{booking.cancelledAt && (
						<p className='text-[10px] text-red-400/50'>
							Cancelled: {formatDate(booking.cancelledAt)}
							{booking.cancellationReason &&
								` — ${booking.cancellationReason}`}
						</p>
					)}
				</div>
			</div>

			{/* ── Actions Card (artisan only) ── */}
			{viewerRole === 'ARTISAN' && !isFinalStatus && (
				<div className='rounded-xl border border-white/10 bg-white/5 p-4 space-y-3'>
					<p className='text-xs font-medium text-white/60'>Actions</p>
					<div className='flex flex-col gap-2'>
						{booking.status === 'PENDING' && (
							<Button
								className='w-full bg-blue-600 hover:bg-blue-700'
								disabled={actionLoading === 'confirm'}
								onClick={() => handleAction('confirm')}
							>
								{actionLoading === 'confirm' ?
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								:	<CheckCircle2 className='mr-2 h-4 w-4' />}
								Confirm Booking
							</Button>
						)}
						{booking.status === 'CONFIRMED' && (
							<Button
								className='w-full bg-orange-600 hover:bg-orange-700'
								disabled={actionLoading === 'start'}
								onClick={() => handleAction('start')}
							>
								{actionLoading === 'start' ?
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								:	<Play className='mr-2 h-4 w-4' />}
								Start Job
							</Button>
						)}
						{booking.status === 'IN_PROGRESS' && (
							<Button
								className='w-full bg-emerald-600 hover:bg-emerald-700'
								disabled={actionLoading === 'complete'}
								onClick={() => handleAction('complete')}
							>
								{actionLoading === 'complete' ?
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								:	<CheckSquare className='mr-2 h-4 w-4' />}
								Mark Complete
							</Button>
						)}

						{/* Cancel */}
						{!['COMPLETED', 'CANCELLED'].includes(
							booking.status,
						) && (
							<Button
								variant='outline'
								className='w-full border-red-500/30 text-red-400 hover:bg-red-500/10'
								onClick={() => setShowCancelDialog(true)}
							>
								<XCircle className='mr-2 h-4 w-4' />
								Cancel Booking
							</Button>
						)}
					</div>
				</div>
			)}

			{/* ── Payment Card ── */}
			{booking.status !== 'CANCELLED' && (
				<div className='rounded-xl border border-white/10 bg-white/5 p-4 space-y-3'>
					<div className='flex items-center justify-between'>
						<p className='text-xs font-medium text-white/60'>
							{paymentLabel}
						</p>
						{booking.isPaid && (
							<Badge
								variant='outline'
								className='bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]'
							>
								Paid
							</Badge>
						)}
					</div>

					{disputed ?
						<div className='flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-900/20 px-3 py-2 text-xs text-red-300'>
							<AlertTriangle className='h-4 w-4 shrink-0' />
							<span>Payment disputed — under review</span>
						</div>
					: clientConfirmed && artisanConfirmed ?
						<div className='flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-900/20 px-3 py-2 text-xs text-emerald-300'>
							<CheckCircle2 className='h-4 w-4 shrink-0' />
							<span>Payment confirmed by both parties</span>
						</div>
					:	<>
							{/* Status indicators */}
							<div className='flex flex-col gap-1.5 text-xs'>
								<div className='flex items-center gap-2'>
									{clientConfirmed ?
										<span className='text-emerald-400'>
											✓ Client confirmed payment sent
										</span>
									:	<span className='text-white/40'>
											○ Waiting for client to confirm
										</span>
									}
								</div>
								<div className='flex items-center gap-2'>
									{artisanConfirmed ?
										<span className='text-emerald-400'>
											✓ Artisan confirmed payment received
										</span>
									:	<span className='text-white/40'>
											○ Waiting for artisan to confirm
										</span>
									}
								</div>
							</div>

							{/* Payment action buttons */}
							<div className='flex gap-2'>
								{viewerRole === 'CLIENT' &&
									!clientConfirmed && (
										<Button
											size='sm'
											className='flex-1 bg-purple-600 hover:bg-purple-700'
											onClick={() =>
												setShowPaymentConfirm(true)
											}
										>
											Confirm Payment Sent
										</Button>
									)}
								{viewerRole === 'ARTISAN' &&
									!artisanConfirmed && (
										<Button
											size='sm'
											className='flex-1 bg-purple-600 hover:bg-purple-700'
											onClick={() =>
												setShowPaymentConfirm(true)
											}
										>
											Confirm Payment Received
										</Button>
									)}
								{(clientConfirmed || artisanConfirmed) &&
									!disputed && (
										<Button
											size='sm'
											variant='outline'
											className='border-red-500/30 text-red-400 hover:bg-red-500/10'
											onClick={() =>
												setShowDisputeDialog(true)
											}
										>
											<AlertTriangle className='mr-1 h-3 w-3' />
											Dispute
										</Button>
									)}
							</div>
						</>
					}
				</div>
			)}

			{/* ── Thread Link ── */}
			{booking.thread?.id && (
				<Link
					href={`/connect/artisan/threads/${booking.thread.id}`}
					className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10'
				>
					<MessageSquare className='h-5 w-5 text-purple-400' />
					<div className='flex-1'>
						<p className='text-sm font-medium text-white'>
							View Conversation
						</p>
						<p className='text-xs text-white/40'>
							Thread status:{' '}
							{booking.thread.status.charAt(0).toUpperCase() +
								booking.thread.status
									.slice(1)
									.toLowerCase()
									.replace('_', ' ')}
						</p>
					</div>
					<ArrowLeft className='h-4 w-4 rotate-180 text-white/30' />
				</Link>
			)}

			{/* ── Cancel Dialog ── */}
			<Dialog
				open={showCancelDialog}
				onOpenChange={setShowCancelDialog}
			>
				<DialogContent className='border-white/10 bg-neutral-900'>
					<DialogHeader>
						<DialogTitle className='text-white'>
							Cancel Booking
						</DialogTitle>
						<DialogDescription className='text-white/60'>
							Please provide a reason for cancellation.
						</DialogDescription>
					</DialogHeader>
					<Textarea
						value={cancelReason}
						onChange={(e) => setCancelReason(e.target.value)}
						placeholder='Reason for cancellation...'
						className='border-white/10 bg-white/5 text-white placeholder:text-white/30'
						rows={3}
					/>
					<DialogFooter className='gap-2'>
						<Button
							variant='outline'
							className='border-white/10 text-white/60'
							onClick={() => setShowCancelDialog(false)}
						>
							Go Back
						</Button>
						<Button
							className='bg-red-600 hover:bg-red-700'
							disabled={
								actionLoading === 'cancel' ||
								!cancelReason.trim()
							}
							onClick={handleCancel}
						>
							{actionLoading === 'cancel' ?
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							:	<XCircle className='mr-2 h-4 w-4' />}
							Confirm Cancel
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* ── Payment Confirm Dialog ── */}
			<Dialog
				open={showPaymentConfirm}
				onOpenChange={setShowPaymentConfirm}
			>
				<DialogContent className='border-white/10 bg-neutral-900'>
					<DialogHeader>
						<DialogTitle className='text-white'>
							Confirm Payment
						</DialogTitle>
						<DialogDescription className='text-white/60'>
							{viewerRole === 'CLIENT' ?
								'Are you sure you have sent the payment?'
							:	'Are you sure you have received the payment?'}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className='gap-2'>
						<Button
							variant='outline'
							className='border-white/10 text-white/60'
							onClick={() => setShowPaymentConfirm(false)}
						>
							Go Back
						</Button>
						<Button
							className='bg-purple-600 hover:bg-purple-700'
							disabled={actionLoading === 'payment'}
							onClick={handleConfirmPayment}
						>
							{actionLoading === 'payment' ?
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							:	<CheckCircle2 className='mr-2 h-4 w-4' />}
							Yes, Confirm
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* ── Dispute Dialog ── */}
			<Dialog
				open={showDisputeDialog}
				onOpenChange={setShowDisputeDialog}
			>
				<DialogContent className='border-white/10 bg-neutral-900'>
					<DialogHeader>
						<DialogTitle className='text-white'>
							Dispute Payment
						</DialogTitle>
						<DialogDescription className='text-white/60'>
							Explain why you are disputing this payment.
						</DialogDescription>
					</DialogHeader>
					<Textarea
						value={disputeReason}
						onChange={(e) => setDisputeReason(e.target.value)}
						placeholder='Reason for dispute...'
						className='border-white/10 bg-white/5 text-white placeholder:text-white/30'
						rows={3}
					/>
					<DialogFooter className='gap-2'>
						<Button
							variant='outline'
							className='border-white/10 text-white/60'
							onClick={() => setShowDisputeDialog(false)}
						>
							Go Back
						</Button>
						<Button
							className='bg-red-600 hover:bg-red-700'
							disabled={
								actionLoading === 'dispute' ||
								!disputeReason.trim()
							}
							onClick={handleDispute}
						>
							{actionLoading === 'dispute' ?
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							:	<AlertTriangle className='mr-2 h-4 w-4' />}
							Submit Dispute
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
