import { getAuthInfo } from "@/app/actions/auth";
import AccountSettingsList from "@/components/pages/cardholder/home/account-settings";
import ConnectManagement from "@/components/pages/cardholder/home/contact-management";
import WalletCard from "@/components/pages/cardholder/home/contact-wallet";
import DevicesCard from "@/components/pages/cardholder/home/device-section";
import EventCard from "@/components/pages/cardholder/home/event-card";
import ProfileHeader from "@/components/pages/cardholder/home/profile-header";
import PromoBanner from "@/components/pages/cardholder/home/promo-banner";
import StoreManagement from "@/components/pages/cardholder/home/store-management";

export default async function HomePage() {
  const authInfo = await getAuthInfo();
  return (
    <main className="bg-black text-white">
      <section className="">
        <ProfileHeader user={authInfo.user} />
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
        <AccountSettingsList />
      </section>
      <section className="p-4 my-20 border-t border-white/10 text-xs text-white/50">
        <pre>{JSON.stringify(authInfo, null, 2)}</pre>
      </section>
    </main>
  );
}
