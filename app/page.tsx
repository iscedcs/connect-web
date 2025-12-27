import { getAuthInfo } from "@/actions/auth";
import AccountSettingsList from "@/components/pages/cardholder/home/account-settings";
import ConnectManagementWrapper from "@/components/pages/cardholder/home/connect-management-wrapper";
import DevicesCard from "@/components/pages/cardholder/home/device-section";
import EventCard from "@/components/pages/cardholder/home/event-card";
import DevicesConnectedCard from "@/components/pages/cardholder/home/filled-state/device-connected";
import ProfileHeader from "@/components/pages/cardholder/home/profile-header";
import PromoBanner from "@/components/pages/cardholder/home/promo-banner";
import { getConnectModules } from "@/lib/services/connect-modules";
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
  // console.log("User Profile ID", `${connectProfile?.id}`);
  // console.log("User Devices", `${userDevices}`);
  // console.log("User Detials", `${connectProfile}`);
  const hasDevices = userDevices.length > 0;

  let connectModules = null;

  if (connectProfile?.id && accessToken) {
    connectModules = await getConnectModules(connectProfile.id, accessToken);
  }
  return (
    <main className="relative bg-black text-white min-h-screen overflow-x-hidden">
      <section className="fixed  top-0 left-0 right-0 z-50  pointer-events-none">
        <div className="max-w-md  mx-auto pointer-events-auto">
          <ProfileHeader connectProfile={connectProfile} user={authInfo.user} />
        </div>{" "}
      </section>
      {/* <section className=''>
				<NFCChecker />
			</section> */}

      <div className="pt-80  space-y-10">
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
          {accessToken && connectProfile?.id && (
            <ConnectManagementWrapper initialModules={connectModules} />
          )}

          {/* <StoreManagement /> */}
        </section>

        <section className="p-4">
          <AccountSettingsList
            isAuthenticated={isAuthed}
            profileId={connectProfile?.id!}
          />
        </section>
      </div>
    </main>
  );
}
