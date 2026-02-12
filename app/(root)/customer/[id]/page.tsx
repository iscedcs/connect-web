import PublicProfileTabs from "@/components/customer/public-profile-tabs";
import ShareQrDialog from "@/components/customer/share-qr-dialog";
import EmailDialog from "@/components/customer/email-dialog";
import { PhoneIcon } from "@/lib/icons";
import { fetchPublicUserEvent } from "@/lib/services/events";
import {
  fetchPublicProfileWithLookup,
  type PublicProfileLookupReason,
} from "@/lib/services/public-profile";
import { getPlatformInfo } from "@/lib/connect-social/detect-platform";
import { ICONS, COVER_PHOTOS } from "@/lib/const";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

/** Profile visibility - will be fetched from user settings in future */
const profileIsPublic = false;

/** Deterministic hash from string - same input always gives same output */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function asBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
}

function canDisplayEventsFromPermissions(profileData: any) {
  const permissions =
    profileData?.permissions ?? profileData?.profile?.permissions;
  if (!permissions) return false;

  const directValue =
    permissions.events ??
    permissions.event ??
    permissions.showEvents ??
    permissions.eventsEnabled ??
    permissions.canViewEvents ??
    permissions.event_visibility;

  if (typeof directValue !== "undefined") {
    return asBoolean(directValue);
  }

  if (Array.isArray(permissions)) {
    const eventsPermission = permissions.find((p: any) => {
      const key =
        p?.key ?? p?.name ?? p?.permission ?? p?.slug ?? p?.type ?? "";
      return String(key).toLowerCase().includes("event");
    });
    if (eventsPermission) {
      return asBoolean(
        eventsPermission.enabled ??
          eventsPermission.value ??
          eventsPermission.allowed ??
          eventsPermission.is_enabled,
      );
    }
  }

  return false;
}

