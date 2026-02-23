'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SlideStep } from '@/components/ui/slide-step';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import type {
	ArtisanCategory,
	ArtisanRequirements,
	WorkingHoursEntry,
} from '@/lib/types/artisan';
import { BASE_URLS, URLS } from '@/lib/const';

type SetupStep = 'info' | 'categories' | 'hours' | 'review' | 'done';

const WEEKDAYS = [
	{ day: 1, label: 'Monday' },
	{ day: 2, label: 'Tuesday' },
	{ day: 3, label: 'Wednesday' },
	{ day: 4, label: 'Thursday' },
	{ day: 5, label: 'Friday' },
	{ day: 6, label: 'Saturday' },
	{ day: 0, label: 'Sunday' },
];

interface ArtisanSetupWizardProps {
	profileId: string;
	accessToken: string;
	categories: ArtisanCategory[];
	requirements: ArtisanRequirements | null;
}

export default function ArtisanSetupWizard({
	profileId,
	accessToken,
	categories,
	requirements,
}: ArtisanSetupWizardProps) {
	const router = useRouter();
	const [step, setStep] = useState<SetupStep>('info');
	const [submitting, setSubmitting] = useState(false);

	// Form state
	const [bio, setBio] = useState('');
	const [customCategory, setCustomCategory] = useState('');
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [workingHours, setWorkingHours] = useState<WorkingHoursEntry[]>(
		WEEKDAYS.slice(0, 5).map((w) => ({
			day: w.day,
			open: '09:00',
			close: '17:00',
			isOpen: true,
		})),
	);

	const toggleCategory = (id: string) => {
		setSelectedCategories((prev) =>
			prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
		);
	};

	const toggleDay = (dayNum: number) => {
		setWorkingHours((prev) => {
			const existing = prev.find((w) => w.day === dayNum);
			if (existing) {
				return prev.map((w) =>
					w.day === dayNum ? { ...w, isOpen: !w.isOpen } : w,
				);
			}
			return [
				...prev,
				{ day: dayNum, open: '09:00', close: '17:00', isOpen: true },
			];
		});
	};

	const updateDayTime = (
		dayNum: number,
		field: 'open' | 'close',
		value: string,
	) => {
		setWorkingHours((prev) =>
			prev.map((w) => (w.day === dayNum ? { ...w, [field]: value } : w)),
		);
	};

	const canProceedFromInfo = bio.trim().length >= 10;
	const canProceedFromCategories =
		selectedCategories.length >= 1 || customCategory.trim().length >= 2;

	const handleSubmit = async () => {
		if (!canProceedFromCategories || !termsAccepted) return;
		setSubmitting(true);

		try {
			const activeHours = workingHours.filter((w) => w.isOpen);

			const body = {
				profileId,
				bio: bio.trim() || undefined,
				customCategory: customCategory.trim() || undefined,
				categoryIds: selectedCategories,
				workingHours: activeHours.length > 0 ? activeHours : undefined,
				termsAccepted,
			};

			const res = await fetch(
				`${BASE_URLS.CONNECT_API}${URLS.artisan.register}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${accessToken}`,
					},
					body: JSON.stringify(body),
				},
			);

			const json = await res.json().catch(() => null);

			if (!res.ok) {
				toast.error(
					json?.message || 'Registration failed. Please try again.',
				);
				return;
			}

			toast.success('Artisan profile created!');
			setStep('done');
		} catch {
			toast.error('Network error. Please try again.');
		} finally {
			setSubmitting(false);
		}
	};

	// ─── Done Step ──────────────────────────────────────────

	if (step === 'done') {
		return (
			<div className='flex flex-col items-center justify-center py-20 gap-6 text-center'>
				<div className='bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center'>
					<CheckCircle2 className='size-8 text-emerald-400' />
				</div>
				<div>
					<h2 className='text-xl font-semibold'>
						You&apos;re All Set!
					</h2>
					<p className='text-sm text-white/60 mt-2 max-w-xs'>
						Your artisan profile has been created. It may need
						review before it appears in the directory.
					</p>
				</div>
				<Button
					onClick={() => router.push('/connect/artisan')}
					className='bg-purple-600 hover:bg-purple-700'
				>
					Go to Artisan Dashboard
					<ArrowRight className='ml-2 size-4' />
				</Button>
			</div>
		);
	}

	// ─── Step Indicator ─────────────────────────────────────

	const steps: SetupStep[] = ['info', 'categories', 'hours', 'review'];
	const currentIndex = steps.indexOf(step);
	const stepLabels = ['About You', 'Categories', 'Working Hours', 'Review'];

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-3'>
				{currentIndex > 0 && (
					<button
						title='back'
						type='button'
						onClick={() => setStep(steps[currentIndex - 1])}
						className='p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'
					>
						<ArrowLeft className='size-4' />
					</button>
				)}
				<div>
					<h1 className='text-xl font-semibold'>Become an Artisan</h1>
					<p className='text-xs text-white/50'>
						Step {currentIndex + 1} of {steps.length} —{' '}
						{stepLabels[currentIndex]}
					</p>
				</div>
			</div>

			{/* Progress bar */}
			<div className='flex gap-1.5'>
				{steps.map((s, i) => (
					<div
						key={s}
						className={`h-1 flex-1 rounded-full transition-colors ${
							i <= currentIndex ? 'bg-purple-500' : 'bg-white/10'
						}`}
					/>
				))}
			</div>

			{/* ─── Step 1: About You ───────────────────────────── */}
			<SlideStep show={step === 'info'}>
				<div className='space-y-5'>
					<div className='space-y-2'>
						<label className='text-sm text-white/70'>Bio *</label>
						<Textarea
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							placeholder='Tell people about your experience and skills...'
							maxLength={1000}
							rows={4}
							className='bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none'
						/>
						<p className='text-[10px] text-white/30'>
							At least 10 characters
						</p>
					</div>

					<Button
						onClick={() => setStep('categories')}
						disabled={!canProceedFromInfo}
						className='w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40'
					>
						Continue
						<ArrowRight className='ml-2 size-4' />
					</Button>
				</div>
			</SlideStep>

			{/* ─── Step 2: Categories ──────────────────────────── */}
			<SlideStep show={step === 'categories'}>
				<div className='space-y-5'>
					<p className='text-sm text-white/60'>
						Select the categories that describe your services.
					</p>

					{categories.length === 0 ?
						<p className='text-sm text-white/40'>
							No categories available. Please try again later.
						</p>
					:	<div className='grid grid-cols-2 gap-2'>
							{categories.map((cat) => {
								const isSelected = selectedCategories.includes(
									cat.id,
								);
								return (
									<button
										key={cat.id}
										type='button'
										onClick={() => toggleCategory(cat.id)}
										className={`p-3 rounded-xl text-left text-sm transition-colors border ${
											isSelected ?
												'bg-purple-500/20 border-purple-500/50 text-purple-300'
											:	'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
										}`}
									>
										<span className='block font-medium'>
											{cat.name}
										</span>
										{cat.description && (
											<span className='block text-[10px] text-white/40 mt-0.5 truncate'>
												{cat.description}
											</span>
										)}
									</button>
								);
							})}
						</div>
					}

					<div className='space-y-2'>
						<label className='text-sm text-white/70'>
							Custom Category (Optional)
						</label>
						<Input
							value={customCategory}
							onChange={(e) => setCustomCategory(e.target.value)}
							placeholder="If your specialty isn't listed above"
							maxLength={100}
							className='bg-white/5 border-white/10 text-white placeholder:text-white/30'
						/>
					</div>

					<Button
						onClick={() => setStep('hours')}
						disabled={!canProceedFromCategories}
						className='w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40'
					>
						Continue
						<ArrowRight className='ml-2 size-4' />
					</Button>
				</div>
			</SlideStep>

			{/* ─── Step 3: Working Hours ───────────────────────── */}
			<SlideStep show={step === 'hours'}>
				<div className='space-y-5'>
					<p className='text-sm text-white/60'>
						Set your availability (optional — you can change this
						later).
					</p>

					<div className='space-y-3'>
						{WEEKDAYS.map((wd) => {
							const entry = workingHours.find(
								(w) => w.day === wd.day,
							);
							const isActive = entry?.isOpen ?? false;
							return (
								<div
									key={wd.day}
									className='flex items-center gap-3'
								>
									<button
										type='button'
										onClick={() => toggleDay(wd.day)}
										className={`w-16 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
											isActive ?
												'bg-purple-500/20 border-purple-500/50 text-purple-300'
											:	'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
										}`}
									>
										{wd.label.slice(0, 3)}
									</button>
									{isActive && entry && (
										<>
											<Input
												type='time'
												value={entry.open}
												onChange={(e) =>
													updateDayTime(
														wd.day,
														'open',
														e.target.value,
													)
												}
												className='bg-white/5 border-white/10 text-white w-28'
											/>
											<span className='text-white/40 text-xs'>
												–
											</span>
											<Input
												type='time'
												value={entry.close}
												onChange={(e) =>
													updateDayTime(
														wd.day,
														'close',
														e.target.value,
													)
												}
												className='bg-white/5 border-white/10 text-white w-28'
											/>
										</>
									)}
								</div>
							);
						})}
					</div>

					<Button
						onClick={() => setStep('review')}
						className='w-full bg-purple-600 hover:bg-purple-700'
					>
						Review & Submit
						<ArrowRight className='ml-2 size-4' />
					</Button>
				</div>
			</SlideStep>

			{/* ─── Step 4: Review ──────────────────────────────── */}
			<SlideStep show={step === 'review'}>
				<div className='space-y-5'>
					<p className='text-sm text-white/60'>
						Review your information before submitting.
					</p>

					<div className='space-y-3'>
						{bio && (
							<ReviewRow
								label='Bio'
								value={
									bio.length > 80 ?
										bio.slice(0, 80) + '…'
									:	bio
								}
							/>
						)}
						{customCategory && (
							<ReviewRow
								label='Custom Category'
								value={customCategory}
							/>
						)}
						<ReviewRow
							label='Categories'
							value={
								categories
									.filter((c) =>
										selectedCategories.includes(c.id),
									)
									.map((c) => c.name)
									.join(', ') || '—'
							}
						/>
						<ReviewRow
							label='Working Hours'
							value={
								workingHours
									.filter((w) => w.isOpen)
									.map(
										(w) =>
											`${WEEKDAYS.find((d) => d.day === w.day)?.label.slice(0, 3)} ${w.open}–${w.close}`,
									)
									.join(', ') || 'Not set'
							}
						/>
					</div>

					{/* Terms acceptance */}
					<label className='flex items-start gap-3 cursor-pointer'>
						<input
							type='checkbox'
							checked={termsAccepted}
							onChange={(e) => setTermsAccepted(e.target.checked)}
							className='mt-1 rounded border-white/20'
						/>
						<span className='text-xs text-white/60'>
							I agree to the Artisan Terms of Service and
							understand that my profile will be reviewed before
							activation.
						</span>
					</label>

					<Button
						onClick={handleSubmit}
						disabled={submitting || !termsAccepted}
						className='w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60'
					>
						{submitting ?
							<>
								<Loader2 className='mr-2 size-4 animate-spin' />
								Creating…
							</>
						:	'Create Artisan Profile'}
					</Button>
				</div>
			</SlideStep>
		</div>
	);
}

function ReviewRow({ label, value }: { label: string; value: string }) {
	return (
		<div className='bg-white/5 rounded-xl p-3'>
			<p className='text-[10px] text-white/40 uppercase tracking-wider'>
				{label}
			</p>
			<p className='text-sm text-white mt-0.5'>{value}</p>
		</div>
	);
}
