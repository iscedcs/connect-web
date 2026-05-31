import { getAuthInfo } from "@/actions/auth";
import AccountSettingsList from "@/components/pages/cardholder/home/account-settings";
import ArtisanCard from "@/components/pages/cardholder/home/artisan-card";
import ConnectManagementWrapper from "@/components/pages/cardholder/home/connect-management-wrapper";
import DashboardQuickActions from "@/components/pages/cardholder/home/dashboard-quick-actions";
import DashboardStats from "@/components/pages/cardholder/home/dashboard-stats";
import DesktopProfileBanner from "@/components/pages/cardholder/home/desktop-profile-banner";
import DevicesCard from "@/components/pages/cardholder/home/device-section";
import EventCard from "@/components/pages/cardholder/home/event-card";
import DevicesConnectedCard from "@/components/pages/cardholder/home/filled-state/device-connected";
import ProfileHeader from "@/components/pages/cardholder/home/profile-header";
import PromoBanner from "@/components/pages/cardholder/home/promo-banner";
import {
  getMyArtisanProfile,
  getUnreadThreadCount,
} from "@/lib/services/artisan";
import { fetchCardInteractionStats } from "@/lib/services/card-interactions";
import { getConnectModules } from "@/lib/services/connect-modules";
import { fetchReceivedContactStats } from "@/lib/services/contact";
import { getUserDevices } from "@/lib/services/device";
import { fetchPublicUserEvent } from "@/lib/services/events";
import { getConnectProfile } from "@/lib/services/profile";
import { fetchNotificationStats } from "@/lib/services/notification";
import { generateMetadata } from "@/lib/metadata";
import WalletCard from "@/components/pages/cardholder/home/contact-wallet";

export const metadata = generateMetadata({
  title: "Dashboard",
  description:
    "Manage your digital lifestyle, connect with NFC and QR codes, manage devices, and access all your Connect features in one place.",
  keywords: ["dashboard", "connect", "devices", "profile"],
});

