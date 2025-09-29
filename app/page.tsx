// app/page.tsx
// import PromoBanner from "@/components/home/PromoBanner";
// import EventCarousel from "@/components/home/EventCarousel";
// import DevicesCard from "@/components/home/DevicesCard";
// import WalletCard from "@/components/home/WalletCard";
// import ConnectManagement from "@/components/home/ConnectManagement";
// import StoreManagement from "@/components/home/StoreManagement";
// import AccountSettingsList from "@/components/home/AccountSettingsList";

import AccountSettingsList from "@/components/pages/home/account-settings";
import ConnectManagement from "@/components/pages/home/contact-management";
import WalletCard from "@/components/pages/home/contact-wallet";
import DevicesCard from "@/components/pages/home/device-section";
import EventCard from "@/components/pages/home/event-card";
import ProfileHeader from "@/components/pages/home/profile-header";
import PromoBanner from "@/components/pages/home/promo-banner";
import StoreManagement from "@/components/pages/home/store-management";

export default function HomePage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <section className="">
        <ProfileHeader />
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
