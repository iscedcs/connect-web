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
import { ArrowLeft, Check, Loader2, ShoppingCart, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import OtpCodeField from './otp-code-field';

type OtpState = 'idle' | 'success' | 'error' | 'resending';

export default function OtpScreen({
	state = 'idle',
	onBackHref = '/',
	onVerify,
	onVerified,
	enableCreateAfterSuccess,
	onCreateDevice,
	paymentStatus,
	tokenError,
	paymentLoading,
	onRequestCode,
	paymentError,
}: {
	state?: OtpState;
	onBackHref?: string;
	onVerify?: (code: string) => Promise<'success' | 'error'> | void;
	onVerified?: (token: string) => void;
	enableCreateAfterSuccess?: boolean;
	onCreateDevice?: (
		token: string,
	) => Promise<{ ok: boolean; message?: string }>;
	cardId?: string;
	deviceType?: string;
	userId?: string;
	/** Payment redirect result ("success" | "failed" | "error" | null) */
	paymentStatus?: string | null;
	/** Whether request-token failed after successful payment */
	tokenError?: boolean;
	/** Whether a payment initialization is loading */
	paymentLoading?: boolean;
	/** Initiate Paystack payment to request a new code */
	onRequestCode?: () => void;
	/** Payment initialization error message */
	paymentError?: string | null;
}) {
	const [lastCode, setLastCode] = useState('');

	const form = useForm<OtpInput>({
		resolver: zodResolver(otpSchema),
		defaultValues: { code: '' },
		mode: 'onChange',
	});

	const isVerifying = form.formState.isSubmitting;
	const code = form.watch('code');

	useEffect(() => {
		if (!onVerify) return;
		if (isVerifying) return;
		if (!code || code.length !== 6) return;

		(async () => {
			const valid = await form.trigger('code');
			if (!valid) return;

			const result = await onVerify(code);
			if (result === 'success') {
				setLastCode(code);
				onVerified?.(code);
			}
		})();
	}, [code, isVerifying, onVerify, onVerified, form]);

	return (
		<div className='h-[100svh] bg-black text-white flex flex-col'>
			{/* Banner */}
			<div className='w-full bg-white/10 text-xs backdrop-blur'>
				<div className='mx-auto max-w-screen-sm px-3 py-2 flex items-center gap-2'>
					<span></span>
					{paymentStatus === 'success' && !tokenError && (
						<span className='text-green-400'>
							Payment successful! A code has been sent to your
							email.
						</span>
					)}
					{paymentStatus === 'success' && tokenError && (
						<span className='text-yellow-400'>
							Payment received but code delivery failed. Please
							contact support.
						</span>
					)}
					{paymentStatus === 'failed' && (
						<span className='text-red-400'>
							Payment was not completed. Please try again.
						</span>
					)}
					{paymentStatus === 'error' && (
						<span className='text-red-400'>
							Something went wrong with the payment. Please try
							again.
						</span>
					)}
					{!paymentStatus && (
						<>
							<span>{`Don't have your code?`}</span>
							<button
								type='button'
								onClick={() => onRequestCode?.()}
								disabled={paymentLoading}
								className='underline flex items-center gap-1 disabled:opacity-50'
							>
								{paymentLoading ?
									<>
										<Loader2 className='w-3 h-3 animate-spin' />
										Processing...
									</>
								:	<>
										<ShoppingCart className='w-3 h-3' />
										Purchase one
									</>
								}
							</button>
						</>
					)}
					<div className='ml-auto'>
						{paymentLoading && (
							<Loader2 className='w-4 h-4 animate-spin' />
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

			<div className='mx-auto w-full max-w-screen-sm px-4'>
				<h1 className='text-2xl font-semibold'>Enter Token</h1>
				<p className='text-xs text-white/70 mt-1'>
					If you purchased a device, you should have a token that was
					sent to your email.
				</p>

				<Form {...form}>
					<form
						className='mt-4'
						onSubmit={(e) => e.preventDefault()}
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
					</form>
				</Form>
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
							OTP is wrong, kindly confirm the code you entered.
						</span>
					</div>
				)}
				{paymentError && (
					<div className='mt-3 text-xs text-red-400 flex items-center gap-2'>
						<X className='w-3.5 h-3.5' />
						<span>{paymentError}</span>
					</div>
				)}

				{/* Request new code section */}
				{!paymentStatus && (
					<div className='mt-8 pt-6 border-t border-white/10'>
						<p className='text-xs text-white/60 mb-3'>
							{`Don't have a code? Purchase one to get a verification token sent to your email.`}
						</p>
						<button
							type='button'
							onClick={() => onRequestCode?.()}
							disabled={paymentLoading}
							className='w-full py-3 px-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50'
						>
							{paymentLoading ?
								<>
									<Loader2 className='w-4 h-4 animate-spin' />
									Initializing payment...
								</>
							:	<>
									<ShoppingCart className='w-4 h-4' />
									Request New Code — ₦25,000
								</>
							}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
