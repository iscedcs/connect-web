'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { FieldRenderer } from '../inline-renderers/public-form-renderer';

export default function PublicFormClient({ profile, form }: any) {
	const [values, setValues] = useState<Record<string, any>>({});
	const [submitting, setSubmitting] = useState(false);

	function handleChange(name: string, value: any) {
		setValues((v) => ({ ...v, [name]: value }));
	}

	async function handleSubmit() {
		for (const field of form.fields) {
			if (field.required && !values[field.name]) {
				toast.error(`${field.label} is required`);
				return;
			}
		}

		setSubmitting(true);

		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_CONNECT_API_URL}/api/profiles/${form.profileId}/forms/submit/public/${form.id}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						answers: values,
					}),
				},
			);

			const json = await res.json();

			if (!res.ok) {
				toast.error(json?.message ?? 'Submission failed');
				return;
			}

			toast.success('Form submitted successfully 🎉');

			setValues({});
		} catch (err) {
			toast.error('Network error. Please try again.');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<main className='min-h-screen bg-black text-white'>
			<div className='mx-auto w-full max-w-screen-sm px-4 pb-16 pt-6'>
				{/* Profile context */}
				<div className='mb-6 rounded-2xl border border-white/10 bg-white/5 p-4'>
					<div className='flex items-center gap-3'>
						<div className='h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-white/10'>
							{profile.profilePhoto ?
								<img
									src={profile.profilePhoto}
									className='h-full w-full object-cover'
									alt={profile.name ?? 'Profile photo'}
								/>
							:	null}
						</div>
						<div className='min-w-0'>
							<p className='font-semibold truncate'>
								{profile.name}
							</p>
							<p className='text-xs text-white/50 truncate'>
								{profile.position || 'Contact form'}
							</p>
						</div>
						<span className='ml-auto rounded-full border border-white/10 bg-white/10 px-2 py-1 text-2.5 uppercase tracking-wider text-white/60'>
							Public Form
						</span>
					</div>
				</div>

				{/* Form card */}
				<div className='rounded-3xl border border-white/10 bg-neutral-950/80 p-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)]'>
					<div className='mb-5'>
						<p className='text-xs uppercase tracking-wider text-white/40'>
							{form.category || 'Form'}
						</p>
						<h1 className='mt-2 text-2xl font-semibold leading-tight'>
							{form.title}
						</h1>
						{form.description && (
							<p className='mt-2 text-sm text-white/60'>
								{form.description}
							</p>
						)}
					</div>

					{/* Fields */}
					<div className='space-y-4'>
						{form.fields.map((field: any) => (
							<div
								key={field.id}
								className='rounded-2xl border border-white/10 bg-white/5 p-3'
							>
								<FieldRenderer
									field={field}
									value={values[field.name]}
									onChange={handleChange}
								/>
							</div>
						))}
					</div>

					<Button
						className='mt-6 h-12 w-full rounded-2xl text-base font-semibold'
						onClick={handleSubmit}
						disabled={submitting}
					>
						{submitting ? 'Submitting...' : 'Submit'}
					</Button>
				</div>
			</div>
		</main>
	);
}
