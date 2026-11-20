const WALLET_WEB_URL =
	process.env.NEXT_PUBLIC_WALLET_WEB_URL || 'https://wallet.isce.app';

/**
 * A verified wallet can still be missing its account number, usually because
 * the profile has no phone number. Fiscus is the one place that fixes this.
 */
export default function AccountNumberNotice() {
	return (
		<div className='bg-black px-4 pt-4 text-white'>
			<div className='rounded-2xl border border-white/15 bg-white/5 p-4'>
				<p className='text-sm font-medium'>
					Your account number is not ready yet
				</p>
				<p className='mt-1 text-xs text-white/60'>
					Finish this on Fiscus. You may need to add your mobile
					number.
				</p>
				<a
					href={`${WALLET_WEB_URL}/settings/kyc`}
					className='mt-3 inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm text-white hover:bg-white/20'
				>
					Get your account number
				</a>
			</div>
		</div>
	);
}
