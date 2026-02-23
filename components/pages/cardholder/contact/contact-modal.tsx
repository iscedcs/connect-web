'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { http } from '@/lib/services/http';
import { URLS } from '@/lib/const';
import { toast } from 'sonner';
import ContactViewModalSkeleton from '@/components/shared/skeleton/contact-view-modal-skeleton';

export default function ContactViewModal({
	open,
	onClose,
	profileId,
	contactId,
	accessToken,
	onDeleted,
}: {
	open: boolean;
	onClose: () => void;
	profileId: string;
	contactId: string;
	accessToken: string;
	onDeleted: () => void;
}) {
	const [contact, setContact] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		if (!open) return;

		async function load() {
			setLoading(true);
			try {
				const res = await http.get(
					`${
						process.env.NEXT_PUBLIC_CONNECT_API_URL
					}${URLS.profile_contact.recieved_one
						.replace('{profileId}', profileId)
						.replace('{id}', contactId)}`,
					{
						headers: { Authorization: `Bearer ${accessToken}` },
					},
				);
				setContact(res.data.data.contact);
			} catch {
				toast.error('Failed to load contact');
				onClose();
			} finally {
				setLoading(false);
			}
		}

		load();
	}, [open]);

	async function handleDelete() {
		setDeleting(true);
		try {
			await http.patch(
				`${
					process.env.NEXT_PUBLIC_CONNECT_API_URL
				}${URLS.profile_contact.delete_recieved
					.replace('{profileId}', profileId)
					.replace('{id}', contactId)}`,
				null,
				{
					headers: { Authorization: `Bearer ${accessToken}` },
				},
			);

			toast.success('Contact deleted');
			onDeleted();
			onClose();
		} catch {
			toast.error('Failed to delete contact');
		} finally {
			setDeleting(false);
		}
	}

	if (!open) return null;

	const profile = contact?.contactProfile;
	const isLinked = !!profile;

	const displayName =
		isLinked ?
			profile.name || 'Unnamed'
		:	[contact?.firstName, contact?.lastName].filter(Boolean).join(' ') ||
			'Unnamed Contact';

	const avatarUrl = isLinked ? profile.profilePhoto : null;

	return (
		<div className='fixed inset-0 z-50 bg-black/80 flex items-center justify-center'>
			<div className='bg-neutral-900 border border-white/10 rounded-2xl p-6 w-[90%] max-w-md space-y-4'>
				{loading ?
					<ContactViewModalSkeleton />
				:	<>
						{/* Header with avatar */}
						<div className='flex items-center gap-4'>
							{avatarUrl ?
								<Image
									src={avatarUrl}
									alt={displayName}
									width={56}
									height={56}
									className='rounded-full object-cover w-14 h-14 flex-shrink-0'
								/>
							:	<div className='w-14 h-14 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0'>
									<span className='text-white/60 text-lg font-semibold'>
										{displayName.charAt(0).toUpperCase()}
									</span>
								</div>
							}

							<div className='flex-1 min-w-0'>
								<div className='flex items-center gap-2'>
									<h2 className='text-xl text-white font-extrabold truncate'>
										{displayName}
									</h2>
									{isLinked ?
										<span className='text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full flex-shrink-0'>
											Connected
										</span>
									:	<span className='text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full flex-shrink-0'>
											Guest
										</span>
									}
								</div>

								{isLinked &&
									(profile.position || profile.location) && (
										<p className='text-sm text-white/60'>
											{[
												profile.position,
												profile.location,
											]
												.filter(Boolean)
												.join(' · ')}
										</p>
									)}

								<p className='text-xs text-white/40'>
									Received{' '}
									{new Date(
										contact?.createdAt,
									).toLocaleString()}
								</p>
							</div>
						</div>

						{/* Contact details for guest contacts */}
						{!isLinked && (
							<div className='space-y-2'>
								{contact?.email && (
									<p className='text-sm text-white'>
										{contact.email}
									</p>
								)}
								{contact?.phone && (
									<p className='text-sm text-white'>
										{contact.phone}
									</p>
								)}
							</div>
						)}

						{/* Note (shown for all contacts) */}
						{contact?.note && (
							<p className='text-sm italic text-white/60'>
								&ldquo;{contact.note}&rdquo;
							</p>
						)}

						{/* View Full Profile link for linked contacts */}
						{isLinked && profile.slug && (
							<Link
								href={`/p/${profile.slug}`}
								className='block text-center text-sm font-medium text-blue-400 hover:text-blue-300 transition py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20'
							>
								View Full Profile
							</Link>
						)}

						{/* Actions */}
						<div className='flex justify-between pt-4'>
							<Button
								variant='ghost'
								className='text-white'
								onClick={onClose}
							>
								Close
							</Button>

							<Button
								variant='destructive'
								onClick={handleDelete}
								disabled={deleting}
							>
								{deleting ? 'Deleting...' : 'Delete'}
							</Button>
						</div>
					</>
				}
			</div>
		</div>
	);
}
