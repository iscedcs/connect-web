'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { csrfFetch } from '@/lib/csrf-client';
import { LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export default function AddSlugDialog() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [slug, setSlug] = useState('');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	function normalise(raw: string) {
		return raw
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '');
	}

	function validate(value: string): string {
		if (!value) return 'Slug is required';
		if (value.length < 3) return 'Must be at least 3 characters';
		if (value.length > 60) return 'Must be 60 characters or less';
		if (!SLUG_REGEX.test(value))
			return 'Only lowercase letters, numbers, and hyphens allowed. Cannot start or end with a hyphen.';
		return '';
	}

	async function handleSave() {
		const err = validate(slug);
		if (err) {
			setError(err);
			return;
		}

		setSaving(true);
		setError('');

		try {
			const res = await csrfFetch('/api/connect/profile/update', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ slug }),
			});

			const body = await res.json().catch(() => null);

			if (!res.ok) {
				const msg =
					body?.message ||
					body?.error ||
					'Failed to save slug. Please try again.';
				setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
				return;
			}

			toast.success('Profile link created!');
			setOpen(false);
			router.refresh();
		} catch {
			setError('Network error. Please try again.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				setOpen(v);
				if (!v) {
					setSlug('');
					setError('');
				}
			}}
		>
			<DialogTrigger asChild>
				<Button
					size='icon'
					className='h-9 w-9 rounded-full border border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10'
					title='Create your profile link to share'
				>
					<LinkIcon className='h-4 w-4' />
				</Button>
			</DialogTrigger>

			<DialogContent className='sm:max-w-md bg-[#151515] border-white/10 text-white'>
				<DialogHeader>
					<DialogTitle>Create your share link</DialogTitle>
					<DialogDescription className='text-white/60'>
						Choose a unique slug for your profile. This will be your
						shareable link.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-2'>
					{/* Preview */}
					<div className='rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm break-all'>
						<span className='text-white/50'>
							{typeof window !== 'undefined' ?
								window.location.origin
							:	''}
							/p/
						</span>
						<span className='text-white font-medium'>
							{slug || 'your-slug'}
						</span>
					</div>

					{/* Input */}
					<div className='space-y-1.5'>
						<Input
							placeholder='e.g. john-doe'
							value={slug}
							onChange={(e) => {
								const v = normalise(e.target.value);
								setSlug(v);
								if (error) setError(validate(v));
							}}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && !saving) handleSave();
							}}
							className='bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/20'
							disabled={saving}
							autoFocus
						/>
						{error && (
							<p className='text-xs text-red-400'>{error}</p>
						)}
					</div>

					<ul className='text-[11px] text-white/40 space-y-0.5 list-disc pl-4'>
						<li>3–60 characters</li>
						<li>Lowercase letters, numbers, and hyphens only</li>
						<li>Cannot start or end with a hyphen</li>
					</ul>
				</div>

				<DialogFooter>
					<Button
						variant='ghost'
						onClick={() => setOpen(false)}
						disabled={saving}
						className='text-white/60 hover:text-white hover:bg-white/10'
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={saving || !slug}
						className='bg-white text-black hover:bg-white/90'
					>
						{saving && (
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
						)}
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
