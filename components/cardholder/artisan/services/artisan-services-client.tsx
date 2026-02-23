'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ArtisanService } from '@/lib/types/artisan';
import { BASE_URLS, URLS } from '@/lib/const';
import {
	ArrowLeft,
	Loader2,
	Plus,
	Trash2,
	Pencil,
	X,
	Wrench,
} from 'lucide-react';
import Link from 'next/link';

interface ArtisanServicesClientProps {
	services: ArtisanService[];
	accessToken: string;
	profileId: string;
}

function buildUrl(template: string, params: Record<string, string>): string {
	let url = template;
	for (const [key, value] of Object.entries(params)) {
		url = url.replace(`{${key}}`, encodeURIComponent(value));
	}
	return url;
}

export default function ArtisanServicesClient({
	services: initialServices,
	accessToken,
	profileId,
}: ArtisanServicesClientProps) {
	const router = useRouter();
	const [services, setServices] = useState<ArtisanService[]>(initialServices);
	const [showForm, setShowForm] = useState(false);
	const [editingService, setEditingService] = useState<ArtisanService | null>(
		null,
	);
	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState<string | null>(null);

	// Form fields
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [price, setPrice] = useState('');
	const [currency] = useState('NGN');
	const [duration, setDuration] = useState('');

	const resetForm = () => {
		setName('');
		setDescription('');
		setPrice('');
		setDuration('');
		setEditingService(null);
		setShowForm(false);
	};

	const openEditForm = (service: ArtisanService) => {
		setName(service.name);
		setDescription(service.description || '');
		setPrice(service.price != null ? String(service.price) : '');
		setDuration(service.duration != null ? String(service.duration) : '');
		setEditingService(service);
		setShowForm(true);
	};

	const handleSubmit = async () => {
		if (!name.trim()) {
			toast.error('Service name is required');
			return;
		}
		setSubmitting(true);

		const body: Record<string, unknown> = {
			name: name.trim(),
			description: description.trim() || undefined,
			price: price ? parseFloat(price) : undefined,
			currency,
			duration: duration ? parseInt(duration, 10) : undefined,
		};

		try {
			const isEdit = !!editingService;
			const url =
				isEdit ?
					buildUrl(URLS.artisan.update_service, {
						profileId,
						serviceId: editingService.id,
					})
				:	buildUrl(URLS.artisan.create_service, { profileId });

			const res = await fetch(`${BASE_URLS.CONNECT_API}${url}`, {
				method: isEdit ? 'PATCH' : 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify(body),
			});

			const json = await res.json().catch(() => null);

			if (!res.ok) {
				toast.error(
					json?.message ||
						`Failed to ${isEdit ? 'update' : 'create'} service`,
				);
				return;
			}

			toast.success(isEdit ? 'Service updated' : 'Service created');

			// Update local state so the list refreshes immediately
			if (json?.data) {
				if (isEdit) {
					setServices((prev) =>
						prev.map((s) =>
							s.id === editingService.id ? json.data : s,
						),
					);
				} else {
					setServices((prev) => [...prev, json.data]);
				}
			}

			resetForm();
			router.refresh();
		} catch {
			toast.error('Network error');
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (serviceId: string) => {
		setDeleting(serviceId);
		try {
			const url = buildUrl(URLS.artisan.delete_service, {
				profileId,
				serviceId,
			});
			const res = await fetch(`${BASE_URLS.CONNECT_API}${url}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (!res.ok) {
				const json = await res.json().catch(() => null);
				toast.error(json?.message || 'Failed to delete service');
				return;
			}

			toast.success('Service deleted');
			setServices((prev) => prev.filter((s) => s.id !== serviceId));
		} catch {
			toast.error('Network error');
		} finally {
			setDeleting(null);
		}
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
					<h1 className='text-xl font-semibold'>Services</h1>
					<p className='text-xs text-white/50'>
						{services.length} service
						{services.length !== 1 ? 's' : ''}
					</p>
				</div>
				{!showForm && (
					<Button
						onClick={() => setShowForm(true)}
						size='sm'
						className='bg-purple-600 hover:bg-purple-700'
					>
						<Plus className='size-4 mr-1' />
						Add
					</Button>
				)}
			</div>

			{/* Create / Edit Form */}
			{showForm && (
				<div className='bg-white/5 rounded-xl p-4 space-y-4 border border-white/10'>
					<div className='flex items-center justify-between'>
						<h2 className='text-sm font-medium'>
							{editingService ? 'Edit Service' : 'New Service'}
						</h2>
						<button
							title='reset form'
							type='button'
							onClick={resetForm}
							className='p-1 rounded hover:bg-white/10'
						>
							<X className='size-4 text-white/50' />
						</button>
					</div>

					<div className='space-y-3'>
						<div className='space-y-1.5'>
							<label className='text-xs text-white/60'>
								Name *
							</label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder='e.g. Home Plumbing Repair'
								className='bg-white/5 border-white/10 text-white placeholder:text-white/30'
							/>
						</div>

						<div className='space-y-1.5'>
							<label className='text-xs text-white/60'>
								Description
							</label>
							<Textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder='Describe what the service includes...'
								rows={3}
								className='bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none'
							/>
						</div>

						<div className='grid grid-cols-2 gap-3'>
							<div className='space-y-1.5'>
								<label className='text-xs text-white/60'>
									Price (₦){' '}
									<span className='text-white/30'>
										— optional
									</span>
								</label>
								<Input
									type='number'
									value={price}
									onChange={(e) => setPrice(e.target.value)}
									placeholder='0.00'
									min={0}
									className='bg-white/5 border-white/10 text-white placeholder:text-white/30'
								/>
							</div>
							<div className='space-y-1.5'>
								<label className='text-xs text-white/60'>
									Duration (mins)
								</label>
								<Input
									type='number'
									value={duration}
									onChange={(e) =>
										setDuration(e.target.value)
									}
									placeholder='60'
									min={15}
									className='bg-white/5 border-white/10 text-white placeholder:text-white/30'
								/>
							</div>
						</div>
					</div>

					<Button
						onClick={handleSubmit}
						disabled={submitting}
						className='w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60'
					>
						{submitting ?
							<>
								<Loader2 className='mr-2 size-4 animate-spin' />
								Saving…
							</>
						: editingService ?
							'Update Service'
						:	'Create Service'}
					</Button>
				</div>
			)}

			{/* Service List */}
			{services.length === 0 && !showForm ?
				<div className='flex flex-col items-center py-16 gap-4 text-center'>
					<Wrench className='size-10 text-white/20' />
					<div>
						<p className='text-sm text-white/50'>No services yet</p>
						<p className='text-xs text-white/30 mt-1'>
							Add your first service to start receiving bookings
						</p>
					</div>
				</div>
			:	<div className='space-y-2'>
					{services.map((service) => (
						<div
							key={service.id}
							className='bg-white/5 rounded-xl p-4 border border-white/5'
						>
							<div className='flex items-start gap-3'>
								<div className='flex-1 min-w-0'>
									<div className='flex items-center gap-2'>
										<p className='text-sm font-medium truncate'>
											{service.name}
										</p>
										{!service.isActive && (
											<span className='text-[9px] px-1.5 py-0.5 bg-white/10 rounded text-white/40'>
												Inactive
											</span>
										)}
									</div>
									{service.description && (
										<p className='text-xs text-white/40 mt-0.5 line-clamp-2'>
											{service.description}
										</p>
									)}
									<div className='flex items-center gap-3 mt-2 text-xs text-white/50'>
										<span>
											{service.price != null ?
												`₦${service.price.toLocaleString()}`
											:	'Price not set'}
										</span>
										{service.duration && (
											<span>{service.duration} min</span>
										)}
									</div>
								</div>
								<div className='flex items-center gap-1.5'>
									<button
										title='open edit form'
										type='button'
										onClick={() => openEditForm(service)}
										className='p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors'
									>
										<Pencil className='size-3.5' />
									</button>
									<button
										type='button'
										onClick={() => handleDelete(service.id)}
										disabled={deleting === service.id}
										className='p-2 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors disabled:opacity-40'
									>
										{deleting === service.id ?
											<Loader2 className='size-3.5 animate-spin' />
										:	<Trash2 className='size-3.5' />}
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			}
		</div>
	);
}
