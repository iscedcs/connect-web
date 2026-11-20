import { getAuthInfo } from "@/actions/auth";
import AnalyticsClient from "@/components/pages/cardholder/analytics/analytics-client";
import { generateMetadata } from "@/lib/metadata";
import { http } from "@/lib/services/http";
import { URLS } from "@/lib/const";
import SubpageHeader from "@/components/shared/subpage-header";
import PageTitle from "@/components/ui/page-title";
import AccountSettingsList from "@/components/pages/cardholder/home/account-settings";
import ReferralStoreCard from "@/components/pages/cardholder/home/referral-store-card";
import ArtisanCard from "@/components/pages/cardholder/home/artisan-card";
import WalletCard from "@/components/pages/cardholder/home/contact-wallet";
import { EventCard } from "@/components/customer/event-card";
import ReferralCard from "@/components/pages/cardholder/home/referral-card";
import { getConnectProfile } from "@/lib/services/profile";
import { getUserDevices } from "@/lib/services/device";
import { fetchPublicUserEvent } from "@/lib/services/events";
import { getMyArtisanProfile } from "@/lib/services/artisan";
import { getAuthUserProfile } from "@/lib/services/wallet";
import { getReferralSummary } from "@/lib/services/referral";
import { access } from "fs";

export const metadata = generateMetadata({
  title: "Analytics",
  description:
    "View your profile analytics — card interactions, contacts, notifications, social links and more.",
  keywords: ["analytics", "card", "taps", "scans", "interactions", "contacts"],
});

async function getDefaultProfileId(
  accessToken: string,
): Promise<string | undefined> {
  try {
    const base =
      process.env.CONNECT_API_URL || process.env.NEXT_PUBLIC_CONNECT_API_URL;
    const res = await http.get(`${base}${URLS.multi_profile.get_default}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data?.data?.id ?? undefined;
  } catch {
    return undefined;
  }
}

export default async function AnalyticsPage() {
  const [authInfo, connectProfile] = await Promise.all([
    getAuthInfo(),
    getConnectProfile(),
  ]);

  if ("error" in authInfo || authInfo.isExpired) {
    return <div className="text-white p-6">Redirecting to login...</div>;
  }

  const defaultProfileId = await getDefaultProfileId(authInfo.accessToken);
  const isAuthed = !("error" in authInfo) && !authInfo.isExpired;
  const profileId = connectProfile?.id;
  const userId = isAuthed ? authInfo.user.id : null;
  const accessToken = isAuthed ? authInfo.accessToken : null;

  const [artisanProfile, userEvents, userProfile, referralData] =
    await Promise.all([
      profileId ? getMyArtisanProfile(profileId) : Promise.resolve(null),
      userId ? fetchPublicUserEvent(userId) : Promise.resolve([]),
      accessToken
        ? getAuthUserProfile(accessToken).catch(() => null)
        : Promise.resolve(null),
      accessToken
        ? getReferralSummary(accessToken).catch(() => null)
        : Promise.resolve(null),
    ]);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="px-5 py-3">
        <PageTitle title="Analytics & Settings" />
      </div>
      <div>
        <section className="px-4">
          <ReferralCard
            username={userProfile?.username}
            slug={connectProfile?.slug}
            code={referralData?.code}
          />
        </section>
      </div>
      <div className="p-6 space-y-4">
        <AnalyticsClient
          accessToken={authInfo.accessToken}
          defaultProfileId={defaultProfileId}
        />
      </div>
      <div>
        <section className=" md:block p-4 lg:p-0">
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 lg:items-start">
            <ArtisanCard
              artisanProfile={artisanProfile}
              profileId={profileId}
              compact
            />
            {/* <WalletCard compact /> */}
            {/* <EventCard events={userEvents} compact /> */}
          </div>
        </section>
      </div>
      <div>
        <section className=" p-4 lg:hidden">
          <AccountSettingsList isAuthenticated={isAuthed} />
        </section>
      </div>
    </main>
  );
}
