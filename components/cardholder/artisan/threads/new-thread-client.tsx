'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { ArtisanService } from '@/lib/types/artisan';
import { BASE_URLS, URLS } from '@/lib/const';

interface Props {
	artisanId: string;
	serviceId?: string;
	accessToken: string;
	profileId: string;
	userName: string;
}

export default function NewThreadClient({
	artisanId,
	serviceId,
	accessToken,
	profileId,
	userName,
}: Props) {
	const router = useRouter();
	const [message, setMessage] = useState('');
	const [sending, setSending] = useState(false);
	const [services, setServices] = useState<ArtisanService[]>([]);
	const [selectedServiceId, setSelectedServiceId] = useState(serviceId || '');
	const [artisanName, setArtisanName] = useState('');
	const [loaded, setLoaded] = useState(false);

	// Fetch artisan info on mount
	useEffect(() => {
		(async () => {
			try {
				const url = `${BASE_URLS.CONNECT_API}${URLS.directory.artisan_profile.replace('{artisanId}', artisanId)}`;
				const res = await fetch(url, {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});
				if (res.ok) {
					const json = await res.json();
					const data = json?.data;
					if (data) {
						setArtisanName(
							data.profile?.name ||
								`${data.profile?.firstName || ''} ${data.profile?.lastName || ''}`.trim() ||
								'Artisan',
						);
						setServices(data.services || []);
					}
				}
			} catch {
				// silently fail — user can still send without this
			} finally {
				setLoaded(true);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function handleSend() {
		const trimmed = message.trim();
		if (!trimmed) {
			toast.error('Please enter a message');
			return;
		}

		setSending(true);
		try {
			const res = await fetch(
				`${BASE_URLS.CONNECT_API}${URLS.threads.create}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`,
					},
					body: JSON.stringify({
						artisanId,
						serviceId: selectedServiceId || undefined,
						message: trimmed,
						clientName: userName,
						clientProfileId: profileId,
					}),
				},
			);

			const json = await res.json();

			if (!res.ok) {
				toast.error(json?.message || 'Failed to send inquiry');
				return;
			}

			toast.success('Inquiry sent!');
			const threadId = json?.data?.id;
			if (threadId) {
				router.push(`/connect/artisan/threads/${threadId}`);
			} else {
				router.push('/connect/artisan/threads');
			}
		} catch {
			toast.error('Network error — please try again');
		} finally {
			setSending(false);
		}
	}

	return (
		<div className='max-w-lg mx-auto'>
			{/* Header */}
			<div className='flex items-center gap-3 mb-6'>
				<Link
					href='/connect/artisan/threads'
					className='p-1.5 rounded-lg hover:bg-white/5 transition'
				>
					<ArrowLeft className='w-5 h-5' />
				</Link>
				<div>
					<h1 className='text-lg font-semibold'>New Inquiry</h1>
					{artisanName && (
						<p className='text-xs text-white/50'>
							to {artisanName}
						</p>
					)}
				</div>
			</div>

			{/* Service selector */}
			{loaded && services.length > 0 && (
				<div className='mb-4'>
					<label className='text-xs text-white/50 mb-1.5 block'>
						Service (optional)
					</label>
					<select
						title='Select a service'
						value={selectedServiceId}
						onChange={(e) => setSelectedServiceId(e.target.value)}
						className='w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500'
					>
						<option value=''>General inquiry</option>
						{services.map((s) => (
							<option
								key={s.id}
								value={s.id}
							>
								{s.name}
								{s.price ?
									` — ${s.currency} ${Number(s.price).toLocaleString()}`
								:	''}
							</option>
						))}
					</select>
				</div>
			)}

			{/* Message */}
			<div className='mb-4'>
				<label className='text-xs text-white/50 mb-1.5 block'>
					Your message
				</label>
				<Textarea
					placeholder="Hi, I'm interested in your services…"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					rows={5}
					className='bg-white/5 border-white/10 rounded-xl text-sm resize-none focus:ring-1 focus:ring-purple-500'
				/>
			</div>

			{/* Send */}
			<Button
				onClick={handleSend}
				disabled={sending || !message.trim()}
				className='w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-2.5'
			>
				{sending ?
					<Loader2 className='w-4 h-4 animate-spin mr-2' />
				:	<Send className='w-4 h-4 mr-2' />}
				{sending ? 'Sending…' : 'Send Inquiry'}
			</Button>
		</div>
	);
}
