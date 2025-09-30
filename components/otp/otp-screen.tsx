'use client';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { otpSchema, type OtpInput } from '@/schemas/otp';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import OtpCodeField from './otp-code-field';

type OtpState = 'idle' | 'success' | 'error' | 'resending';

export default function OtpScreen({
	state = 'idle',
	seconds = 60,
	onBackHref = '/',
	onResend,
	onVerify,
	cardId,
	deviceType,
}: {
	state?: OtpState;
	seconds?: number;
	onBackHref?: string;
	onResend?: () => Promise<void> | void;
	onVerify?: (code: string) => Promise<'success' | 'error'> | void;
	cardId?: string;
	deviceType?: string;
}) {
	const [timeLeft, setTimeLeft] = useState(seconds);

	const form = useForm<OtpInput>({
		resolver: zodResolver(otpSchema),
		defaultValues: { code: '' },
		mode: 'onChange',
	});

	useEffect(() => {
		if (state === 'resending') return;
		if (timeLeft <= 0) return;
		const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
		return () => clearInterval(t);
	}, [timeLeft, state]);

	const timeLabel = useMemo(() => {
		const m = Math.floor(timeLeft / 60)
			.toString()
			.padStart(2, '0');
		const s = (timeLeft % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	}, [timeLeft]);

	const isVerifying = form.formState.isSubmitting;

	return (
		<div className='min-h-screen bg-black text-white flex flex-col'>
			{/* Banner */}
			<div className='w-full bg-white/10 text-xs backdrop-blur'>
				<div className='mx-auto max-w-screen-sm px-3 py-2 flex items-center gap-2'>
					<span></span>
					{state === 'resending' ? (
						<span>Resending link now</span>
					) : (
						<>
							<span>Didn’t receive it?</span>
							<button
								onClick={async () => {
									if (onResend) await onResend();
								}}
								className='underline'
							>
								Click here to resend now
							</button>
						</>
					)}
					<div className='ml-auto'>
						{/* top-right spinner like the mock when resending */}
						{state === 'resending' && (
							<RefreshCw className='w-4 h-4 animate-spin' />
						)}
					</div>
				</div>
			</div>

			{/* Back */}
			<div className='mx-auto w-full max-w-screen-sm px-4 py-3'>
				<Link
					href={onBackHref}
					className='text-xl text-white/90'
				>
					<ArrowLeft />
				</Link>
			</div>

			{/* Body */}
			<div className='mx-auto w-full max-w-screen-sm px-4'>
				<h1 className='text-2xl font-semibold'>Enter OTP code</h1>
				<p className='text-xs text-white/70 mt-1'>
					If you have an account, you should receive an email shortly
					with a code to reset your password.
				</p>

				{/* Card Information */}
				{(cardId || deviceType) && (
					<div className='mt-4 p-3 bg-white/10 rounded-lg border border-white/20'>
						<h3 className='text-sm font-medium text-white mb-2'>
							Device Information
						</h3>
						{cardId && (
							<p className='text-xs text-white/80'>
								<span className='font-medium'>Card ID:</span>{' '}
								{cardId}
							</p>
						)}
						{deviceType && (
							<p className='text-xs text-white/80 mt-1'>
								<span className='font-medium'>
									Device Type:
								</span>{' '}
								{deviceType}
							</p>
						)}
					</div>
				)}

				{/* right-aligned timer + refresh icon */}
				<div className='mt-4 flex items-center justify-end gap-3'>
					<span className='text-xs'>{timeLabel}</span>
					<button
						aria-label='Refresh'
						onClick={() => setTimeLeft(seconds)}
						className='rounded-full p-1 hover:bg-white/10'
					>
						<RefreshCw className='w-4 h-4' />
					</button>
				</div>

				<Form {...form}>
					<form
						className='mt-4'
						onSubmit={form.handleSubmit(async (data) => {
							if (!onVerify) return;
							const result = await onVerify(data.code);
							if (result === 'success') {
								// parent controls screen switching
							}
						})}
					>
						<FormField
							control={form.control}
							name='code'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<OtpCodeField
											value={field.value}
											onChange={field.onChange}
											disabled={isVerifying}
										/>
									</FormControl>
									<FormMessage className='mt-2' />
								</FormItem>
							)}
						/>

						{/* feedback rows */}
						{state === 'success' && (
							<div className='mt-3 text-xs text-green-400 flex items-center gap-2'>
								<Check className='w-3.5 h-3.5' />
								<span>OTP is verified and correct</span>
							</div>
						)}
						{state === 'error' && (
							<div className='mt-3 text-xs text-red-400 flex items-center gap-2'>
								<X className='w-3.5 h-3.5' />
								<span>
									OTP is wrong, kindly confirm the code you
									entered.
								</span>
							</div>
						)}
					</form>
				</Form>
			</div>
		</div>
	);
}
