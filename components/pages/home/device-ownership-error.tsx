'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldAlert, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface DeviceOwnershipErrorProps {
	ownerName: string;
	ownerEmail: string;
	deviceProductId?: string;
	isSelf?: boolean;
}

export default function DeviceOwnershipError({
	ownerName,
	ownerEmail,
	deviceProductId,
	isSelf = false,
}: DeviceOwnershipErrorProps) {
	const deviceIdSuffix = deviceProductId?.slice(-5);
	if (isSelf) {
		return (
			<div className='h-[100svh] bg-black text-white flex flex-col'>
				<div className='flex items-center px-4 pt-6'>
					<Link
						href='/devices'
						className='p-2'
					>
						<ArrowLeft className='h-5 w-5' />
					</Link>
				</div>

				<div className='flex-1 flex flex-col items-center justify-center px-6 text-center'>
					<div className='w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-6'>
						<UserCheck className='h-8 w-8 text-blue-400' />
					</div>

					<h1 className='text-xl font-semibold mb-2'>
						Device Already Connected
					</h1>
					{deviceIdSuffix && (
						<p className='text-xs text-gray-500 font-mono mb-2'>
							Device ID: •••{deviceIdSuffix}
						</p>
					)}
					<p className='text-gray-400 text-sm leading-relaxed'>
						This device is already connected to your account. You
						can manage it from your devices page.
					</p>
				</div>

				<div className='px-4 pb-6'>
					<Link href='/devices'>
						<Button className='w-full rounded-2xl bg-white text-black py-6 text-base font-medium shadow-sm active:translate-y-px'>
							Go to My Devices
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='h-[100svh] bg-black text-white flex flex-col'>
			<div className='flex items-center px-4 pt-6'>
				<Link
					href='/'
					className='p-2'
				>
					<ArrowLeft className='h-5 w-5' />
				</Link>
			</div>

			<div className='flex-1 flex flex-col items-center justify-center px-6 text-center'>
				<div className='w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6'>
					<ShieldAlert className='h-8 w-8 text-red-400' />
				</div>

				<h1 className='text-xl font-semibold mb-2'>
					Device Already Assigned
				</h1>
				{deviceIdSuffix && (
					<p className='text-xs text-gray-500 font-mono mb-2'>
						Device ID: •••{deviceIdSuffix}
					</p>
				)}
				<p className='text-gray-400 text-sm leading-relaxed mb-6'>
					This device is already assigned to another user and cannot
					be connected to your account.
				</p>

				<div className='w-full bg-white/5 border border-white/10 rounded-xl p-4'>
					<p className='text-xs text-gray-500 uppercase tracking-wider mb-2'>
						Assigned to
					</p>
					<p className='text-base font-medium text-white'>
						{ownerName}
					</p>
					{ownerEmail && (
						<p className='text-sm text-gray-400 mt-1'>
							{ownerEmail}
						</p>
					)}
				</div>
			</div>

			<div className='px-4 pb-6'>
				<Link href='/'>
					<Button className='w-full rounded-2xl bg-white text-black py-6 text-base font-medium shadow-sm active:translate-y-px'>
						Go Back
					</Button>
				</Link>
			</div>
		</div>
	);
}
