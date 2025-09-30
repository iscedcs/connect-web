// app/page.tsx
// import PromoBanner from "@/components/home/PromoBanner";
// import EventCarousel from "@/components/home/EventCarousel";
// import DevicesCard from "@/components/home/DevicesCard";
// import WalletCard from "@/components/home/WalletCard";
// import ConnectManagement from "@/components/home/ConnectManagement";
// import StoreManagement from "@/components/home/StoreManagement";
// import AccountSettingsList from "@/components/home/AccountSettingsList";

import AccountSettingsList from "@/components/pages/cardholder/home/account-settings";
import ConnectManagement from "@/components/pages/cardholder/home/contact-management";
import WalletCard from "@/components/pages/cardholder/home/contact-wallet";
import DevicesCard from "@/components/pages/cardholder/home/device-section";
import EventCard from "@/components/pages/cardholder/home/event-card";
import ProfileHeader from "@/components/pages/cardholder/home/profile-header";
import PromoBanner from "@/components/pages/cardholder/home/promo-banner";
import StoreManagement from "@/components/pages/cardholder/home/store-management";
import NFCChecker from "@/components/shared/nfc-checker";

export default function HomePage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <section className="">
        <ProfileHeader />
      </section>
      <section className="">
        <NFCChecker />
      </section>
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
    </main>
  );
}