export default async function DashboardPage() {
  // Stage 1: Auth + profile (must resolve first — everything else depends on these)
  const [connectProfile, authInfo] = await Promise.all([
    getConnectProfile(),
    getAuthInfo(),
  ]);
  const isAuthed = !("error" in authInfo) && !authInfo.isExpired;
  const accessToken = isAuthed ? authInfo.accessToken : null;
  const userId = isAuthed ? authInfo.user.id : null;
  const profileId = connectProfile?.id;

  // Stage 2: All remaining data in parallel (was 3 sequential stages before)
  const [
    userDevices,
    userEvents,
    artisanProfile,
    unreadThreadCount,
    notifStats,
    connectModules,
    cardStats,
    contactStats,
  ] = await Promise.all([
    userId && accessToken
      ? getUserDevices(userId, accessToken)
      : Promise.resolve([] as DeviceInterface[]),
    userId ? fetchPublicUserEvent(userId) : Promise.resolve([]),
    profileId ? getMyArtisanProfile(profileId) : Promise.resolve(null),
    profileId ? getUnreadThreadCount() : Promise.resolve(0),
    profileId && accessToken
      ? fetchNotificationStats({ accessToken }).catch(() => null)
      : Promise.resolve(null),
    profileId && accessToken
      ? getConnectModules(profileId, accessToken)
      : Promise.resolve(null),
    accessToken
      ? fetchCardInteractionStats({ accessToken }).catch(() => null)
      : Promise.resolve(null),
    profileId && accessToken
      ? fetchReceivedContactStats({ profileId, accessToken }).catch(() => null)
      : Promise.resolve(null),
  ]);

  const unreadNotificationCount = notifStats?.unreadNotifications ?? 0;
  const hasDevices = userDevices.length > 0;

  // Derive active module count from connectModules
  const activeModulesCount = connectModules
    ? [
        connectModules.contact?.contacts?.length,
        connectModules.links?.links?.length,
        connectModules.socials?.socials?.length,
        connectModules.videos?.videos?.length,
        connectModules.files?.files?.length,
        connectModules.forms?.forms?.length,
        connectModules.meetings?.meetings?.length,
        connectModules.spotify?.tracks?.length,
        connectModules.appointments?.appointments?.length,
      ].filter((v) => v && v > 0).length
    : 0;

  const firstName = !("error" in authInfo) ? authInfo.user?.firstName : null;

  return (
    <main className="relative bg-black text-white min-h-screen overflow-x-hidden">
      {/* Mobile: fixed profile header */}
      <section className="fixed top-0 left-0 right-0 z-50 pointer-events-none lg:hidden">
        <div className="max-w-md mx-auto pointer-events-auto">
          <ProfileHeader
            connectProfile={connectProfile}
            user={authInfo.user}
            profileId={connectProfile?.id}
            unreadThreadCount={unreadThreadCount}
            unreadNotificationCount={unreadNotificationCount}
            accessToken={accessToken || undefined}
            contactData={
              connectModules?.contact?.contacts?.[0]
                ? {
                    primary: {
                      email: undefined,
                      phone_number:
                        connectModules.contact.contacts[0]?.phone_number,
                    },
                  }
                : undefined
            }
            linksData={connectModules?.links?.links}
            socialsData={connectModules?.socials?.socials}
          />
        </div>
      </section>

      {/* ── Desktop: full-width top section above the 2-col grid ──────── */}
      <div className="hidden lg:block lg:px-6 lg:pt-6 lg:pb-0 space-y-3">
        <DesktopProfileBanner
          connectProfile={connectProfile}
          user={!("error" in authInfo) ? authInfo.user : null}
          firstName={firstName}
          contactData={
            connectModules?.contact?.contacts?.[0]
              ? {
                  primary: {
                    email: undefined,
                    phone_number:
                      connectModules.contact.contacts[0]?.phone_number,
                  },
                }
              : undefined
          }
          linksData={connectModules?.links?.links}
          socialsData={connectModules?.socials?.socials}
          unreadThreadCount={unreadThreadCount}
          unreadNotificationCount={unreadNotificationCount}
          accessToken={accessToken || undefined}
        />
        <DashboardStats
          tapsThisWeek={cardStats?.thisWeekInteractions ?? 0}
          contactsReceived={contactStats?.totalContacts ?? 0}
          unreadMessages={unreadThreadCount ?? 0}
          activeModules={activeModulesCount}
        />
        <DashboardQuickActions slug={connectProfile?.slug ?? null} />
      </div>

      {/* Content — mobile stacked / desktop single column */}
      <div className="pt-80 space-y-10 lg:pt-4 lg:p-6">
        <div className="space-y-10 lg:space-y-5">
          {/* Promo banner — mobile only */}
          <section className="p-4 lg:hidden">
            <PromoBanner
              hasDevices={hasDevices}
              hasEvents={userEvents.length > 0}
              profileComplete={
                !!(connectProfile?.name && connectProfile?.profilePhoto)
              }
            />
          </section>

          {/* Connect management strip */}
          {accessToken && connectProfile?.id && (
            <section className="p-4 lg:p-0">
              <ConnectManagementWrapper initialModules={connectModules} />
            </section>
          )}

          {/* Feature cards: 1-col mobile → 2-col desktop grid */}
          <section className="p-4 lg:p-0">
            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 lg:items-start">
              <ArtisanCard
                artisanProfile={artisanProfile}
                profileId={profileId}
                compact
              />
              <WalletCard compact />
              <EventCard events={userEvents} compact />
              {hasDevices ? (
                <DevicesConnectedCard devices={userDevices} compact />
              ) : (
                <DevicesCard compact />
              )}
            </div>
          </section>

          {/* Account settings list — mobile only */}
          <section className="p-4 lg:hidden">
            <AccountSettingsList isAuthenticated={isAuthed} />
          </section>
        </div>
      </div>
    </main>
  );
}
