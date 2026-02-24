'use client';

import { useState } from 'react';
import type {
	ArtisanProfile,
	ArtisanCategory,
	WorkingHoursEntry,
} from '@/lib/types/artisan';
import { ArrowLeft, Save, Power } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const CONNECT_API = process.env.NEXT_PUBLIC_CONNECT_API_URL!;

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Build default working hours (Mon-Fri open, Sat-Sun closed) */
function defaultWorkingHours(): WorkingHoursEntry[] {
	return Array.from({ length: 7 }, (_, i) => ({
		day: i,
		open: '09:00',
		close: '17:00',
		isOpen: i < 5,
	}));
}

interface Props {
	artisan: ArtisanProfile;
	allCategories: ArtisanCategory[];
	profileId: string;
	accessToken: string;
}

export default function ArtisanSettingsClient({
	artisan,
	allCategories,
	profileId,
	accessToken,
}: Props) {
	/* ── Profile fields ── */
	const [bio, setBio] = useState(artisan.bio ?? '');
	const [workingHours, setWorkingHours] = useState<WorkingHoursEntry[]>(
		artisan.workingHours?.length ?
			artisan.workingHours
		:	defaultWorkingHours(),
	);

	/* ── Categories ── */
	const [selectedCats, setSelectedCats] = useState<string[]>(
		artisan.categories?.map((c) => c.id) ?? [],
	);

	/* ── Status ── */
	const [status, setStatus] = useState(artisan.status);
	const [saving, setSaving] = useState(false);
	const [statusLoading, setStatusLoading] = useState(false);
	const [catLoading, setCatLoading] = useState(false);

	function updateWorkingHour(
		index: number,
		field: keyof WorkingHoursEntry,
		value: string | boolean | number,
	) {
		setWorkingHours((prev) =>
			prev.map((wh, i) => (i === index ? { ...wh, [field]: value } : wh)),
		);
	}

	function toggleCat(id: string) {
		setSelectedCats((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		);
	}

	/* ── Save profile ── */
	async function handleSaveProfile() {
		setSaving(true);
		try {
			const res = await fetch(`${CONNECT_API}/api/artisan/me`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					profileId,
					bio: bio.trim() || undefined,
					workingHours,
				}),
			});
			const json = await res.json().catch(() => null);
			if (!res.ok) {
				toast.error(json?.message || 'Update failed');
				return;
			}
			toast.success('Profile updated');
		} catch {
			toast.error('Network error');
		} finally {
			setSaving(false);
		}
	}

	/* ── Save categories ── */
	async function handleSaveCategories() {
		if (selectedCats.length === 0) {
			toast.error('Select at least one category');
			return;
		}
		setCatLoading(true);
		try {
			const res = await fetch(`${CONNECT_API}/api/artisan/categories`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ categoryIds: selectedCats }),
			});
			const json = await res.json().catch(() => null);
			if (!res.ok) {
				toast.error(json?.message || 'Failed to update categories');
				return;
			}
			toast.success('Categories updated');
		} catch {
			toast.error('Network error');
		} finally {
			setCatLoading(false);
		}
	}

	/* ── Toggle status ── */
	async function handleToggleStatus() {
		const action = status === 'DEACTIVATED' ? 'reactivate' : 'deactivate';
		if (
			!confirm(`Are you sure you want to ${action} your artisan profile?`)
		)
			return;

		setStatusLoading(true);
		try {
			const res = await fetch(
				`${CONNECT_API}/api/artisan/me/${profileId}/${action}`,
				{
					method: 'POST',
					headers: { Authorization: `Bearer ${accessToken}` },
				},
			);
			const json = await res.json().catch(() => null);
			if (!res.ok) {
				toast.error(json?.message || `Failed to ${action}`);
				return;
			}
			setStatus(action === 'deactivate' ? 'DEACTIVATED' : 'ACTIVE');
			toast.success(
				action === 'deactivate' ?
					'Profile deactivated'
				:	'Profile reactivated',
			);
		} catch {
			toast.error('Network error');
		} finally {
			setStatusLoading(false);
		}
	}

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
				<h1 className='text-xl font-semibold'>Settings</h1>
			</div>

			{/* ── Profile Section ── */}
			<section className='bg-white/5 rounded-xl p-4 space-y-4'>
				<h2 className='text-sm font-medium'>Profile Info</h2>

				<div className='space-y-1'>
					<label className='text-xs text-white/50'>Bio</label>
					<Textarea
						value={bio}
						onChange={(e) => setBio(e.target.value)}
						rows={3}
						placeholder='Tell customers about your experience…'
						className='bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none'
					/>
				</div>

				<Button
					onClick={handleSaveProfile}
					disabled={saving}
					className='w-full bg-purple-600 hover:bg-purple-700'
				>
					<Save className='size-3.5 mr-1.5' />
					{saving ? 'Saving…' : 'Save Profile'}
				</Button>
			</section>

			{/* ── Working Hours ── */}
			<section className='bg-white/5 rounded-xl p-4 space-y-4'>
				<h2 className='text-sm font-medium'>Working Hours</h2>

				<div className='space-y-3'>
					{workingHours.map((wh, i) => (
						<div
							key={wh.day}
							className='flex items-center gap-3'
						>
							<button
								type='button'
								onClick={() =>
									updateWorkingHour(i, 'isOpen', !wh.isOpen)
								}
								className={`w-12 text-xs font-medium rounded-lg py-1.5 text-center transition-colors ${
									wh.isOpen ?
										'bg-purple-600 text-white'
									:	'bg-white/5 text-white/50 hover:bg-white/10'
								}`}
							>
								{DAY_LABELS[wh.day]}
							</button>
							{wh.isOpen ?
								<>
									<Input
										type='time'
										value={wh.open}
										onChange={(e) =>
											updateWorkingHour(
												i,
												'open',
												e.target.value,
											)
										}
										className='bg-white/5 border-white/10 text-white flex-1'
									/>
									<span className='text-xs text-white/30'>
										to
									</span>
									<Input
										type='time'
										value={wh.close}
										onChange={(e) =>
											updateWorkingHour(
												i,
												'close',
												e.target.value,
											)
										}
										className='bg-white/5 border-white/10 text-white flex-1'
									/>
								</>
							:	<span className='text-xs text-white/30 italic'>
									Closed
								</span>
							}
						</div>
					))}
				</div>
			</section>

			{/* ── Categories ── */}
			<section className='bg-white/5 rounded-xl p-4 space-y-4'>
				<h2 className='text-sm font-medium'>Categories</h2>

				<div className='flex flex-wrap gap-2'>
					{allCategories.map((cat) => (
						<button
							key={cat.id}
							type='button'
							onClick={() => toggleCat(cat.id)}
							className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
								selectedCats.includes(cat.id) ?
									'bg-purple-600 text-white'
								:	'bg-white/5 text-white/50 hover:bg-white/10'
							}`}
						>
							{cat.name}
						</button>
					))}
				</div>

				<Button
					onClick={handleSaveCategories}
					disabled={catLoading || selectedCats.length === 0}
					className='w-full bg-purple-600 hover:bg-purple-700'
				>
					{catLoading ? 'Saving…' : 'Save Categories'}
				</Button>
			</section>

			{/* ── Danger Zone ── */}
			<section className='bg-white/5 rounded-xl p-4 space-y-3 border border-white/5'>
				<h2 className='text-sm font-medium text-red-400'>
					Account Status
				</h2>
				<p className='text-xs text-white/50'>
					{status === 'DEACTIVATED' ?
						'Your artisan profile is currently deactivated. Reactivate to appear in the directory.'
					:	'Deactivating will hide your profile from the directory. You can reactivate at any time.'
					}
				</p>
				<Button
					variant='outline'
					onClick={handleToggleStatus}
					disabled={statusLoading}
					className={
						status === 'DEACTIVATED' ?
							'border-green-500/30 text-green-400 hover:bg-green-500/10'
						:	'border-red-500/30 text-red-400 hover:bg-red-500/10'
					}
				>
					<Power className='size-3.5 mr-1.5' />
					{statusLoading ?
						'Processing…'
					: status === 'DEACTIVATED' ?
						'Reactivate Profile'
					:	'Deactivate Profile'}
				</Button>
			</section>
		</div>
	);
}
