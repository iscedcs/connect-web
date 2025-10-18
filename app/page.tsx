import { getAuthInfo } from "@/actions/auth";
import AccountSettingsList from "@/components/pages/cardholder/home/account-settings";
import ConnectManagement from "@/components/pages/cardholder/home/contact-management";
import WalletCard from "@/components/pages/cardholder/home/contact-wallet";
import DevicesCard from "@/components/pages/cardholder/home/device-section";
import EventCard from "@/components/pages/cardholder/home/event-card";
import ProfileHeader from "@/components/pages/cardholder/home/profile-header";
import PromoBanner from "@/components/pages/cardholder/home/promo-banner";
import StoreManagement from "@/components/pages/cardholder/home/store-management";
import { NEXT_PUBLIC_CONNECT_API_ORIGIN, URLS } from "@/lib/const";

type ConnectProfile = {
  id: string;
  userId: string;
  profilePhoto: string | null;
  coverPhoto: string | null;
  name: string | null;
  position: string | null;
  description: string | null;
  address?: { street?: string | null };
};

async function getConnectProfile(): Promise<ConnectProfile | null> {
  const auth = await getAuthInfo();
  if ("error" in auth || auth.isExpired) return null;

  const res = await fetch(
    `${NEXT_PUBLIC_CONNECT_API_ORIGIN}${URLS.profile.profile}`,
    {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${auth.accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (res.status === 404 || res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to load profile");

  const json = await res.json();
  return json?.data?.profile ?? json?.profile ?? null;
}

export default async function HomePage() {
  const [connectProfile, authInfo] = await Promise.all([
    getConnectProfile(),
    getAuthInfo(),
  ]);
  console.log({ authInfo });
  const isAuthed = !("error" in authInfo) && !authInfo.isExpired;

  return (
    <main className="bg-black text-white">
      <section className="">
        <ProfileHeader connectProfile={connectProfile} user={authInfo.user} />
      </section>
      {/* <section className=''>
				<NFCChecker />
			</section> */}
      <section className="p-4 space-y-5">
        <PromoBanner />
        <EventCard />
      </section>
      <section className="p-4 space-y-10">
        <DevicesCard />
        <WalletCard />
      </section>
      <section className="p-4 space-y-10">
        <ConnectManagement />
        <StoreManagement />
      </section>

      <section className="p-4">
        <AccountSettingsList isAuthenticated={isAuthed} />
      </section>
    </main>
  );
}
