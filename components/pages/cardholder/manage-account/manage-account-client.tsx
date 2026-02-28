'use client';

import { useState } from 'react';
import { csrfFetch } from '@/lib/csrf-client';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';

const CONFIRMATION_TEXT = 'DELETE MY ACCOUNT';

export default function ManageAccountClient() {
	const [step, setStep] = useState<'info' | 'confirm' | 'deleting' | 'done'>(
		'info',
	);
	const [confirmInput, setConfirmInput] = useState('');
	const [error, setError] = useState<string | null>(null);

	const canDelete = confirmInput === CONFIRMATION_TEXT;

	async function handleDelete() {
		if (!canDelete) return;

		setStep('deleting');
		setError(null);

		try {
			const res = await csrfFetch('/api/auth/delete-account', {
				method: 'PATCH',
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(
					data.error || 'Failed to delete account. Please try again.',
				);
			}

			setStep('done');

			// Redirect to landing page after a short delay
			setTimeout(() => {
				window.location.href = '/';
			}, 3000);
		} catch (err) {
			setError(
				err instanceof Error ?
					err.message
				:	'Something went wrong. Please try again.',
			);
			setStep('confirm');
		}
	}

	if (step === 'done') {
		return (
			<div className='p-6 space-y-4 text-center'>
				<div className='h-16 w-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center'>
					<Trash2 className='h-8 w-8 text-red-400' />
				</div>
				<h2 className='text-xl font-semibold'>Account Deleted</h2>
				<p className='text-sm text-white/50'>
					Your account has been successfully deleted. You will be
					redirected shortly.
				</p>
			</div>
		);
	}

	return (
		<div className='p-6 space-y-6'>
			{/* Warning banner */}
			<div className='rounded-xl border border-red-500/30 bg-red-500/10 p-4'>
				<div className='flex items-start gap-3'>
					<AlertTriangle className='h-5 w-5 text-red-400 shrink-0 mt-0.5' />
					<div>
						<p className='text-sm font-semibold text-red-400'>
							Danger Zone
						</p>
						<p className='text-xs text-white/50 mt-1'>
							Deleting your account is permanent and cannot be
							undone. All your data, profiles, contacts, and
							settings will be permanently removed.
						</p>
					</div>
				</div>
			</div>

			{/* What happens section */}
			<div className='space-y-3'>
				<h2 className='text-sm font-semibold text-white/80'>
					What happens when you delete your account:
				</h2>
				<ul className='space-y-2 text-xs text-white/50'>
					<li className='flex items-start gap-2'>
						<span className='text-red-400 mt-0.5'>&#x2022;</span>
						Your profile and all associated data will be permanently
						deleted
					</li>
					<li className='flex items-start gap-2'>
						<span className='text-red-400 mt-0.5'>&#x2022;</span>
						All your social links, contacts, and files will be
						removed
					</li>
					<li className='flex items-start gap-2'>
						<span className='text-red-400 mt-0.5'>&#x2022;</span>
						Your NFC card and device bindings will be deactivated
					</li>
					<li className='flex items-start gap-2'>
						<span className='text-red-400 mt-0.5'>&#x2022;</span>
						You will be logged out immediately
					</li>
					<li className='flex items-start gap-2'>
						<span className='text-red-400 mt-0.5'>&#x2022;</span>
						This action cannot be reversed
					</li>
				</ul>
			</div>

			{step === 'info' && (
				<button
					onClick={() => setStep('confirm')}
					className='w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/20 transition'
				>
					I want to delete my account
				</button>
			)}

			{(step === 'confirm' || step === 'deleting') && (
				<div className='space-y-4'>
					<div className='space-y-2'>
						<label
							htmlFor='confirm-delete'
							className='text-xs text-white/60'
						>
							Type{' '}
							<span className='font-mono font-semibold text-red-400'>
								{CONFIRMATION_TEXT}
							</span>{' '}
							to confirm:
						</label>
						<input
							id='confirm-delete'
							type='text'
							value={confirmInput}
							onChange={(e) => setConfirmInput(e.target.value)}
							disabled={step === 'deleting'}
							placeholder={CONFIRMATION_TEXT}
							className='w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50 disabled:opacity-50'
							autoComplete='off'
						/>
					</div>

					{error && (
						<p className='text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2'>
							{error}
						</p>
					)}

					<div className='flex gap-3'>
						<button
							onClick={() => {
								setStep('info');
								setConfirmInput('');
								setError(null);
							}}
							disabled={step === 'deleting'}
							className='flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white/60 hover:bg-white/5 transition disabled:opacity-50'
						>
							Cancel
						</button>
						<button
							onClick={handleDelete}
							disabled={!canDelete || step === 'deleting'}
							className='flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
						>
							{step === 'deleting' ?
								<>
									<Loader2 className='h-4 w-4 animate-spin' />
									Deleting...
								</>
							:	'Delete Account'}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
