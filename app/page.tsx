import { getAuthInfo } from "@/actions/auth";
import AccountSettingsList from "@/components/pages/cardholder/home/account-settings";
import ConnectManagement from "@/components/pages/cardholder/home/contact-management";
import WalletCard from "@/components/pages/cardholder/home/contact-wallet";
import DevicesCard from "@/components/pages/cardholder/home/device-section";
import EventCard from "@/components/pages/cardholder/home/event-card";
import DevicesConnectedCard from "@/components/pages/cardholder/home/filled-state/device-connected";
import ProfileHeader from "@/components/pages/cardholder/home/profile-header";
import PromoBanner from "@/components/pages/cardholder/home/promo-banner";
import StoreManagement from "@/components/pages/cardholder/home/store-management";
import { getUserDevices } from "@/lib/services/device";
import { getConnectProfile } from "@/lib/services/profile";

export default async function HomePage() {
  const [connectProfile, authInfo] = await Promise.all([
    getConnectProfile(),
    getAuthInfo(),
  ]);
  console.log({ authInfo });
  const isAuthed = !("error" in authInfo) && !authInfo.isExpired;
  const accessToken = isAuthed ? authInfo.accessToken : null;
  const userId = isAuthed ? authInfo.user.id : null;

  let userDevices: DeviceInterface[] = [];
  if (userId && accessToken) {
    userDevices = await getUserDevices(userId, accessToken);
  }
  console.log("User Devices", `${userDevices}`);
  const hasDevices = userDevices.length > 0;

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
        {hasDevices ? (
          <DevicesConnectedCard devices={userDevices} />
        ) : (
          <DevicesCard />
        )}
        {/* <WalletCard /> */}
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