function EmptyDeviceOrProfileState({
  reason,
}: {
  reason: PublicProfileLookupReason;
}) {
  const isMissingDevice = reason === "device_not_found";
  const title = isMissingDevice
    ? "This card does not exist on our system"
    : "This card has no profile attached yet";
  const description = isMissingDevice
    ? "The card/device you tapped is not registered on ISCE Ecosystem."
    : "This device exists on ISCE Ecosystem, but no public profile has been set up for it yet.";

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-5">
      <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8 text-center">
        <div className="mx-auto mb-4 w-14 h-14 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-2xl font-semibold">
          !
        </div>
        <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-white/70 mt-2 leading-relaxed">
          {description}
        </p>
        <p className="text-sm text-white/70 mt-3">
          You can purchase a new ISCE card at{" "}
          <a
            href="https://isce.tech/store"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline underline-offset-4">
            isce.tech/store
          </a>
          .
        </p>
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          <a
            href="https://isce.tech/store"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-medium">
            Visit Store
          </a>
          <Link
            href="/"
            className="px-5 py-2.5 bg-white/5 border border-white/25 rounded-full text-sm font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

/** ---------------------------------------
 * DYNAMIC METADATA
 -----------------------------------------*/
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profileLookup = await fetchPublicProfileWithLookup(id);
  const profileData = profileLookup.data;

  if (!profileData) {
    return {
      title:
        profileLookup.reason === "profile_not_set_up"
          ? "Profile Not Set Up | Connect"
          : "Device Not Found | Connect",
      robots: { index: false, follow: false },
    };
  }

  const { profile } = profileData;
  const title = `${profile.name} | Connect`;
  const description =
    profile.bio ||
    `${profile.name}${profile.position ? ` - ${profile.position}` : ""}. Connect with me on ISCE Connect.`;
  const fallbackCover = COVER_PHOTOS[hashCode(id) % COVER_PHOTOS.length];
  const ogImage = profile.coverPhoto?.startsWith("http")
    ? profile.coverPhoto
    : profile.profilePhoto?.startsWith("http")
      ? profile.profilePhoto
      : fallbackCover;

  return {
    title,
    description,
    robots: profileIsPublic
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "profile",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

/** ---------------------------------------
 * BUILD UNIFIED FIGMA CONNECT LIST
 -----------------------------------------*/
function buildConnectList(data: any) {
  const list: any[] = [];

  data.spotify?.forEach((item: any) =>
    list.push({
      id: item.id,
      title: item.title,
      url: item.url,
      icon: ICONS.spotify,
    }),
  );

  data.meetings?.forEach((m: any) =>
    list.push({
      id: m.id,
      title: "Calendly",
      url: m.url,
      icon: ICONS.calendly,
    }),
  );

  data.videos?.forEach((v: any) =>
    list.push({
      id: v.id,
      title: v.title,
      url: v.url,
      icon: ICONS.youtube,
    }),
  );

  data.files?.forEach((f: any) =>
    list.push({
      id: f.id,
      title: f.title,
      url: f.url,
      icon: ICONS.file,
    }),
  );

  // Process socials with platform detection (exclude emails - they're shown separately)
  data.socials?.forEach((s: any) => {
    // Skip emails - they're displayed in the header
    if (s.platform?.toLowerCase() === "email" || s.icon === "email") {
      return;
    }
    const platformInfo = getPlatformInfo(s);
    list.push({
      id: s.id,
      title: platformInfo.displayName,
      url: platformInfo.actionUrl,
      icon: platformInfo.icon,
      platform: platformInfo.platform,
      username: s.username,
      originalPlatform: s.platform,
    });
  });

  data.links?.forEach((l: any) =>
    list.push({
      id: l.id,
      title: l.title,
      url: l.url,
      icon: ICONS.link,
    }),
  );

  data.forms?.forEach((f: any) =>
    list.push({
      id: f.id,
      title: f.title,
      url: f.url,
      icon: ICONS.google_forms,
    }),
  );
  data.appointments?.forEach((a: any) =>
    list.push({
      id: a.id,
      type: "appointment",
      title: a.label || "Book An Appointment With me",
      url: a.url,
      icon: ICONS.appointments,
    }),
  );

  data.wallets?.forEach((w: any) =>
    list.push({
      id: w.id,
      title: w.network || "Crypto Wallet",
      url: w.address,
      icon: ICONS.crypto,
    }),
  );

  return list;
}

/** ---------------------------------------
 * MAIN PAGE
 -----------------------------------------*/
export default async function CustomerProfilePage({ params }: any) {
  const { id } = await params;
  const profileLookup = await fetchPublicProfileWithLookup(id);
  const profileData = profileLookup.data;

  const userId = profileData?.profile?.userId;
  const events = await fetchPublicUserEvent(userId);

  if (!profileData)
    return <EmptyDeviceOrProfileState reason={profileLookup.reason} />;

  const { profile, contact, device } = profileData;

  // Extract emails from socials
  const emailItems = (profileData.socials || []).filter(
    (s: any) => s.platform?.toLowerCase() === "email" || s.icon === "email",
  );

  const connectItems = buildConnectList(profileData);
  const canShowEventsTab =
    canDisplayEventsFromPermissions(profileData) && events.length > 0;

  // if (process.env.NODE_ENV !== "production") {
  //   console.log("[customer-profile] events permission debug", {
  //     deviceId: id,
  //     permissions:
  //       profileData?.permissions ?? profileData?.profile?.permissions ?? null,
  //     eventsCount: events.length,
  //     canShowEventsTab,
  //   });
  // }

  // Deterministic fallback cover based on profile ID
  const fallbackCover = COVER_PHOTOS[hashCode(id) % COVER_PHOTOS.length];

  return (
    <main className="min-h-screen bg-black text-white pb-16">
      <section>
        <div className="w-full h-44 md:h-64 relative">
          <div className="w-full h-44 md:h-64 bg-linear-180 from-black/0 via-black/30 to-black/100 absolute top-0 left-0 "></div>
          <Image
            src={
              profile.coverPhoto?.startsWith("http")
                ? profile.coverPhoto
                : fallbackCover
            }
            height={176}
            width={1440}
            alt="Cover Photo"
            className="w-full h-44 md:h-64 object-cover"
          />
        </div>

        <div className="px-4 -mt-14 md:-mt-20 flex items-end gap-3 z-10 relative">
          <Image
            src={profile.profilePhoto}
            height={80}
            width={80}
            alt="Profile Photo"
            className="w-20 h-20 rounded-full border-4 border-black object-cover overflow-clip shrink-0"
          />

          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              {profile.name}
            </h1>
            <p className="text-sm text-white/80 -mt-0.5">{profile.position}</p>
          </div>
        </div>

        {profile.bio && (
          <div className="px-4 mt-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-px w-6 bg-white/20" />
              <span className="text-[10px] uppercase tracking-wider text-white/50">
                Bio
              </span>
            </div>

            <p className="max-w-md text-xs leading-relaxed text-white/70">
              {profile.bio}
            </p>
          </div>
        )}

        <div className="px-4 mt-4 flex items-center font-medium gap-3 flex-wrap">
          <Link
            href={`/customer/${id}/save-contact?download=1`}
            className="px-5 py-2 bg-white/5 border border-[#868686] rounded-full text-xs"
          >
            Save Contact
          </Link>
          {/* <button className="px-5 py-2 bg-white/5 border border-[#868686] rounded-full text-xs">
            <Link href="#">Save contact</Link>
          </button> */}

          <div className="flex items-center gap-2 text-xl ml-auto">
            <ShareQrDialog
              profileId={id}
              profile={profile}
              contact={contact}
              links={profileData?.links ?? profile?.links ?? []}
              socials={profileData?.socials ?? profile?.socials ?? []}
            />
            <EmailDialog emails={emailItems} />
            {contact?.primary?.phone_number && (
              <a href={`tel:${contact.primary.phone_number}`} title="phone">
                <PhoneIcon />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* TABS */}
      <PublicProfileTabs
        connectItems={connectItems}
        events={events!}
        id={id}
        canShowEventsTab={canShowEventsTab}
      />
    </main>
  );
}
