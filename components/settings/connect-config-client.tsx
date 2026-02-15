'use client';

import { useState, useCallback } from 'react';
import { csrfFetch } from '@/lib/csrf-client';
import { URLS } from '@/lib/const';
import { toast } from 'sonner';
import {
	GripVertical,
	Eye,
	EyeOff,
	Palette,
	Save,
	Loader2,
	LayoutList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type {
	ModuleConfig,
	ConnectConfig,
	ConnectConfigTheme,
} from '@/lib/services/connect-config';

const MODULE_TYPES = [
	{
		type: 'socials',
		label: 'Social Links',
		description: 'LinkedIn, Twitter, Instagram, etc.',
	},
	{
		type: 'links',
		label: 'Custom Links',
		description: 'Website, portfolio, and other URLs',
	},
	{
		type: 'contact',
		label: 'Contact Info',
		description: 'Phone numbers and contact details',
	},
	{
		type: 'videos',
		label: 'Videos',
		description: 'YouTube, Vimeo, and other embeds',
	},
	{
		type: 'meetings',
		label: 'Meeting Links',
		description: 'Calendly, Zoom, Google Meet',
	},
	{
		type: 'appointments',
		label: 'Appointments',
		description: 'Booking and scheduling links',
	},
	{
		type: 'spotify',
		label: 'Spotify',
		description: 'Tracks, playlists, and albums',
	},
	{
		type: 'files',
		label: 'Files',
		description: 'PDFs, documents, and downloads',
	},
	{
		type: 'forms',
		label: 'Forms',
		description: 'Custom forms and surveys',
	},
	{
		type: 'wallets',
		label: 'Crypto Wallets',
		description: 'Bitcoin, Ethereum, and other addresses',
	},
];

interface ConnectConfigClientProps {
	profileId: string;
	accessToken: string;
	initialConfig: ConnectConfig | null;
}

export default function ConnectConfigClient({
	profileId,
	accessToken,
	initialConfig,
}: ConnectConfigClientProps) {
	const [saving, setSaving] = useState(false);
	const [modules, setModules] = useState<ModuleConfig[]>(() => {
		if (initialConfig?.modules?.length) return initialConfig.modules;
		// Default: all modules enabled in the standard order
		return MODULE_TYPES.map((m, i) => ({
			id: `mod_${m.type}`,
			type: m.type,
			enabled: true,
			order: i + 1,
			visibility: 'public' as const,
		}));
	});

	const [theme, setTheme] = useState<ConnectConfigTheme>(
		initialConfig?.theme || {
			mode: 'light',
			primary: '#0EA5E9',
			accent: '#F59E0B',
		},
	);

	const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

	const sortedModules = [...modules].sort(
		(a, b) => (a.order || 0) - (b.order || 0),
	);

	const getModuleMeta = (type: string) =>
		MODULE_TYPES.find((m) => m.type === type) || {
			type,
			label: type,
			description: '',
		};

	const toggleModule = useCallback((moduleId: string) => {
		setModules((prev) =>
			prev.map((m) =>
				m.id === moduleId ? { ...m, enabled: !m.enabled } : m,
			),
		);
	}, []);

	const toggleVisibility = useCallback((moduleId: string) => {
		setModules((prev) =>
			prev.map((m) =>
				m.id === moduleId ?
					{
						...m,
						visibility:
							m.visibility === 'public' ? 'private' : 'public',
					}
				:	m,
			),
		);
	}, []);

	const moveModule = useCallback((fromIdx: number, toIdx: number) => {
		setModules((prev) => {
			const sorted = [...prev].sort(
				(a, b) => (a.order || 0) - (b.order || 0),
			);
			const [moved] = sorted.splice(fromIdx, 1);
			sorted.splice(toIdx, 0, moved);
			return sorted.map((m, i) => ({ ...m, order: i + 1 }));
		});
	}, []);

	const handleDragStart = (idx: number) => setDraggedIdx(idx);
	const handleDragOver = (e: React.DragEvent, idx: number) => {
		e.preventDefault();
		if (draggedIdx !== null && draggedIdx !== idx) {
			moveModule(draggedIdx, idx);
			setDraggedIdx(idx);
		}
	};
	const handleDragEnd = () => setDraggedIdx(null);

	const handleSave = async () => {
		setSaving(true);
		try {
			const base = process.env.NEXT_PUBLIC_CONNECT_API_URL || '';
			const url = `${base}${URLS.connect_config.update.replace('{profileId}', profileId)}`;
			const res = await csrfFetch(url, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({ modules, theme }),
			});
			if (res.ok) {
				toast.success('Configuration saved');
			} else {
				const err = await res.json().catch(() => null);
				toast.error(err?.message || 'Failed to save configuration');
			}
		} catch {
			toast.error('Failed to save configuration');
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className='space-y-8'>
			{/* Module Order & Visibility */}
			<section>
				<div className='flex items-center gap-2 mb-4'>
					<LayoutList className='h-5 w-5 text-sky-400' />
					<h2 className='text-lg font-semibold'>
						Module Order & Visibility
					</h2>
				</div>
				<p className='text-sm text-white/60 mb-4'>
					Drag to reorder, toggle to show/hide modules on your public
					profile.
				</p>

				<div className='space-y-2'>
					{sortedModules.map((mod, idx) => {
						const meta = getModuleMeta(mod.type);
						return (
							<div
								key={mod.id}
								draggable
								onDragStart={() => handleDragStart(idx)}
								onDragOver={(e) => handleDragOver(e, idx)}
								onDragEnd={handleDragEnd}
								className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
									draggedIdx === idx ?
										'border-sky-500 bg-sky-500/10'
									:	'border-white/10 bg-white/[0.03]'
								} ${!mod.enabled ? 'opacity-50' : ''}`}
							>
								<div className='cursor-grab active:cursor-grabbing text-white/40'>
									<GripVertical className='h-4 w-4' />
								</div>

								<div className='flex-1 min-w-0'>
									<p className='text-sm font-medium'>
										{meta.label}
									</p>
									<p className='text-xs text-white/50 truncate'>
										{meta.description}
									</p>
								</div>

								<button
									onClick={() => toggleVisibility(mod.id)}
									className='p-1.5 rounded-lg hover:bg-white/10 transition'
									title={
										mod.visibility === 'public' ?
											'Public — click to make private'
										:	'Private — click to make public'
									}
								>
									{mod.visibility === 'public' ?
										<Eye className='h-4 w-4 text-green-400' />
									:	<EyeOff className='h-4 w-4 text-white/40' />
									}
								</button>

								<Switch
									checked={mod.enabled !== false}
									onCheckedChange={() => toggleModule(mod.id)}
								/>
							</div>
						);
					})}
				</div>
			</section>

			{/* Theme */}
			<section>
				<div className='flex items-center gap-2 mb-4'>
					<Palette className='h-5 w-5 text-amber-400' />
					<h2 className='text-lg font-semibold'>Theme</h2>
				</div>

				<div className='rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-4'>
					<div className='flex items-center justify-between'>
						<Label className='text-sm'>Dark Mode</Label>
						<Switch
							checked={theme.mode === 'dark'}
							onCheckedChange={(checked) =>
								setTheme((t) => ({
									...t,
									mode: checked ? 'dark' : 'light',
								}))
							}
						/>
					</div>

					<div className='flex items-center justify-between'>
						<Label className='text-sm'>Primary Color</Label>
						<div className='flex items-center gap-2'>
							<input
								title='Primary Color'
								type='color'
								value={theme.primary}
								onChange={(e) =>
									setTheme((t) => ({
										...t,
										primary: e.target.value,
									}))
								}
								className='h-8 w-8 rounded-lg border border-white/20 cursor-pointer bg-transparent'
							/>
							<span className='text-xs text-white/50 font-mono'>
								{theme.primary}
							</span>
						</div>
					</div>

					<div className='flex items-center justify-between'>
						<Label className='text-sm'>Accent Color</Label>
						<div className='flex items-center gap-2'>
							<input
								title='Accent Color'
								type='color'
								value={theme.accent}
								onChange={(e) =>
									setTheme((t) => ({
										...t,
										accent: e.target.value,
									}))
								}
								className='h-8 w-8 rounded-lg border border-white/20 cursor-pointer bg-transparent'
							/>
							<span className='text-xs text-white/50 font-mono'>
								{theme.accent}
							</span>
						</div>
					</div>
				</div>
			</section>

			{/* Save */}
			<Button
				onClick={handleSave}
				disabled={saving}
				className='w-full rounded-full bg-sky-600 hover:bg-sky-700 text-white'
			>
				{saving ?
					<Loader2 className='h-4 w-4 animate-spin mr-2' />
				:	<Save className='h-4 w-4 mr-2' />}
				Save Configuration
			</Button>
		</div>
	);
}
