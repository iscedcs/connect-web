import React from "react";
import { cookies } from "next/headers";
import { generateMetadata } from "@/lib/metadata";
import { getAuthUserProfile } from "@/lib/services/wallet";
import { getReferralSummary, getReferredUsers } from "@/lib/services/referral";
import SubpageHeader from "@/components/shared/subpage-header";
import ReferralClient from "@/components/cardholder/referral/referral-client";

export const metadata = generateMetadata({
	title: "Referrals",
	description:
		"Invite friends to LYNCON, track your referral code, shareable link, referral earnings, and cash out rewards.",
	keywords: [
		"referral",
		"referrals",
		"rewards",
		"earnings",
		"share",
		"invite",
		"cash out",
	],
});

export default async function ReferralPage() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get("accessToken")?.value;

	let username: string | null = null;
	let summary: Awaited<ReturnType<typeof getReferralSummary>> = null;
	let referred: Awaited<ReturnType<typeof getReferredUsers>> = null;
	if (accessToken) {
		try {
			const [profile, referralSummary, referredUsers] = await Promise.all([
				getAuthUserProfile(accessToken),
				getReferralSummary(accessToken),
				getReferredUsers(accessToken),
			]);
			if (profile?.username) {
				username = profile.username;
			}
			summary = referralSummary;
			referred = referredUsers;
		} catch {
			// Fall back to default/zero state
		}
	}

	return (
		<main className="min-h-screen bg-black text-white">
			<SubpageHeader title="Referrals" backHref="/dashboard" />
			<div className="p-4 md:p-6">
				<ReferralClient
					username={username}
					summary={summary}
					referred={referred}
				/>
			</div>
		</main>
	);
}
