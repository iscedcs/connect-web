'use client';

import Link from 'next/link';
import {
	ArrowLeft,
	ScanLine,
	ChevronDown,
	Loader2,
	CheckCircle2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormField,
	FormItem,
	FormControl,
	FormMessage,
	FormLabel,
} from '@/components/ui/form';
import { bvnSchema, type BvnInput } from '@/schemas/bvn';
import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { csrfFetch } from '@/lib/csrf-client';

interface Bank {
	name: string;
	code: string;
	slug: string;
}

// helper: format "XXXXXXXXXXX" -> "XXXX-XXXX-XXX"
function formatBVN(digits: string) {
	const d = digits.slice(0, 11);
	const a = d.slice(0, 4);
	const b = d.slice(4, 8);
	const c = d.slice(8, 11);
	return [a, b, c].filter(Boolean).join('-');
}

export default function BvnScreen({
	backHref = '/',
	onContinue,
	onScan,
}: {
	backHref?: string;
	onContinue?: (data: {
		bvn: string;
		accountNumber: string;
		bankCode: string;
	}) => Promise<void> | void;
	onScan?: () => void;
}) {
	const form = useForm<BvnInput>({
		resolver: zodResolver(bvnSchema),
		defaultValues: { bvn: '', accountNumber: '', bankCode: '' },
		mode: 'onChange',
	});

	const [displayBVN, setDisplayBVN] = useState('');

	// Bank list
	const [banks, setBanks] = useState<Bank[]>([]);
	const [banksLoading, setBanksLoading] = useState(true);
	const [bankSearch, setBankSearch] = useState('');
	const [showBankDropdown, setShowBankDropdown] = useState(false);
	const [selectedBankName, setSelectedBankName] = useState('');
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Account resolution
	const [resolvedName, setResolvedName] = useState<string | null>(null);
	const [resolving, setResolving] = useState(false);
	const resolveTimerRef = useRef<ReturnType<typeof setTimeout>>();

	// Fetch banks on mount
	useEffect(() => {
		(async () => {
			try {
				const res = await fetch('/api/wallet/banks');
				const json = await res.json();
				setBanks(json?.data ?? []);
			} catch {
				// silent
			} finally {
				setBanksLoading(false);
			}
		})();
	}, []);

	// Close bank dropdown on outside click
	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (
				dropdownRef.current &&
			) {
				setShowBankDropdown(false);
			}
		}
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, []);

	const resolveAccount = useCallback(
		async (acctNum: string, bCode: string) => {
				setResolvedName(null);
				return;
			}
			setResolving(true);
			try {
				const params = new URLSearchParams({
					account_number: acctNum,
					bank_code: bCode,
				});
				const res = await csrfFetch(
					`/api/wallet/resolve-account?${params}`,
				);
				const json = await res.json();
				if (json?.success && json?.data?.accountName) {
					setResolvedName(json.data.accountName);
				} else {
					setResolvedName(null);
				}
			} catch {
				setResolvedName(null);
			} finally {
				setResolving(false);
			}
		},
		[],
	);

	const handleBvnInput = (raw: string) => {
		const digits = raw.replace(/\D/g, '').slice(0, 11);
		setDisplayBVN(formatBVN(digits));
		form.setValue('bvn', digits, { shouldValidate: true });
	};

	const handleAccountInput = (raw: string) => {
		const digits = raw.replace(/\D/g, '').slice(0, 10);
		form.setValue('accountNumber', digits, { shouldValidate: true });

		setResolvedName(null);
		clearTimeout(resolveTimerRef.current);
		if (digits.length === 10) {
			const bCode = form.getValues('bankCode');
			if (bCode) {
				resolveTimerRef.current = setTimeout(
					() => resolveAccount(digits, bCode),
					500,
				);
			}
		}
	};

	const handleBankSelect = (bank: Bank) => {
		form.setValue('bankCode', bank.code, { shouldValidate: true });
		setSelectedBankName(bank.name);
		setShowBankDropdown(false);
		setBankSearch('');

		const acctNum = form.getValues('accountNumber');
		setResolvedName(null);
		if (acctNum.length === 10) {
			resolveAccount(acctNum, bank.code);
		}
	};

	const filteredBanks = bankSearch
		? banks.filter((b) =>
				b.name.toLowerCase().includes(bankSearch.toLowerCase()),
			)
		: banks;

	const accountNumber = form.watch('accountNumber');
	const bankCode = form.watch('bankCode');
	const isValid =
		form.formState.isValid &&
		displayBVN.replace(/\D/g, '').length === 11 &&
		accountNumber.length === 10 &&
		bankCode.length > 0;

	return (
		<div className='min-h-screen bg-black text-white flex flex-col'>
			{/* top bar */}
			<div className='mx-auto w-full max-w-screen-sm px-4 pt-3'>
				<Link
					href={backHref}
					className='inline-block text-xl text-white/90'
				>
					<ArrowLeft />
				</Link>
			</div>

			{/* body */}
			<div className='mx-auto w-full max-w-screen-sm px-4 mt-3'>
				<div className='flex items-center gap-2 mb-4'>
					<button
						type='button'
						onClick={onScan}
						className='p-1 rounded-md hover:bg-white/10'
						aria-label='Scan BVN'
					>
						<ScanLine className='w-5 h-5' />
					</button>
					<h1 className='text-2xl font-semibold'>Verify Your Identity</h1>
				</div>

				<p className='text-white/60 text-sm mb-6'>
					We need your BVN and bank account details to activate your wallet.
				</p>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(async (data) => {
							await onContinue?.({
								bvn: data.bvn,
								accountNumber: data.accountNumber,
								bankCode: data.bankCode,
							});
						})}
						className='space-y-6'
					>
						{/* BVN */}
						<FormField
							control={form.control}
							name='bvn'
							render={() => (
								<FormItem>
									<FormLabel className='text-white/70 text-sm'>
										BVN (Bank Verification Number)
									</FormLabel>
									<FormControl>
										<input
											inputMode='numeric'
											autoComplete='one-time-code'
											value={displayBVN}
											onChange={(e) => handleBvnInput(e.target.value)}
											placeholder='0192-3848-233'
											className={cn(
												'w-full bg-transparent text-base outline-none',
												'border-b border-white/20 focus:border-white transition-colors',
												'pb-2 placeholder-white/40',
											)}
										/>
									</FormControl>
									<FormMessage className='mt-1' />
								</FormItem>
							)}
						/>

						{/* Bank Selector */}
						<FormField
							control={form.control}
							name='bankCode'
							render={() => (
								<FormItem>
									<FormLabel className='text-white/70 text-sm'>
										Bank
									</FormLabel>
									<div className='relative' ref={dropdownRef}>
										<button
											type='button'
											className={cn(
												'w-full flex items-center justify-between',
												'bg-transparent text-base outline-none',
												'border-b border-white/20 focus:border-white transition-colors',
												'pb-2 text-left',
											)}
										>
											<span className='truncate'>
												{banksLoading
													? 'Loading banks...'
													: selectedBankName || 'Select your bank'}
											</span>
											{banksLoading ? (
												<Loader2 className='w-4 h-4 animate-spin shrink-0' />
											) : (
												<ChevronDown
													className={cn(
														'w-4 h-4 transition-transform shrink-0',
														showBankDropdown && 'rotate-180',
													)}
												/>
											)}
										</button>

										{showBankDropdown && (
											<div className='absolute z-50 mt-1 w-full bg-zinc-900 border border-white/10 rounded-lg shadow-xl max-h-60 overflow-hidden'>
												<div className='p-2 border-b border-white/10'>
													<input
														type='text'
														value={bankSearch}
														onChange={(e) => setBankSearch(e.target.value)}
														placeholder='Search banks...'
														className='w-full bg-zinc-800 text-sm text-white rounded-md px-3 py-2 outline-none placeholder-white/40'
														autoFocus
													/>
												</div>
												<div className='overflow-y-auto max-h-48'>
													{filteredBanks.length === 0 ? (
														<div className='px-3 py-4 text-sm text-white/40 text-center'>
															No banks found
														</div>
													) : (
														filteredBanks.map((bank) => (
															<button
																key={bank.code}
																type='button'
																onClick={() => handleBankSelect(bank)}
																className={cn(
																	'w-full text-left px-3 py-2.5 text-sm hover:bg-white/10 transition-colors',
																	bankCode === bank.code && 'bg-white/5 text-white font-medium',
																)}
															>
																{bank.name}
															</button>
														))
													)}
												</div>
											</div>
										)}
									</div>
									<FormMessage className='mt-1' />
								</FormItem>
							)}
						/>

						{/* Account Number */}
						<FormField
							control={form.control}
							name='accountNumber'
							render={() => (
								<FormItem>
									<FormLabel className='text-white/70 text-sm'>
										Account Number
									</FormLabel>
									<FormControl>
										<input
											inputMode='numeric'
											value={accountNumber}
											onChange={(e) => handleAccountInput(e.target.value)}
											placeholder='0123456789'
											className={cn(
												'w-full bg-transparent text-base outline-none',
												'border-b border-white/20 focus:border-white transition-colors',
												'pb-2 placeholder-white/40',
											)}
										/>
									</FormControl>
									<FormMessage className='mt-1' />

									{/* Account name resolution feedback */}
									{resolving && (
										<div className='flex items-center gap-2 mt-2 text-sm text-white/50'>
											<Loader2 className='w-3.5 h-3.5 animate-spin' />
											<span>Verifying account...</span>
										</div>
									)}
										<div className='flex items-center gap-2 mt-2 text-sm text-green-400'>
											<CheckCircle2 className='w-3.5 h-3.5' />
											<span>{resolvedName}</span>
										</div>
									)}
								</FormItem>
							)}
						/>

						{/* Spacer + submit */}
						<div className='h-[20vh]' />

						<div className='pb-6'>
							<Button
								type='submit'
								className={cn(
									'w-full rounded-2xl py-3 text-base font-medium shadow-sm',
									isValid
										? 'bg-white text-black'
										: 'bg-white/30 text-black/60',
								)}
							>
								{form.formState.isSubmitting ? (
									<>
										<Loader2 className='w-4 h-4 mr-2 animate-spin' />
										Submitting...
									</>
								) : (
									'Continue'
								)}
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
}
