import PublicProfileTabs from '@/components/customer/public-profile-tabs';
import ShareQrDialog from '@/components/customer/share-qr-dialog';
import EmailDialog from '@/components/customer/email-dialog';
import ScanRecorder from '@/components/customer/scan-recorder';
import SendMoneyButton from '@/components/customer/send-money-button';
import ArtisanProfileSection from '@/components/customer/artisan-profile-section';
import { PhoneIcon } from '@/lib/icons';
import { fetchPublicUserEvent } from '@/lib/services/events';
import { fetchPublicProfileBySlug } from '@/lib/services/public-profile';
import { getPublicWalletProfile } from '@/lib/services/wallet';
import { getArtisanPublicReviews } from '@/lib/services/artisan';
import { getPlatformInfo } from '@/lib/connect-social/detect-platform';
import { ICONS, COVER_PHOTOS } from '@/lib/const';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

/** Deterministic hash from string */
function hashCode(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash);
}

function ProfileNotFoundState() {
	return (
		<main className='min-h-screen flex items-center justify-center bg-black text-white px-5'>
			<div className='w-full max-w-xl rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8 text-center'>
				<div className='mx-auto mb-4 w-14 h-14 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-2xl font-semibold'>
					!
				</div>
				<h1 className='text-xl md:text-2xl font-semibold'>
					Profile not found
				</h1>
				<p className='text-sm text-white/70 mt-2 leading-relaxed'>
					The profile you&apos;re looking for doesn&apos;t exist or
					may have been removed.
				</p>
				<div className='mt-6 flex items-center justify-center gap-3 flex-wrap'>
					<Link
						href='/'
						className='px-5 py-2.5 bg-white text-black rounded-full text-sm font-medium'
					>
						Back to Home
					</Link>
				</div>
			</div>
		</main>
	);
}

/** DYNAMIC METADATA */
export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const profileLookup = await fetchPublicProfileBySlug(slug);
	const profileData = profileLookup.data;

	if (!profileData) {
		return {
			title: 'Profile Not Found | Connect',
			robots: { index: false, follow: false },
		};
	}

	const { profile } = profileData;
	const title = `${profile.name} | Connect`;
	const description =
		profile.bio ||
		`${profile.name}${profile.position ? ` - ${profile.position}` : ''}. Connect with me on ISCE Connect.`;
	const fallbackCover = COVER_PHOTOS[hashCode(slug) % COVER_PHOTOS.length];
	const ogImage =
		profile.coverPhoto?.startsWith('http') ? profile.coverPhoto
		: profile.profilePhoto?.startsWith('http') ? profile.profilePhoto
		: fallbackCover;

	return {
		title,
		description,
		robots: { index: true, follow: true },
		openGraph: {
			title,
			description,
			type: 'profile',
			images: ogImage ? [{ url: ogImage }] : undefined,
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: ogImage ? [ogImage] : undefined,
		},
	};
}

/** BUILD UNIFIED CONNECT LIST */
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

	data.socials?.forEach((s: any) => {
		if (s.platform?.toLowerCase() === 'email' || s.icon === 'email') return;
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
			icon: ICONS.bitcoin,
		}),
	);

	return list;
}

/** MAIN PAGE */
export default async function SlugProfilePage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ scan?: string }>;
}) {
	const { slug } = await params;
	const { scan } = await searchParams;
	const isScan = scan === '1';
	const profileLookup = await fetchPublicProfileBySlug(slug);
	const profileData = profileLookup.data;

	if (!profileData) return <ProfileNotFoundState />;

	const { profile, contact } = profileData;

	const userId = profile?.userId;
	const artisan = profileData.artisan ?? null;

	const [events, walletProfile, artisanReviewsData] = await Promise.all([
		fetchPublicUserEvent(userId),
		getPublicWalletProfile(userId ?? ''),
		artisan ?
			getArtisanPublicReviews(artisan.id, 1, 10)
		:	Promise.resolve({ reviews: [], total: 0, page: 1, totalPages: 0 }),
	]);

	// Extract emails from socials
	const emailItems = (profileData.socials || []).filter(
		(s: any) => s.platform?.toLowerCase() === 'email' || s.icon === 'email',
	);

	const connectItems = buildConnectList(profileData);
	const canShowEventsTab = events && events.length > 0;

	const fallbackCover = COVER_PHOTOS[hashCode(slug) % COVER_PHOTOS.length];

	return (
		<main className='min-h-screen bg-black text-white pb-16'>
			{isScan && <ScanRecorder slug={slug} />}
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
						unoptimized
						className='w-full h-44 md:h-64 object-cover'
					/>
				</div>

				<div className='px-4 -mt-14 md:-mt-20 flex items-end gap-3 z-10 relative'>
					<Image
						src={profile.profilePhoto}
						height={80}
						width={80}
						alt='Profile Photo'
						unoptimized
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
							<span className='text-2.5 uppercase tracking-wider text-white/50'>
								Bio
							</span>
						</div>

						<p className='max-w-md text-xs leading-relaxed text-white/70'>
							{profile.bio}
						</p>
					</div>
				)}

				<div className='px-4 mt-4 flex items-center font-medium gap-3 flex-wrap'>
					<Link
						href={`/p/${slug}/save-contact?download=1`}
						className='px-5 py-2 bg-white/5 border border-[#868686] rounded-full text-xs'
					>
						Save Contact
					</Link>
					{walletProfile?.canReceive && userId && (
						<SendMoneyButton
							recipientUserId={userId}
							recipientName={profile.name}
							recipientPhoto={profile.profilePhoto}
							recipientPosition={profile.position}
							wallet={walletProfile}
						/>
					)}

					<div className='flex items-center gap-2 text-xl ml-auto'>
						<ShareQrDialog
							profileId={slug}
							profile={profile}
							contact={contact}
							links={profileData?.links ?? []}
							socials={profileData?.socials ?? []}
							slugMode
						/>
						<EmailDialog emails={emailItems} />
						{contact?.primary?.phone_number && (
							<a
								href={`tel:${contact.primary.phone_number}`}
								title='phone'
								className='h-9 w-9 rounded-full border border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition inline-flex items-center justify-center'
							>
								<PhoneIcon />
							</a>
						)}
					</div>
				</div>
			</section>

			{artisan && (
				<ArtisanProfileSection
					artisan={artisan}
					reviews={artisanReviewsData.reviews}
					profileName={profile.name}
				/>
			)}

			<PublicProfileTabs
				connectItems={connectItems}
				events={events!}
				id={slug}
				canShowEventsTab={canShowEventsTab}
				basePath='/p'
			/>
		</main>
	);
}
