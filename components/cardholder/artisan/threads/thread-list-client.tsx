'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type {
	BookingThread,
	ThreadListResponse,
	ThreadStatus,
} from '@/lib/types/artisan';
import {
	ArrowLeft,
	MessageSquare,
	Inbox,
	Send,
	ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

// ─── Props ──────────────────────────────────────────────

interface ThreadListClientProps {
	clientThreads: ThreadListResponse;
	artisanThreads: ThreadListResponse | null;
	isArtisan: boolean;
	accessToken: string;
	profileId: string;
}

// ─── Helpers ────────────────────────────────────────────

const STATUS_FILTERS: { value: string; label: string }[] = [
	{ value: '', label: 'All' },
	{ value: 'OPEN', label: 'Open' },
	{ value: 'PROPOSAL_SENT', label: 'Proposal' },
	{ value: 'BOOKED', label: 'Booked' },
	{ value: 'CLOSED', label: 'Closed' },
];

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

function statusLabel(status: ThreadStatus): string {
	switch (status) {
		case 'OPEN':
			return 'Open';
		case 'PROPOSAL_SENT':
			return 'Proposal Sent';
		case 'BOOKED':
			return 'Booked';
		case 'CLOSED':
			return 'Closed';
		default:
			return status;
	}
}

function formatRelativeTime(dateStr: string): string {
	const date = new Date(dateStr);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60_000);
	const diffHours = Math.floor(diffMs / 3_600_000);
	const diffDays = Math.floor(diffMs / 86_400_000);

	if (diffMins < 1) return 'now';
	if (diffMins < 60) return `${diffMins}m`;
	if (diffHours < 24) return `${diffHours}h`;
	if (diffDays < 7) return `${diffDays}d`;
	return date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
	});
}

function getThreadTitle(thread: BookingThread, isArtisanView: boolean): string {
	if (isArtisanView) {
		return thread.clientName || 'Client';
	}
	const artisan = thread.artisan;
	if (artisan?.profile?.name) return artisan.profile.name;
	return 'Artisan';
}

function getThreadSubtitle(thread: BookingThread): string {
	if (thread.service?.name) return thread.service.name;
	return 'General inquiry';
}

function getLastMessagePreview(thread: BookingThread): string {
	const msg = thread.lastMessage;
	if (!msg) return 'No messages yet';
	if (msg.type === 'PROPOSAL') return '📋 Sent a proposal';
	if (msg.type === 'SYSTEM') return `ℹ️ ${msg.content}`;
	return msg.content.length > 60 ?
			`${msg.content.slice(0, 60)}…`
		:	msg.content;
}

// ─── Component ──────────────────────────────────────────

export default function ThreadListClient({
	clientThreads,
	artisanThreads,
	isArtisan,
	// accessToken and profileId available for future use (polling, etc.)
}: ThreadListClientProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<'inquiries' | 'inbox'>(
		'inquiries',
	);
	const [activeFilter, setActiveFilter] = useState('');

	const currentList =
		activeTab === 'inbox' && artisanThreads ?
			artisanThreads.threads
		:	clientThreads.threads;

	const filteredThreads =
		activeFilter ?
			currentList.filter((t) => t.status === activeFilter)
		:	currentList;

	const isArtisanView = activeTab === 'inbox';

	return (
		<div className='flex flex-col gap-4'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<Link href='/connect/artisan'>
						<Button
							variant='ghost'
							size='icon'
							className='text-white/60'
						>
							<ArrowLeft className='h-5 w-5' />
						</Button>
					</Link>
					<h1 className='text-xl font-semibold text-white'>
						Messages
					</h1>
				</div>
			</div>

			{/* Tabs — only show if user is an artisan */}
			{isArtisan && artisanThreads && (
				<div className='flex rounded-lg bg-white/5 p-1'>
					<button
						onClick={() => {
							setActiveTab('inquiries');
							setActiveFilter('');
						}}
						className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
							activeTab === 'inquiries' ?
								'bg-purple-600 text-white'
							:	'text-white/60 hover:text-white'
						}`}
					>
						<Send className='h-4 w-4' />
						My Inquiries
						{clientThreads.total > 0 && (
							<span className='ml-1 text-xs opacity-70'>
								({clientThreads.total})
							</span>
						)}
					</button>
					<button
						onClick={() => {
							setActiveTab('inbox');
							setActiveFilter('');
						}}
						className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
							activeTab === 'inbox' ?
								'bg-purple-600 text-white'
							:	'text-white/60 hover:text-white'
						}`}
					>
						<Inbox className='h-4 w-4' />
						Inbox
						{artisanThreads.total > 0 && (
							<span className='ml-1 text-xs opacity-70'>
								({artisanThreads.total})
							</span>
						)}
					</button>
				</div>
			)}

			{/* Status Filters */}
			<ScrollArea className='w-full'>
				<div className='flex gap-2 pb-2'>
					{STATUS_FILTERS.map((f) => (
						<button
							key={f.value}
							onClick={() => setActiveFilter(f.value)}
							className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
								activeFilter === f.value ?
									'bg-purple-600 text-white'
								:	'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
							}`}
						>
							{f.label}
						</button>
					))}
				</div>
			</ScrollArea>

			{/* Thread List */}
			{filteredThreads.length === 0 ?
				<div className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
					<MessageSquare className='h-12 w-12 text-white/20' />
					<p className='text-white/40'>
						{activeFilter ?
							'No conversations with this status'
						: isArtisanView ?
							'No client inquiries yet'
						:	"You haven't started any conversations yet"}
					</p>
					{!isArtisanView && (
						<Link href='/connect/artisan/directory'>
							<Button
								variant='outline'
								className='border-purple-500/30 text-purple-400'
							>
								Browse Artisans
							</Button>
						</Link>
					)}
				</div>
			:	<div className='flex flex-col gap-2'>
					{filteredThreads.map((thread) => (
						<button
							key={thread.id}
							onClick={() =>
								router.push(
									`/connect/artisan/threads/${thread.id}`,
								)
							}
							className='flex items-center gap-3 rounded-xl bg-white/5 p-4 text-left transition-colors hover:bg-white/10'
						>
							{/* Avatar placeholder */}
							<div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-600/30 text-sm font-semibold text-purple-300'>
								{getThreadTitle(thread, isArtisanView)
									.charAt(0)
									.toUpperCase()}
							</div>

							{/* Thread info */}
							<div className='min-w-0 flex-1'>
								<div className='flex items-center justify-between gap-2'>
									<span className='truncate text-sm font-medium text-white'>
										{getThreadTitle(thread, isArtisanView)}
									</span>
									<span className='shrink-0 text-xs text-white/40'>
										{formatRelativeTime(
											thread.lastMessageAt ||
												thread.createdAt,
										)}
									</span>
								</div>
								<p className='truncate text-xs text-white/50'>
									{getThreadSubtitle(thread)}
								</p>
								<div className='mt-1 flex items-center justify-between gap-2'>
									<p className='truncate text-xs text-white/40'>
										{getLastMessagePreview(thread)}
									</p>
									<Badge
										variant='secondary'
										className={`shrink-0 text-[10px] ${statusColor(thread.status)}`}
									>
										{statusLabel(thread.status)}
									</Badge>
								</div>
							</div>

							<ChevronRight className='h-4 w-4 shrink-0 text-white/20' />
						</button>
					))}
				</div>
			}
		</div>
	);
}
