import PublicProfileTabs from '@/components/customer/public-profile-tabs';
import ShareQrDialog from '@/components/customer/share-qr-dialog';
import EmailDialog from '@/components/customer/email-dialog';
import { PhoneIcon } from '@/lib/icons';
import { fetchPublicUserEvent } from '@/lib/services/events';
import { fetchPublicProfile } from '@/lib/services/public-profile';
import { getPlatformInfo } from '@/lib/connect-social/detect-platform';
import { ICONS, COVER_PHOTOS } from '@/lib/const';
import Image from 'next/image';
import Link from 'next/link';

/** Deterministic hash from string - same input always gives same output */
function hashCode(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash);
}

/** ---------------------------------------
 * BUILD UNIFIED FIGMA CONNECT LIST
 -----------------------------------------*/
function buildConnectList(data: any) {
	const list: any[] = [];

	data.spotify?.forEach((item: any) =>
		list.push({
			id: item.id,
			title: item.title,
			url: item.url,
			icon: ICONS.spotify,
		}),
	);

	data.meetings?.forEach((m: any) =>
		list.push({
			id: m.id,
			title: 'Calendly',
			url: m.url,
			icon: ICONS.calendly,
		}),
	);

	data.videos?.forEach((v: any) =>
		list.push({
			id: v.id,
			title: v.title,
			url: v.url,
			icon: ICONS.youtube,
		}),
	);

	data.files?.forEach((f: any) =>
		list.push({
			id: f.id,
			title: f.title,
			url: f.url,
			icon: ICONS.file,
		}),
	);

	// Process socials with platform detection (exclude emails - they're shown separately)
	data.socials?.forEach((s: any) => {
		// Skip emails - they're displayed in the header
		if (s.platform?.toLowerCase() === 'email' || s.icon === 'email') {
			return;
		}
		const platformInfo = getPlatformInfo(s);
		list.push({
			id: s.id,
			title: platformInfo.displayName,
			url: platformInfo.actionUrl,
			icon: platformInfo.icon,
			platform: platformInfo.platform,
			username: s.username,
			originalPlatform: s.platform,
		});
	});

	data.links?.forEach((l: any) =>
		list.push({
			id: l.id,
			title: l.title,
			url: l.url,
			icon: ICONS.link,
		}),
	);

	data.forms?.forEach((f: any) =>
		list.push({
			id: f.id,
			title: f.title,
			url: f.url,
			icon: ICONS.google_forms,
		}),
	);
	data.appointments?.forEach((a: any) =>
		list.push({
			id: a.id,
			type: 'appointment',
			title: a.label || 'Book An Appointment With me',
			url: a.url,
			icon: ICONS.appointments,
		}),
	);

	data.wallets?.forEach((w: any) =>
		list.push({
			id: w.id,
			title: w.network || 'Crypto Wallet',
			url: w.address,
			icon: ICONS.crypto,
		}),
	);

	return list;
}

/** ---------------------------------------
 * MAIN PAGE
 -----------------------------------------*/
export default async function CustomerProfilePage({ params }: any) {
	const { id } = await params;
	const profileData = await fetchPublicProfile(id);

	const userId = profileData?.profile?.userId;
	const events = await fetchPublicUserEvent(userId);

	if (!profileData)
		return (
			<main className='min-h-screen flex items-center justify-center bg-black text-white'>
				<p>Profile not found.</p>
			</main>
		);

	const { profile, contact, device } = profileData;

	// Extract emails from socials
	const emailItems = (profileData.socials || []).filter(
		(s: any) => s.platform?.toLowerCase() === 'email' || s.icon === 'email',
	);

	// console.log("PUBLIC PROFILE USERID:", userId, events);

	const connectItems = buildConnectList(profileData);

	// Deterministic fallback cover based on profile ID
	const fallbackCover = COVER_PHOTOS[hashCode(id) % COVER_PHOTOS.length];

	return (
		<main className='min-h-screen bg-black text-white pb-16'>
			<section>
				<div className='w-full h-44 md:h-64 relative'>
					<div className='w-full h-44 md:h-64 bg-linear-180 from-black/0 via-black/30 to-black/100 absolute top-0 left-0 '></div>
					<Image
						src={
							profile.coverPhoto?.startsWith('http') ?
								profile.coverPhoto
							:	fallbackCover
						}
						height={176}
						width={1440}
						alt='Cover Photo'
						className='w-full h-44 md:h-64 object-cover'
					/>
				</div>

				<div className='px-4 -mt-14 md:-mt-20 flex items-end gap-3 z-10 relative'>
					<Image
						src={profile.profilePhoto}
						height={80}
						width={80}
						alt='Profile Photo'
						className='w-20 h-20 rounded-full border-4 border-black object-cover overflow-clip shrink-0'
					/>

					<div>
						<h1 className='text-3xl md:text-4xl font-extrabold leading-tight'>
							{profile.name}
						</h1>
						<p className='text-sm text-white/80 -mt-0.5'>
							{profile.position}
						</p>
					</div>
				</div>

				{profile.bio && (
					<div className='px-4 mt-4'>
						<div className='flex items-center gap-2 mb-1'>
							<span className='h-px w-6 bg-white/20' />
							<span className='text-[10px] uppercase tracking-wider text-white/50'>
								Bio
							</span>
						</div>

						<p className='max-w-md text-xs leading-relaxed text-white/70'>
							{profile.bio}
						</p>
					</div>
				)}

				<div className='px-4 mt-4 flex items-center font-medium gap-3 flex-wrap'>
					<button className='px-5 py-2 bg-white/5 border border-[#868686] rounded-full text-xs'>
						<Link href={`/customer/${id}/save-contact`}>
							Exchange Contact
						</Link>
					</button>
					{/* <button className="px-5 py-2 bg-white/5 border border-[#868686] rounded-full text-xs">
            <Link href="#">Save contact</Link>
          </button> */}

					<div className='flex items-center gap-2 text-xl ml-auto'>
						<ShareQrDialog
							profileId={id}
							profile={profile}
							contact={contact}
							links={profileData?.links ?? profile?.links ?? []}
							socials={
								profileData?.socials ?? profile?.socials ?? []
							}
						/>
						<EmailDialog emails={emailItems} />
						{contact?.primary?.phone_number && (
							<a
								href={`tel:${contact.primary.phone_number}`}
								title='phone'
							>
								<PhoneIcon />
							</a>
						)}
					</div>
				</div>
			</section>

			{/* TABS */}
			<PublicProfileTabs
				connectItems={connectItems}
				events={events!}
				id={id}
			/>
		</main>
	);
}
