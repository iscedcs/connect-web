'use client';

import { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { BASE_URLS, URLS } from '@/lib/const';
import type {
	BookingThread,
	ThreadMessage,
	ThreadStatus,
	SenderRole,
	SendProposalDto,
} from '@/lib/types/artisan';
import {
	ArrowLeft,
	Send,
	Loader2,
	ClipboardList,
	CheckCircle2,
	XCircle,
	Calendar,
	Clock,
	DollarSign,
	AlertTriangle,
	MoreVertical,
	X,
} from 'lucide-react';
import Link from 'next/link';

// ─── Props ──────────────────────────────────────────────

interface ThreadConversationClientProps {
	thread: BookingThread;
	currentUserId: string;
	accessToken: string;
	profileId: string;
	isArtisan: boolean;
}

// ─── Helpers ────────────────────────────────────────────

function buildUrl(template: string, params: Record<string, string>): string {
	let url = template;
	for (const [key, value] of Object.entries(params)) {
		url = url.replace(`{${key}}`, encodeURIComponent(value));
	}
	return url;
}

function formatTime(dateStr: string): string {
	return new Date(dateStr).toLocaleTimeString(undefined, {
		hour: '2-digit',
		minute: '2-digit',
	});
}

function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	const now = new Date();
	const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
	if (diffDays === 0) return 'Today';
	if (diffDays === 1) return 'Yesterday';
	return date.toLocaleDateString(undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	});
}

function isSameDay(a: string, b: string): boolean {
	const da = new Date(a);
	const db = new Date(b);
	return (
		da.getFullYear() === db.getFullYear() &&
		da.getMonth() === db.getMonth() &&
		da.getDate() === db.getDate()
	);
}

function statusColor(status: ThreadStatus): string {
	switch (status) {
		case 'OPEN':
			return 'bg-blue-500/20 text-blue-300';
		case 'PROPOSAL_SENT':
			return 'bg-amber-500/20 text-amber-300';
		case 'BOOKED':
			return 'bg-emerald-500/20 text-emerald-300';
		case 'CLOSED':
			return 'bg-white/10 text-white/50';
		default:
			return 'bg-white/10 text-white/60';
	}
}

function threadPartyName(
	thread: BookingThread,
	isCurrentUser: boolean,
): string {
	if (isCurrentUser) return 'You';
	// If we're viewing as client, the other party is the artisan
	// If viewing as artisan, the other party is the client
	return thread.artisan?.profile?.name || thread.clientName || 'User';
}

// ─── Component ──────────────────────────────────────────

