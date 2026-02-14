'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ToggleIcon, EditIcon, DeleteIcon } from '@/lib/icons';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { URLS } from '@/lib/const';

export default function FormCard({
	form,
	profileId,
	accessToken,
	onUpdated,
	showRestore,
	selectionMode,
	selected,
	toggleSelect,
	setFormToEdit,
	openModal,
}: {
	form: any;
	profileId: string;
	accessToken: string;
	onUpdated: () => Promise<void>;
	showRestore?: boolean;
	selected?: boolean;
	setFormToEdit?: any;
	openModal?: any;
	toggleSelect?: (id: string) => void;
	selectionMode?: boolean;
}) {
	const [visible, setVisible] = useState(form.is_visible);
	const [isRestoring, setRestoring] = useState(false);
	const [loading, setLoading] = useState(false);

	const longPressTimeout = useRef<any>(null);
	const longPressed = useRef(false);

	const LONG_PRESS_DURATION = 700; //ms

	const startLongPress = () => {
		if (!toggleSelect) return;

		longPressed.current = false;

		longPressTimeout.current = setTimeout(() => {
			longPressed.current = true;
			toggleSelect(form.id);
		}, LONG_PRESS_DURATION);
	};

	const cancelLongPress = () => {
		clearTimeout(longPressTimeout.current);
	};

	const handleCardClick = () => {
		cancelLongPress();

		// A long press already triggered selection
		if (longPressed.current) return;

		// Already in selection mode → toggle
		if (selectionMode && toggleSelect) {
			toggleSelect(form.id);
			return;
		}
	};

	const handleMouseDown = () => startLongPress();
	const handleMouseUp = () => cancelLongPress();
	const handleMouseLeave = () => cancelLongPress();

	const handleTouchStart = () => startLongPress();
	const handleTouchEnd = () => cancelLongPress();

	const patch = async (endpoint: string, msg: string, body: any = {}) => {
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_CONNECT_API_URL}${endpoint}`,
				{
					method: 'PATCH',
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(body),
				},
			);

			const json = await res.json();

			if (!res.ok) return toast.error(json?.message ?? 'Error');

			toast.success(msg);
			await onUpdated();
		} catch (e) {
			toast.error('Error occurred');
		}
	};

	const handleToggleVisible = async () => {
		const newValue = !visible;
		setVisible(newValue);

		await patch(
			URLS.forms.visible
				.replace('{profileId}', profileId)
				.replace('{id}', form.id),
			newValue ? 'Visible' : 'Hidden',
			{ is_visible: newValue },
		);
	};

	const handleDelete = async () => {
		setLoading(true);
		try {
			const res = await fetch(
				`${
					process.env.NEXT_PUBLIC_CONNECT_API_URL
				}${URLS.forms.delete
					.replace('{profileId}', profileId)
					.replace('{id}', form.id)}`,
				{
					method: 'PATCH',
					headers: { Authorization: `Bearer ${accessToken}` },
				},
			);
			const json = await res.json();
			if (res.ok) {
				toast.success('Form deleted');
				await onUpdated();
			} else toast.error(json?.message ?? 'Failed to delete');
		} catch {
			toast.error('Error deleting form');
		} finally {
			setLoading(false);
		}
	};
	const handleRestore = async () => {
		setRestoring(true);

		await patch(
			URLS.forms.restore
				.replace('{profileId}', profileId)
				.replace('{id}', form.id),
			'Form restored',
		);

		setRestoring(false);
	};

	return (
		<div
			onClick={handleCardClick}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseLeave}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			className={`bg-neutral-900/60 border border-white/10 rounded-xl p-4 flex justify-between items-center hover:bg-neutral-900 hover:border-white/20 hover:shadow-lg transition-all  ${
				selected ?
					'ring-2 ring-primary scale-[0.99]'
				:	'hover:bg-neutral-800/50'
			}
      `}
		>
			{selectionMode && (
				<div className='absolute top-3 left-3 w-5 h-5 border border-white/40 rounded bg-black/40 flex items-center justify-center'>
					{selected && (
						<div className='w-3 h-3 bg-primary rounded-sm'></div>
					)}
				</div>
			)}

			{/* LEFT */}

			<div className='flex-1 min-w-0'>
				<p className='text-sm font-semibold truncate'>{form.title}</p>

				<div className='flex items-center gap-2 mt-1 text-xs'>
					<span
						className={`px-2 py-0.5 rounded-full text-2.5 ${
							form.status === 'ACTIVE' ?
								'bg-emerald-500/20 text-emerald-300'
							:	'bg-white/10 text-white/60'
						}`}
					>
						{form.status}
					</span>

					<span className='text-white/40'>
						{new Date(form.createdAt).toLocaleDateString()}
					</span>
				</div>

				{selected && (
					<p className='text-2.5 text-primary mt-1 animate-fadeIn'>
						Selected
					</p>
				)}
			</div>

			{/* RIGHT ACTIONS */}
			{!showRestore && !selectionMode && (
				<div className='flex items-center gap-2 ml-auto'>
					<ToggleIcon
						checked={visible}
						onCheckedChange={handleToggleVisible}
					/>

					<Button
						variant='ghost'
						size='icon'
						onClick={() => {
							setFormToEdit(form);
							openModal();
						}}
					>
						<EditIcon className='w-4 h-4 text-white/70' />
					</Button>

					<Button
						variant='ghost'
						size='icon'
						onClick={handleDelete}
					>
						{loading ?
							<Spinner className='w-4 h-4' />
						:	<DeleteIcon className='w-4 h-4 text-white/60' />}
					</Button>
				</div>
			)}

			{showRestore && (
				<Button
					size='sm'
					variant='secondary'
					onClick={handleRestore}
				>
					{isRestoring ?
						<Spinner />
					:	'Restore'}
				</Button>
			)}
		</div>
	);
}
