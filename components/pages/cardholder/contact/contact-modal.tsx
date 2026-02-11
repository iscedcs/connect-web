'use client';

import { useEffect, useState } from 'react';
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
						process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
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
					process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
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

	return (
		<div className='fixed inset-0 z-50 bg-black/80 flex items-center justify-center'>
			<div className='bg-neutral-900 border border-white/10 rounded-2xl p-6 w-[90%] max-w-md space-y-4'>
				{loading ?
					<ContactViewModalSkeleton />
				:	<>
						<div>
							<h2 className='text-xl text-white font-extrabold'>
								{contact?.firstName} {contact?.lastName}
							</h2>
							<p className='text-xs text-white/40'>
								Received{' '}
								{new Date(contact?.createdAt).toLocaleString()}
							</p>
						</div>

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

						{contact?.note && (
							<p className='text-sm italic text-white/60'>
								“{contact.note}”
							</p>
						)}

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
