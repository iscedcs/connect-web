'use client';

import { CheckIcon } from '@/lib/icons';
import { fetchPublicProfile } from '@/lib/services/public-profile';
import { saveContactFlow } from '@/lib/services/save-contact';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SaveContactForm({ profileId }: { profileId: string }) {
	const router = useRouter();

	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [countryCode, setCountryCode] = useState('+234');

	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [note, setNote] = useState('');

	const [agree, setAgree] = useState(false);
	const [loading, setLoading] = useState(false);
	const [owner, setOwner] = useState<any>(null);
	const [realProfileId, setRealProfileId] = useState<string | null>(null);

	/** Fetch profile owner name */
	useEffect(() => {
		async function loadProfile() {
			const data = await fetchPublicProfile(profileId);
			if (!data?.profile?.id) return;

			setOwner(data.profile);
			setRealProfileId(data.profile.id);
		}
		loadProfile();
	}, [profileId]);

	async function submit() {
		if (!owner && !profileId) return;
		setLoading(true);

		const res = await saveContactFlow({
			profileId: realProfileId!,
			firstName,
			lastName,
			email,
			phone: `${countryCode}${phone}`,
			note,
		});

		setLoading(false);

		if (!res.success) {
			return toast.error(res.error);
		}

		toast.success(
			`You've successfully shared! your contact with ${owner.name}`,
		);
		router.back();
	}
	const canSubmit =
		firstName.trim() &&
		lastName.trim() &&
		email.trim() &&
		phone.trim() &&
		agree &&
		!loading;

	return (
		<div className='px-4 h-[100svh] flex flex-col justify-between text-white'>
			<div className=''>
				<div className='my-4'>
					<button
						title='back'
						onClick={() => router.back()}
						className='inline-flex items-center gap-2 bg-transparent hover:bg-transparent cursor-pointer text-white/90'
					>
						<ArrowLeft className='w-5 h-5' />
					</button>
				</div>
				<h2 className='text-xl font-extrabold'>
					{' '}
					Save {owner?.name ? `${owner.name}'s contact` : 'contact'}
				</h2>
				<input
					type='email'
					placeholder='Enter your email address'
					className='bg-transparent border-b border-white/20 w-full mt-6 py-2 text-[15px]'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<input
					type='text'
					placeholder='First name'
					className='bg-transparent border-b border-white/20 w-full mt-6 py-2 text-[15px]'
					value={firstName}
					onChange={(e) => setFirstName(e.target.value)}
				/>
				<input
					type='text'
					placeholder='Last name'
					className='bg-transparent border-b border-white/20 w-full mt-3 py-2 text-[15px]'
					value={lastName}
					onChange={(e) => setLastName(e.target.value)}
				/>
				<div className='flex items-center gap-3 mt-4'>
					<select
						title='country flag'
						value={countryCode}
						onChange={(e) => setCountryCode(e.target.value)}
						className='bg-transparent border-b border-white/20 py-2 text-[15px]'
					>
						<option value='+234'>🇳🇬 +234</option>
					</select>

					<input
						type='tel'
						placeholder='Phone number'
						className='flex-1 bg-transparent border-b border-white/20 py-2'
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
					/>
				</div>
				<input
					type='text'
					placeholder='leave a note (optional)'
					className='bg-transparent border-b border-white/20 w-full mt-4 py-2 text-[15px]'
					value={note}
					onChange={(e) => setNote(e.target.value)}
				/>
			</div>
			<div className='pb-6  space-y-2'>
				<label className='flex text-[#868686] items-center gap-2 text-xs mt-6'>
					<button
						type='button'
						onClick={() => setAgree(!agree)}
						className={`
    w-4 h-4 rounded-[6px] border
    flex items-center justify-center
    ${agree ? 'bg-white border-white' : ' bg-white border-white'}
  `}
					>
						{agree && <CheckIcon className='pointer-events-none' />}
					</button>
					I have read and understood the
					<span className='underline text-white'>
						terms & conditions
					</span>
				</label>
				<button
					disabled={!canSubmit}
					onClick={submit}
					className={`w-full py-3 rounded-xl text-black text-[15px] ${
						canSubmit ? 'bg-white' : (
							'bg-white/20 text-white/50 cursor-not-allowed'
						)
					}`}
				>
					{loading ? 'Saving...' : 'Save contact'}
				</button>
			</div>
		</div>
	);
}
