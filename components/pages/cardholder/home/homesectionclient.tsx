"use client";
import DevicesConnectedCard from "@/components/pages/cardholder/home/filled-state/device-connected";
import WalletBalanceCard from "@/components/pages/cardholder/home/filled-state/wallet-connected-balance";
import ConnectManagementList from "@/components/pages/cardholder/home/filled-state/connect-management-list";
import StoreManagementTable from "@/components/pages/cardholder/home/filled-state/store-management";
import AccountSettingsList from "./account-settings";
import ProfileHeader from "./profile-header";
import PromoBanner from "./promo-banner";
import EventCard from "./event-card";

export default function HomeClientSection() {
  return (
    <>
      <ProfileHeader />
      <PromoBanner />
      <EventCard />
      <DevicesConnectedCard
        devices={[
          {
            id: "1",
            name: "Wristband",
            address: "Block 2 H Cl, Festac Town, Lagos 102102, Lagos, Nigeria",
            iconSrc: "/assets/2701e4aa55ab26bea712d31de18c7bcc5e655929.png",
            lastSeenLabel: "Now",
          },
          {
            id: "2",
            name: "II Sticker",
            address: "Block 2 H Cl, Festac Town, Lagos 102102, Lagos, Nigeria",
            iconSrc: "/assets/b31eff4fd906e021018be419d1f70aa5c7080e38.png",
            lastSeenLabel: "Now",
          },
        ]}
        enabled
        onToggle={(v: any) => console.log("devices toggle:", v)}
        onDisconnect={(id: any) => console.log("disconnect:", id)}
        onRefresh={(id: any) => console.log("refresh:", id)}
        onDelete={(id: any) => console.log("delete:", id)}
      />
      <WalletBalanceCard
        balance="₦25,688,467.00"
        accountLabel="Titan account details"
        accountNumber="0242011292 - Paul Oyeniran"
        onToggleHide={() => console.log("toggle hide")}
      />
      <ConnectManagementList
        rows={[
          {
            id: "sp",
            iconSrc: "/assets/logos_spotify-icon.svg",
            title: "Spotify",
            subtitle: "Setup a link to your Spotify account",
            href: "/connect/spotify",
          },
          {
            id: "cal",
            iconSrc: "/assets/Ellipse9.svg",
            title: "Calendly",
            subtitle: "Share your meeting schedules with friends & colleagues",
            href: "/connect/calendly",
          },
          {
            id: "yt",
            iconSrc: "/assets/logos_youtube-icon.svg",
            title: "YouTube",
            subtitle: "Share your YouTube video links",
            href: "/connect/youtube",
          },
          {
            id: "pdf",
            iconSrc: "/assets/bi_filetype-pdf.svg",
            title: "Files",
            subtitle: "Share your documents",
            href: "/connect/files",
          },
          {
            id: "soc",
            iconSrc: "/assets/entypo_email.svg",
            title: "Socials",
            subtitle: "Share your social account links",
            href: "/connect/socials",
          },
          {
            id: "forms",
            iconSrc: "/assets/abc81489af0decc890b6bbda5976cb30fd9985f2.png",
            title: "Google forms",
            subtitle: "Share your forms",
            href: "/connect/forms",
          },
          {
            id: "btc",
            iconSrc: "/assets/logos_bitcoin.svg",
            title: "Crypto wallet address",
            subtitle: "Add your crypto receive address",
            href: "/connect/crypto",
          },
        ]}
      />
      <StoreManagementTable
        products={[
          {
            id: "imac",
            name: "Apple iMac 24″",
            price: "₦1,200,000",
            qty: 1,
            thumbSrc:
              "/assets/S55b2a148b0bd46ff8c74d5bc5b4bc1a3w_932cd207-e4c5-4f15-a445-410f812c0b55.svg",
          },
          {
            id: "iphone",
            name: "Apple iPhone 16 Pro",
            price: "₦1,200,000",
            qty: 1,
            thumbSrc: "/assets/Sa5c75ca9999e40d4af8a2aab17cc448dL.svg",
          },
          {
            id: "airpods",
            name: "Apple Airpods Pro 2",
            price: "₦1,200,000",
            qty: 1,
            thumbSrc:
              "/assets/Sc22d2933a4f04756966bd71f66eed506R_e0d9d1e9-09d2-486f-96c1-d7ed9be6eea0.svg",
          },
        ]}
        enabled
        onToggle={(v) => console.log("store toggle:", v)}
      />
      <AccountSettingsList />
    </>
  );
}
