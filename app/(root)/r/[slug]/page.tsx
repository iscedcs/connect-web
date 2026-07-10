import React from 'react';
import type { Metadata } from 'next';
import { fetchPublicProfileBySlug } from '@/lib/services/public-profile';
import ReferralInviteClient from '@/components/referral/referral-invite-client';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const cleanUsername = slug.replace(/^@/, '');
	const profileLookup = await fetchPublicProfileBySlug(cleanUsername);
	const profile = profileLookup?.data?.profile;

	const title = profile?.name
		? `Join ${profile.name} (@${cleanUsername}) on ISCE Connect`
		: `Join @${cleanUsername} on ISCE Connect`;

	const description =
		profile?.bio ||
		`You've been invited by @${cleanUsername} to join ISCE Connect. Claim your digital business card, NFC identity, and smart Naira wallet today!`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			images:
				profile?.profilePhoto ?
					[{ url: profile.profilePhoto, width: 800, height: 800 }]
				:	undefined,
		},
	};
}

export default async function ReferralInvitePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const cleanUsername = slug.replace(/^@/, '');

	const profileLookup = await fetchPublicProfileBySlug(cleanUsername);
	const profile = profileLookup?.data?.profile;

	return (
		<ReferralInviteClient
			slug={cleanUsername}
			inviterName={profile?.name ?? null}
			inviterPhoto={profile?.profilePhoto ?? null}
			inviterBio={profile?.bio ?? null}
		/>
	);
}