export default function ThreadConversationClient({
	thread: initialThread,
	currentUserId,
	accessToken,
	profileId,
	isArtisan,
}: ThreadConversationClientProps) {
	const router = useRouter();
	const [thread, setThread] = useState(initialThread);
	const [messages, setMessages] = useState<ThreadMessage[]>(
		initialThread.messages ?? [],
	);
	const [messageText, setMessageText] = useState('');
	const [sending, setSending] = useState(false);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	// Proposal dialog state
	const [showProposalDialog, setShowProposalDialog] = useState(false);
	const [proposalForm, setProposalForm] = useState<SendProposalDto>({
		price: 0,
		currency: 'NGN',
		date: '',
		time: '',
		duration: 60,
		note: '',
	});

	// Close / menu state
	const [showMenu, setShowMenu] = useState(false);
	const [showCloseConfirm, setShowCloseConfirm] = useState(false);

	// Payment confirmation state
	const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
	const [paymentNote, setPaymentNote] = useState('');
	const [paymentReference, setPaymentReference] = useState('');

	// Dispute state
	const [showDisputeDialog, setShowDisputeDialog] = useState(false);
	const [disputeReason, setDisputeReason] = useState('');

	// Determine current user's role in this thread
	const myRole: SenderRole =
		thread.clientUserId === currentUserId ? 'CLIENT' : 'ARTISAN';

	// Auto-scroll to bottom
	const scrollToBottom = useCallback(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	// ─── Real-time SSE updates ──────────────────────────

	useThreadSSE({
		threadId: thread.id,
		currentUserId,
		onMessage: useCallback(
			(msg: ThreadMessage) => {
				setMessages((prev) => {
					// Avoid duplicates (if server echo matches existing)
					if (prev.some((m) => m.id === msg.id)) return prev;
					return [...prev, msg];
				});
			},
			[],
		),
		onStatusChange: useCallback(
			(status: ThreadStatus, data?: Record<string, unknown>) => {
				setThread((prev) => ({ ...prev, status }));
				if (status === 'BOOKED' && data?.booking) {
					setThread((prev) => ({
						...prev,
						booking: data.booking as BookingThread['booking'],
					}));
				}
			},
			[],
		),
		onPaymentUpdate: useCallback(
			(data: Record<string, unknown>) => {
				if (data.isPaid) {
					setThread((prev) => ({
						...prev,
						booking: prev.booking
							? { ...prev.booking, isPaid: true }
							: prev.booking,
					}));
				}
				if (data.action === 'payment_sent' && thread.booking) {
					setThread((prev) => ({
						...prev,
						booking: prev.booking
							? {
									...prev.booking,
									clientPaymentConfirmed: true,
								}
							: prev.booking,
					}));
				}
				if (data.action === 'payment_received' && thread.booking) {
					setThread((prev) => ({
						...prev,
						booking: prev.booking
							? {
									...prev.booking,
									artisanPaymentConfirmed: true,
								}
							: prev.booking,
					}));
				}
				if (data.action === 'payment_disputed') {
					setThread((prev) => ({
						...prev,
						booking: prev.booking
							? {
									...prev.booking,
									paymentDisputed: true,
									paymentDisputeReason:
										(data.reason as string) || null,
								}
							: prev.booking,
					}));
				}
			},
			[thread.booking],
		),
		onThreadClosed: useCallback(() => {
			setThread((prev) => ({ ...prev, status: 'CLOSED' as ThreadStatus }));
		}, []),
	});

	// ─── API helpers ────────────────────────────────────

	const apiCall = async (
		url: string,
		method: string = 'POST',
		body?: Record<string, unknown>,
	) => {
		const res = await fetch(`${BASE_URLS.CONNECT_API}${url}`, {
			method,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			body: body ? JSON.stringify(body) : undefined,
		});
		const json = await res.json().catch(() => null);
		return { ok: res.ok, data: json?.data, message: json?.message };
	};

	// ─── Send text message ──────────────────────────────

	const handleSendMessage = async () => {
		const text = messageText.trim();
		if (!text || sending) return;

		setSending(true);
		setMessageText('');

		// Optimistic message
		const optimisticMsg: ThreadMessage = {
			id: `pending-${Date.now()}`,
			threadId: thread.id,
			senderUserId: currentUserId,
			senderRole: myRole,
			type: 'TEXT',
			content: text,
			isRead: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		setMessages((prev) => [...prev, optimisticMsg]);

		try {
			const url = buildUrl(URLS.threads.send_message, {
				threadId: thread.id,
			});
			const result = await apiCall(url, 'POST', { content: text });
			if (!result.ok) {
				toast.error(result.message || 'Failed to send message');
				// Remove optimistic message
				setMessages((prev) =>
					prev.filter((m) => m.id !== optimisticMsg.id),
				);
				setMessageText(text);
			} else {
				// Replace optimistic with server response
				if (result.data) {
					setMessages((prev) =>
						prev.map((m) =>
							m.id === optimisticMsg.id ? result.data : m,
						),
					);
				}
			}
		} catch {
			toast.error('Network error');
			setMessages((prev) =>
				prev.filter((m) => m.id !== optimisticMsg.id),
			);
			setMessageText(text);
		} finally {
			setSending(false);
		}
	};

	// ─── Send proposal (artisan only) ───────────────────

	const handleSendProposal = async () => {
		if (!proposalForm.price || !proposalForm.date) {
			toast.error('Price and date are required');
			return;
		}
		setActionLoading('proposal');
		try {
			const url = buildUrl(URLS.threads.send_proposal, {
				threadId: thread.id,
			});
			const result = await apiCall(
				`${url}?profileId=${profileId}`,
				'POST',
				proposalForm as unknown as Record<string, unknown>,
			);
			if (!result.ok) {
				toast.error(result.message || 'Failed to send proposal');
			} else {
				toast.success('Proposal sent');
				setShowProposalDialog(false);
				setProposalForm({
					price: 0,
					currency: 'NGN',
					date: '',
					time: '',
					duration: 60,
					note: '',
				});
				setThread((prev) => ({ ...prev, status: 'PROPOSAL_SENT' }));
				router.refresh();
			}
		} catch {
			toast.error('Network error');
		} finally {
			setActionLoading(null);
		}
	};

	// ─── Accept / Decline proposal ──────────────────────

	const handleAcceptProposal = async (messageId: string) => {
		setActionLoading(`accept-${messageId}`);
		try {
			const url = buildUrl(URLS.threads.accept_proposal, {
				threadId: thread.id,
			});
			const result = await apiCall(url, 'POST', { messageId });
			if (!result.ok) {
				toast.error(result.message || 'Failed to accept proposal');
			} else {
				toast.success('Proposal accepted — booking created!');
				setThread((prev) => ({ ...prev, status: 'BOOKED' }));
				router.refresh();
			}
		} catch {
			toast.error('Network error');
		} finally {
			setActionLoading(null);
		}
	};

	const handleDeclineProposal = async (messageId: string) => {
		setActionLoading(`decline-${messageId}`);
		try {
			const url = buildUrl(URLS.threads.decline_proposal, {
				threadId: thread.id,
			});
			const result = await apiCall(url, 'POST', { messageId });
			if (!result.ok) {
				toast.error(result.message || 'Failed to decline proposal');
			} else {
				toast.success('Proposal declined');
				setThread((prev) => ({ ...prev, status: 'OPEN' }));
				router.refresh();
			}
		} catch {
			toast.error('Network error');
		} finally {
			setActionLoading(null);
		}
	};

	// ─── Close thread ───────────────────────────────────

	const handleCloseThread = async () => {
		setActionLoading('close');
		try {
			const url = buildUrl(URLS.threads.close, {
				threadId: thread.id,
			});
			const result = await apiCall(url, 'POST');
			if (!result.ok) {
				toast.error(result.message || 'Failed to close thread');
			} else {
				toast.success('Conversation closed');
				setShowCloseConfirm(false);
				setThread((prev) => ({ ...prev, status: 'CLOSED' }));
				router.refresh();
			}
		} catch {
			toast.error('Network error');
		} finally {
			setActionLoading(null);
		}
	};

	// ─── Payment confirmation ───────────────────────────

	const handleConfirmPayment = async () => {
		if (!thread.booking?.id) return;
		const isClient = myRole === 'CLIENT';
		setActionLoading('payment');
		try {
			const urlTemplate =
				isClient ?
					URLS.threads.confirm_payment_sent
				:	URLS.threads.confirm_payment_received;

			let url = buildUrl(urlTemplate, {
				bookingId: thread.booking.id,
			});

			if (!isClient) url += `?profileId=${profileId}`;

			const result = await apiCall(url, 'POST', {
				reference: paymentReference || undefined,
				note: paymentNote || undefined,
			});

			if (!result.ok) {
				toast.error(result.message || 'Failed to confirm payment');
			} else {
				toast.success(
					isClient ?
						'Payment sent confirmed'
					:	'Payment received confirmed',
				);
				setShowPaymentConfirm(false);
				setPaymentNote('');
				setPaymentReference('');
				router.refresh();
			}
		} catch {
			toast.error('Network error');
		} finally {
			setActionLoading(null);
		}
	};

	// ─── Dispute payment ────────────────────────────────

	const handleDispute = async () => {
		if (!thread.booking?.id || !disputeReason.trim()) return;
		setActionLoading('dispute');
		try {
			const url = buildUrl(URLS.threads.dispute_payment, {
				bookingId: thread.booking.id,
			});
			const result = await apiCall(url, 'POST', {
				reason: disputeReason,
			});
			if (!result.ok) {
				toast.error(result.message || 'Failed to file dispute');
			} else {
				toast.success('Dispute filed');
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

	// ─── Key handler ────────────────────────────────────

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	// ─── Render: Chat Bubble ────────────────────────────

	const renderMessage = (msg: ThreadMessage) => {
		const isMe = msg.senderUserId === currentUserId;

		// System messages — centered
		if (msg.type === 'SYSTEM') {
			return (
				<div className='flex justify-center px-6 py-1'>
					<p className='rounded-full bg-white/5 px-4 py-1.5 text-center text-xs text-white/40'>
						{msg.content}
					</p>
				</div>
			);
		}

		// Proposal messages — card style
		if (msg.type === 'PROPOSAL' && msg.proposalData) {
			return (
				<div
					className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
				>
					<div className='w-full max-w-[85%]'>
						{/* Sender label */}
						{!isMe && (
							<p className='mb-1 text-xs font-medium text-purple-400'>
								{threadPartyName(thread, false)}
							</p>
						)}
						{/* Proposal card */}
						<div className='rounded-xl border border-purple-500/20 bg-purple-900/20 p-4'>
							<div className='mb-3 flex items-center gap-2'>
								<ClipboardList className='h-4 w-4 text-purple-400' />
								<span className='text-sm font-semibold text-purple-300'>
									Proposal
								</span>
							</div>

							{msg.proposalData.serviceName && (
								<p className='mb-2 text-sm text-white'>
									{msg.proposalData.serviceName}
								</p>
							)}

							<div className='mb-3 grid grid-cols-2 gap-2 text-xs'>
								<div className='flex items-center gap-1.5 text-white/60'>
									<DollarSign className='h-3.5 w-3.5' />
									<span>
										{msg.proposalData.currency || 'NGN'}{' '}
										{Number(
											msg.proposalData.price,
										).toLocaleString()}
									</span>
								</div>
								<div className='flex items-center gap-1.5 text-white/60'>
									<Calendar className='h-3.5 w-3.5' />
									<span>
										{new Date(
											msg.proposalData.date,
										).toLocaleDateString()}
									</span>
								</div>
								{msg.proposalData.time && (
									<div className='flex items-center gap-1.5 text-white/60'>
										<Clock className='h-3.5 w-3.5' />
										<span>{msg.proposalData.time}</span>
									</div>
								)}
								{msg.proposalData.duration && (
									<div className='flex items-center gap-1.5 text-white/60'>
										<Clock className='h-3.5 w-3.5' />
										<span>
											{msg.proposalData.duration} min
										</span>
									</div>
								)}
							</div>

							{msg.proposalData.note && (
								<p className='mb-3 text-xs text-white/50 italic'>
									{msg.proposalData.note}
								</p>
							)}

							{/* Accept / Decline — only show to client when status is PROPOSAL_SENT */}
							{myRole === 'CLIENT' &&
								thread.status === 'PROPOSAL_SENT' && (
									<div className='flex gap-2'>
										<Button
											size='sm'
											className='flex-1 bg-emerald-600 hover:bg-emerald-700'
											disabled={
												actionLoading ===
												`accept-${msg.id}`
											}
											onClick={() =>
												handleAcceptProposal(msg.id)
											}
										>
											{(
												actionLoading ===
												`accept-${msg.id}`
											) ?
												<Loader2 className='h-4 w-4 animate-spin' />
											:	<>
													<CheckCircle2 className='mr-1 h-3.5 w-3.5' />
													Accept
												</>
											}
										</Button>
										<Button
											size='sm'
											variant='outline'
											className='flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10'
											disabled={
												actionLoading ===
												`decline-${msg.id}`
											}
											onClick={() =>
												handleDeclineProposal(msg.id)
											}
										>
											{(
												actionLoading ===
												`decline-${msg.id}`
											) ?
												<Loader2 className='h-4 w-4 animate-spin' />
											:	<>
													<XCircle className='mr-1 h-3.5 w-3.5' />
													Decline
												</>
											}
										</Button>
									</div>
								)}

							{thread.status === 'BOOKED' && (
								<div className='flex items-center gap-1.5 text-xs text-emerald-400'>
									<CheckCircle2 className='h-3.5 w-3.5' />
									Accepted — Booking created
								</div>
							)}
						</div>
						<p className='mt-1 text-right text-[10px] text-white/30'>
							{formatTime(msg.createdAt)}
						</p>
					</div>
				</div>
			);
		}

		// Regular text messages — chat bubbles
		return (
			<div className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
				<div
					className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}
				>
					{!isMe && (
						<p className='mb-1 text-xs font-medium text-purple-400'>
							{threadPartyName(thread, false)}
						</p>
					)}
					<div
						className={`rounded-2xl px-4 py-2.5 ${
							isMe ?
								'rounded-br-md bg-purple-600 text-white'
							:	'rounded-bl-md bg-white/10 text-white'
						}`}
					>
						<p className='text-sm leading-relaxed whitespace-pre-wrap'>
							{msg.content}
						</p>
					</div>
					<p
						className={`mt-1 text-[10px] text-white/30 ${
							isMe ? 'text-right' : 'text-left'
						}`}
					>
						{formatTime(msg.createdAt)}
					</p>
				</div>
			</div>
		);
	};

	// ─── Payment action bar ─────────────────────────────

	const renderPaymentBar = () => {
		const booking = thread.booking;
		if (!booking || thread.status !== 'BOOKED') return null;

		// Show only for offline payment bookings
		if (booking.paymentMethod !== 'OFFLINE') return null;

		const clientConfirmed = booking.clientPaymentConfirmed;
		const artisanConfirmed = booking.artisanPaymentConfirmed;
		const disputed = booking.paymentDisputed;

		if (disputed) {
			return (
				<div className='mx-4 mb-2 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-900/20 px-4 py-3 text-xs text-red-300'>
					<AlertTriangle className='h-4 w-4 shrink-0' />
					<span>Payment disputed — under review</span>
				</div>
			);
		}

		// Both confirmed
		if (clientConfirmed && artisanConfirmed) {
			return (
				<div className='mx-4 mb-2 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-900/20 px-4 py-3 text-xs text-emerald-300'>
					<CheckCircle2 className='h-4 w-4 shrink-0' />
					<span>Payment confirmed by both parties</span>
				</div>
			);
		}

		return (
			<div className='mx-4 mb-2 rounded-lg border border-white/10 bg-white/5 p-3'>
				<p className='mb-2 text-xs font-medium text-white/60'>
					Offline Payment
				</p>
				<div className='flex flex-col gap-2'>
					{/* Status indicators */}
					<div className='flex items-center gap-2 text-xs'>
						{clientConfirmed ?
							<span className='text-emerald-400'>
								✓ Client confirmed payment sent
							</span>
						:	<span className='text-white/40'>
								○ Waiting for client to confirm
							</span>
						}
					</div>
					<div className='flex items-center gap-2 text-xs'>
						{artisanConfirmed ?
							<span className='text-emerald-400'>
								✓ Artisan confirmed payment received
							</span>
						:	<span className='text-white/40'>
								○ Waiting for artisan to confirm
							</span>
						}
					</div>

					{/* Action buttons */}
					<div className='mt-1 flex gap-2'>
						{myRole === 'CLIENT' && !clientConfirmed && (
							<Button
								size='sm'
								className='flex-1 bg-purple-600 hover:bg-purple-700'
								onClick={() => setShowPaymentConfirm(true)}
							>
								Confirm Payment Sent
							</Button>
						)}
						{myRole === 'ARTISAN' && !artisanConfirmed && (
							<Button
								size='sm'
								className='flex-1 bg-purple-600 hover:bg-purple-700'
								onClick={() => setShowPaymentConfirm(true)}
							>
								Confirm Payment Received
							</Button>
						)}
						{(clientConfirmed || artisanConfirmed) && !disputed && (
							<Button
								size='sm'
								variant='outline'
								className='border-red-500/30 text-red-400 hover:bg-red-500/10'
								onClick={() => setShowDisputeDialog(true)}
							>
								<AlertTriangle className='mr-1 h-3 w-3' />
								Dispute
							</Button>
						)}
					</div>
				</div>
			</div>
		);
	};

	// ─── Render ─────────────────────────────────────────

	const isClosed = thread.status === 'CLOSED';
	const otherPartyName =
		myRole === 'CLIENT' ?
			thread.artisan?.profile?.name || 'Artisan'
		:	thread.clientName || 'Client';

	return (
		<div className='flex h-[calc(100dvh-64px)] flex-col'>
			{/* ── Header ── */}
			<div className='flex items-center gap-3 border-b border-white/10 bg-black/30 px-4 py-3'>
				<Link href='/connect/artisan/threads'>
					<Button
						variant='ghost'
						size='icon'
						className='text-white/60'
					>
						<ArrowLeft className='h-5 w-5' />
					</Button>
				</Link>
				<div className='min-w-0 flex-1'>
					<h2 className='truncate text-sm font-semibold text-white'>
						{otherPartyName}
					</h2>
					<div className='flex items-center gap-2'>
						{thread.service?.name && (
							<p className='truncate text-xs text-white/50'>
								{thread.service.name}
							</p>
						)}
						<Badge
							variant='secondary'
							className={`text-[10px] ${statusColor(thread.status)}`}
						>
							{thread.status === 'PROPOSAL_SENT' ?
								'Proposal'
							:	thread.status.charAt(0) +
								thread.status.slice(1).toLowerCase()
							}
						</Badge>
					</div>
				</div>

				{/* Menu */}
				<div className='relative'>
					<Button
						variant='ghost'
						size='icon'
						className='text-white/60'
						onClick={() => setShowMenu(!showMenu)}
					>
						<MoreVertical className='h-5 w-5' />
					</Button>
					{showMenu && (
						<div className='absolute right-0 top-10 z-50 w-48 rounded-lg border border-white/10 bg-neutral-900 py-1 shadow-lg'>
							{!isClosed && (
								<button
									onClick={() => {
										setShowMenu(false);
										setShowCloseConfirm(true);
									}}
									className='flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5'
								>
									<X className='h-4 w-4' />
									Close Conversation
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			{/* ── Messages ── */}
			<div
				ref={scrollRef}
				className='flex-1 overflow-y-auto px-4 py-4'
			>
				<div className='flex flex-col gap-3'>
					{messages.map((msg, idx) => {
						const showDate =
							idx === 0 ||
							!isSameDay(
								messages[idx - 1].createdAt,
								msg.createdAt,
							);
						return (
							<Fragment key={msg.id}>
								{showDate && (
									<div className='flex justify-center py-2'>
										<span className='rounded-full bg-white/5 px-3 py-1 text-[10px] text-white/30'>
											{formatDate(msg.createdAt)}
										</span>
									</div>
								)}
								{renderMessage(msg)}
							</Fragment>
						);
					})}
				</div>
			</div>

			{/* ── Payment Bar ── */}
			{renderPaymentBar()}

			{/* ── Input Area ── */}
			{!isClosed ?
				<div className='border-t border-white/10 bg-black/40 px-4 py-3'>
					{/* Artisan: Proposal button */}
					{myRole === 'ARTISAN' && thread.status === 'OPEN' && (
						<div className='mb-2'>
							<button
								onClick={() => setShowProposalDialog(true)}
								className='flex items-center gap-1.5 rounded-lg border border-purple-500/30 px-3 py-1.5 text-xs text-purple-400 transition-colors hover:bg-purple-500/10'
							>
								<ClipboardList className='h-3.5 w-3.5' />
								Send Proposal
							</button>
						</div>
					)}
					<div className='flex items-end gap-2'>
						<Textarea
							value={messageText}
							onChange={(e) => setMessageText(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder='Type a message...'
							className='max-h-32 min-h-[40px] flex-1 resize-none rounded-xl border-white/10 bg-white/5 text-sm text-white placeholder:text-white/30 focus-visible:ring-purple-500/40'
							rows={1}
						/>
						<Button
							size='icon'
							className='shrink-0 bg-purple-600 hover:bg-purple-700'
							disabled={!messageText.trim() || sending}
							onClick={handleSendMessage}
						>
							{sending ?
								<Loader2 className='h-4 w-4 animate-spin' />
							:	<Send className='h-4 w-4' />}
						</Button>
					</div>
				</div>
			:	<div className='border-t border-white/10 px-4 py-4 text-center text-sm text-white/40'>
					This conversation has been closed
				</div>
			}

			{/* ═══ Dialogs ═══ */}

			{/* Proposal Dialog */}
			<Dialog
				open={showProposalDialog}
				onOpenChange={setShowProposalDialog}
			>
				<DialogContent className='border-white/10 bg-neutral-900 text-white'>
					<DialogHeader>
						<DialogTitle>Send Proposal</DialogTitle>
						<DialogDescription className='text-white/50'>
							Create a structured proposal for the client
						</DialogDescription>
					</DialogHeader>

					<div className='flex flex-col gap-3'>
						<div className='grid grid-cols-2 gap-3'>
							<div>
								<label className='mb-1 block text-xs text-white/60'>
									Price *
								</label>
								<Input
									type='number'
									placeholder='0'
									className='border-white/10 bg-white/5 text-white'
									value={proposalForm.price || ''}
									onChange={(e) =>
										setProposalForm({
											...proposalForm,
											price: Number(e.target.value),
										})
									}
								/>
							</div>
							<div>
								<label className='mb-1 block text-xs text-white/60'>
									Currency
								</label>
								<Input
									placeholder='NGN'
									className='border-white/10 bg-white/5 text-white'
									value={proposalForm.currency || ''}
									onChange={(e) =>
										setProposalForm({
											...proposalForm,
											currency: e.target.value,
										})
									}
								/>
							</div>
						</div>
						<div className='grid grid-cols-2 gap-3'>
							<div>
								<label className='mb-1 block text-xs text-white/60'>
									Date *
								</label>
								<Input
									type='date'
									className='border-white/10 bg-white/5 text-white'
									value={proposalForm.date}
									onChange={(e) =>
										setProposalForm({
											...proposalForm,
											date: e.target.value,
										})
									}
								/>
							</div>
							<div>
								<label className='mb-1 block text-xs text-white/60'>
									Time
								</label>
								<Input
									type='time'
									className='border-white/10 bg-white/5 text-white'
									value={proposalForm.time || ''}
									onChange={(e) =>
										setProposalForm({
											...proposalForm,
											time: e.target.value,
										})
									}
								/>
							</div>
						</div>
						<div>
							<label className='mb-1 block text-xs text-white/60'>
								Duration (minutes)
							</label>
							<Input
								type='number'
								placeholder='60'
								className='border-white/10 bg-white/5 text-white'
								value={proposalForm.duration || ''}
								onChange={(e) =>
									setProposalForm({
										...proposalForm,
										duration: Number(e.target.value),
									})
								}
							/>
						</div>
						<div>
							<label className='mb-1 block text-xs text-white/60'>
								Note
							</label>
							<Textarea
								placeholder='Additional details about the proposal...'
								className='border-white/10 bg-white/5 text-white placeholder:text-white/30'
								value={proposalForm.note || ''}
								onChange={(e) =>
									setProposalForm({
										...proposalForm,
										note: e.target.value,
									})
								}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant='outline'
							className='border-white/10 text-white/60'
							onClick={() => setShowProposalDialog(false)}
						>
							Cancel
						</Button>
						<Button
							className='bg-purple-600 hover:bg-purple-700'
							disabled={actionLoading === 'proposal'}
							onClick={handleSendProposal}
						>
							{actionLoading === 'proposal' ?
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							:	<Send className='mr-2 h-4 w-4' />}
							Send Proposal
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Close Thread Confirm */}
			<Dialog
				open={showCloseConfirm}
				onOpenChange={setShowCloseConfirm}
			>
				<DialogContent className='border-white/10 bg-neutral-900 text-white'>
					<DialogHeader>
						<DialogTitle>Close Conversation</DialogTitle>
						<DialogDescription className='text-white/50'>
							Are you sure you want to close this conversation?
							This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant='outline'
							className='border-white/10 text-white/60'
							onClick={() => setShowCloseConfirm(false)}
						>
							Cancel
						</Button>
						<Button
							variant='destructive'
							disabled={actionLoading === 'close'}
							onClick={handleCloseThread}
						>
							{actionLoading === 'close' ?
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							:	null}
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Payment Confirm Dialog */}
			<Dialog
				open={showPaymentConfirm}
				onOpenChange={setShowPaymentConfirm}
			>
				<DialogContent className='border-white/10 bg-neutral-900 text-white'>
					<DialogHeader>
						<DialogTitle>
							{myRole === 'CLIENT' ?
								'Confirm Payment Sent'
							:	'Confirm Payment Received'}
						</DialogTitle>
						<DialogDescription className='text-white/50'>
							{myRole === 'CLIENT' ?
								'Confirm that you have sent payment to the artisan'
							:	'Confirm that you have received payment from the client'
							}
						</DialogDescription>
					</DialogHeader>
					<div className='flex flex-col gap-3'>
						<div>
							<label className='mb-1 block text-xs text-white/60'>
								Reference (optional)
							</label>
							<Input
								placeholder='Payment reference or receipt number'
								className='border-white/10 bg-white/5 text-white'
								value={paymentReference}
								onChange={(e) =>
									setPaymentReference(e.target.value)
								}
							/>
						</div>
						<div>
							<label className='mb-1 block text-xs text-white/60'>
								Note (optional)
							</label>
							<Textarea
								placeholder='Additional notes...'
								className='border-white/10 bg-white/5 text-white placeholder:text-white/30'
								value={paymentNote}
								onChange={(e) => setPaymentNote(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							className='border-white/10 text-white/60'
							onClick={() => setShowPaymentConfirm(false)}
						>
							Cancel
						</Button>
						<Button
							className='bg-emerald-600 hover:bg-emerald-700'
							disabled={actionLoading === 'payment'}
							onClick={handleConfirmPayment}
						>
							{actionLoading === 'payment' ?
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							:	<CheckCircle2 className='mr-2 h-4 w-4' />}
							Confirm
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Dispute Dialog */}
			<Dialog
				open={showDisputeDialog}
				onOpenChange={setShowDisputeDialog}
			>
				<DialogContent className='border-white/10 bg-neutral-900 text-white'>
					<DialogHeader>
						<DialogTitle>Dispute Payment</DialogTitle>
						<DialogDescription className='text-white/50'>
							File a dispute about the payment for this booking.
							Please provide a reason.
						</DialogDescription>
					</DialogHeader>
					<div>
						<label className='mb-1 block text-xs text-white/60'>
							Reason *
						</label>
						<Textarea
							placeholder='Describe the issue...'
							className='border-white/10 bg-white/5 text-white placeholder:text-white/30'
							value={disputeReason}
							onChange={(e) => setDisputeReason(e.target.value)}
						/>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							className='border-white/10 text-white/60'
							onClick={() => setShowDisputeDialog(false)}
						>
							Cancel
						</Button>
						<Button
							variant='destructive'
							disabled={
								actionLoading === 'dispute' ||
								!disputeReason.trim()
							}
							onClick={handleDispute}
						>
							{actionLoading === 'dispute' ?
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							:	<AlertTriangle className='mr-2 h-4 w-4' />}
							File Dispute
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
