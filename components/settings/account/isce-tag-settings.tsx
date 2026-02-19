'use client';

import { useState, useTransition } from 'react';
import { AtSign, CheckCircle2, Clock, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { csrfFetch } from '@/lib/csrf-client';
import { useRouter } from 'next/navigation';
import { LeftIcon } from '@/lib/icons';

interface TagHistoryEntry {
	previousTag: string;
	changedAt: string;
}

interface IsceTagSettingsProps {
	currentTag: string | null;
	tagHistory: TagHistoryEntry[];
}

const TAG_REGEX = /^[a-z0-9_-]{3,30}$/;
const COOLDOWN_DAYS = 30;

function msToDay(ms: number) {
	return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function getCooldownInfo(tagHistory: TagHistoryEntry[]) {
	if (!tagHistory.length) return null;
	const lastEntry = tagHistory[0];
	const changedAt = new Date(lastEntry.changedAt).getTime();
	const now = Date.now();
	const daysSince = msToDay(now - changedAt);
	if (daysSince < COOLDOWN_DAYS) {
		return { daysLeft: COOLDOWN_DAYS - daysSince };
	}
	return null;
}

export default function IsceTagSettings({ currentTag, tagHistory }: IsceTagSettingsProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [input, setInput] = useState('');
	const [validationError, setValidationError] = useState<string | null>(null);

	const cooldown = getCooldownInfo(tagHistory);

	function validateInput(value: string) {
		const raw = value.startsWith('@') ? value.slice(1) : value;
		if (raw.length === 0) {
			setValidationError(null);
			return null;
		}
		if (raw.length < 3) {
			setValidationError('At least 3 characters required');
			return null;
		}
		if (raw.length > 30) {
			setValidationError('Maximum 30 characters');
			return null;
		}
		if (!TAG_REGEX.test(raw)) {
			setValidationError('Only lowercase letters, numbers, _ and - are allowed');
			return null;
		}
		setValidationError(null);
		return raw;
	}

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const val = e.target.value.toLowerCase().replace(/\s/g, '');
		setInput(val);
		validateInput(val);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const raw = input.startsWith('@') ? input.slice(1) : input;
		const valid = validateInput(raw);
		if (!valid) return;

		startTransition(async () => {
			try {
				const res = await csrfFetch('/api/user/tag', {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username: valid }),
				});

				const json = await res.json().catch(() => ({}));

				if (!res.ok) {
					toast.error(json?.message ?? 'Failed to update ISCE Tag');
					return;
				}

				toast.success('ISCE Tag updated successfully!');
				router.push('/settings');
				router.refresh();
			} catch {
				toast.error('Something went wrong. Please try again.');
			}
		});
	}

	return (
		<div className='min-h-screen bg-black text-white pb-10'>
			{/* Header */}
			<div className='flex items-center gap-3 px-4 pt-6 pb-4'>
				<button
					title='back'
					onClick={() => router.back()}
					className='inline-flex items-center bg-transparent cursor-pointer text-white/90'
				>
					<LeftIcon className='size-5' />
				</button>
				<h1 className='text-lg font-semibold'>ISCE Tag</h1>
			</div>

			<div className='px-4 space-y-6'>
				{/* Current Tag */}
				<div className='rounded-2xl bg-white/5 border border-white/10 p-5 space-y-2'>
					<p className='text-sm text-white/50'>Current Tag</p>
					{currentTag ? (
						<div className='flex items-center gap-2'>
							<span className='text-xl font-bold'>{currentTag}</span>
							<span className='flex items-center gap-1 bg-green-500/15 text-green-400 text-xs font-medium px-2 py-0.5 rounded-full'>
								<CheckCircle2 className='size-3' />
								Active
							</span>
						</div>
					) : (
						<p className='text-white/40 italic text-sm'>No ISCE Tag set yet</p>
					)}
				</div>

				{/* Cooldown notice */}
				{cooldown && (
					<div className='flex items-start gap-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 text-sm text-yellow-300'>
						<Clock className='size-4 mt-0.5 shrink-0' />
						<p>
							You can change your tag again in{' '}
							<span className='font-semibold'>{cooldown.daysLeft} day{cooldown.daysLeft !== 1 ? 's' : ''}</span>.
							Tags can only be changed once every {COOLDOWN_DAYS} days.
						</p>
					</div>
				)}

				{/* Update form */}
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='isce-tag' className='text-sm text-white/70'>
							New ISCE Tag
						</Label>
						<div className='relative'>
							<AtSign className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40' />
							<Input
								id='isce-tag'
								value={input}
								onChange={handleInputChange}
								placeholder='yourhandle'
								disabled={!!cooldown || isPending}
								className='pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/30 rounded-xl h-11'
								maxLength={31}
								autoComplete='off'
								autoCapitalize='none'
								spellCheck={false}
							/>
						</div>
						{validationError ? (
							<p className='text-xs text-red-400'>{validationError}</p>
						) : (
							<p className='text-xs text-white/40'>
								3–30 characters. Lowercase letters, numbers, _ and - only.
							</p>
						)}
					</div>

					<Button
						type='submit'
						disabled={!!cooldown || isPending || !input || !!validationError}
						className='w-full h-11 rounded-xl font-semibold bg-white text-black hover:bg-white/90 disabled:opacity-40'
					>
						{isPending ? 'Saving…' : 'Save ISCE Tag'}
					</Button>
				</form>

				{/* Tag history */}
				{tagHistory.length > 0 && (
					<div className='space-y-3'>
						<div className='flex items-center gap-2 text-sm text-white/50'>
							<History className='size-4' />
							<span>Recent Tag History</span>
						</div>
						<div className='rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/5'>
							{tagHistory.slice(0, 5).map((entry, i) => (
								<div key={i} className='flex items-center justify-between px-4 py-3'>
									<span className='text-sm font-medium'>@{entry.previousTag}</span>
									<span className='text-xs text-white/40'>
										{new Date(entry.changedAt).toLocaleDateString('en-NG', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
										})}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
