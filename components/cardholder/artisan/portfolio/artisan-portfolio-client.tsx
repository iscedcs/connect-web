'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PortfolioItem } from '@/lib/types/artisan';
import { NEXT_PUBLIC_CONNECT_API_ORIGIN, URLS } from '@/lib/const';
import { uploadAsset } from '@/lib/client-upload';
import {
	ArrowLeft,
	Loader2,
	Plus,
	Trash2,
	Pencil,
	X,
	Image as ImageIcon,
	FolderOpen,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ArtisanPortfolioClientProps {
	portfolio: PortfolioItem[];
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

export default function ArtisanPortfolioClient({
	portfolio: initialPortfolio,
	accessToken,
	profileId,
}: ArtisanPortfolioClientProps) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [portfolio, setPortfolio] =
		useState<PortfolioItem[]>(initialPortfolio);
	const [showForm, setShowForm] = useState(false);
	const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);

	// Form fields
	const [url, setUrl] = useState('');
	const [caption, setCaption] = useState('');
	const [type, setType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
	const [order, setOrder] = useState(0);

	const resetForm = () => {
		setUrl('');
		setCaption('');
		setType('IMAGE');
		setOrder(0);
		setEditingItem(null);
		setShowForm(false);
	};

	const openEditForm = (item: PortfolioItem) => {
		setUrl(item.url);
		setCaption(item.caption || '');
		setType(item.type as 'IMAGE' | 'VIDEO');
		setOrder(item.order ?? 0);
		setEditingItem(item);
		setShowForm(true);
	};

	const handleImageUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const files = e.target.files;
		if (!files?.length) return;

		setUploading(true);
		try {
			const uploaded = await uploadAsset(
				files[0],
				`profiles/${profileId}/portfolio`,
			);
			setUrl(uploaded.url);
		} catch {
			toast.error('Failed to upload image');
		} finally {
			setUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = '';
		}
	};

	const handleSubmit = async () => {
		if (!url.trim()) {
			toast.error('Upload an image first');
			return;
		}

		setSubmitting(true);

		const body: Record<string, unknown> = {
			url,
			caption: caption.trim() || undefined,
			type,
			order,
		};

		try {
			const isEdit = !!editingItem;
			const url =
				isEdit ?
					buildUrl(URLS.artisan.update_portfolio, {
						profileId,
						itemId: editingItem.id,
					})
				:	buildUrl(URLS.artisan.add_portfolio, { profileId });

			const res = await fetch(`${NEXT_PUBLIC_CONNECT_API_ORIGIN}${url}`, {
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
						`Failed to ${isEdit ? 'update' : 'add'} item`,
				);
				return;
			}

			toast.success(isEdit ? 'Item updated' : 'Item added');
			resetForm();
			router.refresh();
		} catch {
			toast.error('Network error');
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (itemId: string) => {
		setDeleting(itemId);
		try {
			const url = buildUrl(URLS.artisan.delete_portfolio, {
				profileId,
				itemId,
			});
			const res = await fetch(`${NEXT_PUBLIC_CONNECT_API_ORIGIN}${url}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (!res.ok) {
				const json = await res.json().catch(() => null);
				toast.error(json?.message || 'Failed to delete item');
				return;
			}

			toast.success('Item deleted');
			setPortfolio((prev) => prev.filter((p) => p.id !== itemId));
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
					<h1 className='text-xl font-semibold'>Portfolio</h1>
					<p className='text-xs text-white/50'>
						{portfolio.length} item
						{portfolio.length !== 1 ? 's' : ''}
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

			{/* Form */}
			{showForm && (
				<div className='bg-white/5 rounded-xl p-4 space-y-4 border border-white/10'>
					<div className='flex items-center justify-between'>
						<h2 className='text-sm font-medium'>
							{editingItem ?
								'Edit Portfolio Item'
							:	'New Portfolio Item'}
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
						{/* Image Upload */}
						<div className='space-y-2'>
							<label className='text-xs text-white/60'>
								Image *
							</label>

							{/* Preview */}
							{url && (
								<div className='relative aspect-video rounded-lg overflow-hidden group'>
									<Image
										src={url}
										alt='Portfolio preview'
										fill
										className='object-cover'
									/>
									<button
										title='remove image'
										type='button'
										onClick={() => setUrl('')}
										className='absolute top-1 right-1 p-1 rounded bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity'
									>
										<X className='size-3 text-white' />
									</button>
								</div>
							)}

							<input
								title='upload image'
								ref={fileInputRef}
								type='file'
								accept='image/jpeg,image/png,image/webp'
								onChange={handleImageUpload}
								className='hidden'
							/>

							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => fileInputRef.current?.click()}
								disabled={uploading}
								className='w-full border-dashed border-white/20 bg-transparent hover:bg-white/5 text-white/60'
							>
								{uploading ?
									<>
										<Loader2 className='size-4 mr-2 animate-spin' />
										Uploading…
									</>
								:	<>
										<ImageIcon className='size-4 mr-2' />
										{url ? 'Replace Image' : 'Upload Image'}
									</>
								}
							</Button>
						</div>

						<div className='space-y-1.5'>
							<label className='text-xs text-white/60'>
								Caption
							</label>
							<Input
								value={caption}
								onChange={(e) => setCaption(e.target.value)}
								placeholder='e.g. Kitchen Renovation — Lagos'
								className='bg-white/5 border-white/10 text-white placeholder:text-white/30'
							/>
						</div>

						<div className='space-y-1.5'>
							<label className='text-xs text-white/60'>
								Display Order
							</label>
							<Input
								type='number'
								min={0}
								value={order}
								onChange={(e) =>
									setOrder(Number(e.target.value))
								}
								className='bg-white/5 border-white/10 text-white'
							/>
						</div>
					</div>

					<Button
						onClick={handleSubmit}
						disabled={submitting || uploading}
						className='w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60'
					>
						{submitting ?
							<>
								<Loader2 className='mr-2 size-4 animate-spin' />
								Saving…
							</>
						: editingItem ?
							'Update Item'
						:	'Add to Portfolio'}
					</Button>
				</div>
			)}

			{/* Portfolio Grid */}
			{portfolio.length === 0 && !showForm ?
				<div className='flex flex-col items-center py-16 gap-4 text-center'>
					<FolderOpen className='size-10 text-white/20' />
					<div>
						<p className='text-sm text-white/50'>
							No portfolio items yet
						</p>
						<p className='text-xs text-white/30 mt-1'>
							Showcase your best work to attract clients
						</p>
					</div>
				</div>
			:	<div className='space-y-3'>
					{portfolio.map((item) => (
						<div
							key={item.id}
							className='bg-white/5 rounded-xl overflow-hidden border border-white/5'
						>
							{/* Cover image */}
							{item.url && (
								<div className='relative aspect-video'>
									<Image
										src={item.url}
										alt={item.caption || 'Portfolio item'}
										fill
										className='object-cover'
									/>
								</div>
							)}

							{/* Info */}
							<div className='p-3'>
								<div className='flex items-start justify-between gap-2'>
									<div className='flex-1 min-w-0'>
										{item.caption && (
											<p className='text-sm font-medium truncate'>
												{item.caption}
											</p>
										)}
									</div>
									<div className='flex items-center gap-1'>
										<button
											title='edit item'
											type='button'
											onClick={() => openEditForm(item)}
											className='p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors'
										>
											<Pencil className='size-3.5' />
										</button>
										<button
											type='button'
											onClick={() =>
												handleDelete(item.id)
											}
											disabled={deleting === item.id}
											className='p-2 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors disabled:opacity-40'
										>
											{deleting === item.id ?
												<Loader2 className='size-3.5 animate-spin' />
											:	<Trash2 className='size-3.5' />}
										</button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			}
		</div>
	);
}
