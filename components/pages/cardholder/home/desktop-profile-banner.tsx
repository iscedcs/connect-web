"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ShareQrDialog from "@/components/customer/share-qr-dialog";
import AddSlugDialog from "./add-slug-dialog";
import { BellIcon } from "@/lib/icons";
import { getDeterministicAvatarDataUri, getAvatarInitials } from "@/lib/utils";
import { BarChart2, MessageSquare, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

type ConnectProfileShape = {
  profilePhoto: string | null;
  coverPhoto: string | null;
  name: string | null;
  position: string | null;
  description: string | null;
  slug?: string | null;
};

interface DesktopProfileBannerProps {
  connectProfile?: ConnectProfileShape | null;
  user?: UserInfo | null;
  firstName?: string | null;
  contactData?: {
    primary?: { email?: string; phone_number?: string };
  };
  linksData?: { title?: string; url?: string; platform?: string }[];
  socialsData?: { title?: string; url?: string; platform?: string }[];
  unreadThreadCount?: number;
  unreadNotificationCount?: number;
  accessToken?: string;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DesktopProfileBanner({
  user,
  connectProfile,
  firstName,
  contactData,
  linksData,
  socialsData,
  unreadThreadCount = 0,
  unreadNotificationCount = 0,
  accessToken,
}: DesktopProfileBannerProps) {
  const { unreadCount: wsUnreadCount } = useNotificationSocket({
    accessToken: accessToken || "",
    enabled: !!accessToken,
  });

  const notifCount =
    wsUnreadCount > 0 ? wsUnreadCount : unreadNotificationCount;

  const coverUrl = connectProfile?.coverPhoto || "/cover-image.png";

  const avatarUrl =
    connectProfile?.profilePhoto ||
    user?.displayPicture ||
    getDeterministicAvatarDataUri(
      user?.id || connectProfile?.name,
      connectProfile?.name,
    );

  const name =
    connectProfile?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Connect User";

  const roleOrBio = connectProfile?.position || "";
  const initials = getAvatarInitials(name);
  const slug = connectProfile?.slug;

  const greeting = getGreeting();
  const greetName = firstName ? `, ${firstName}` : "";
  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/8">
      {/* Cover photo */}
      <div className="relative w-full h-28">
        <Image
          src={coverUrl}
          fill
          sizes="100vw"
          priority
          alt="Cover"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />

        {/* Greeting + date overlaid on cover */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between px-5 pt-4">
          <p className="text-sm text-white/70 font-medium">
            {greeting}
            {greetName}
          </p>
          <p className="text-sm text-white/40 tabular-nums">{dateLabel}</p>
        </div>
      </div>

      {/* Info bar below cover */}
      <div className="bg-[#0a0a0a] px-5 pb-4 flex items-end gap-4">
        {/* Avatar: overlaps cover */}
        <div className="-mt-7 shrink-0">
          <Avatar className="w-14 h-14 ring-2 ring-[#0a0a0a] overflow-hidden">
            <AvatarImage
              src={avatarUrl}
              alt={name}
              className="object-cover w-full h-full"
            />
            <AvatarFallback className="bg-white/10 text-white text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name + role */}
        <div className="flex-1 min-w-0 pt-2">
          <h2 className="text-base font-bold text-white leading-tight truncate">
            {name}
          </h2>
          {roleOrBio && (
            <p className="text-xs text-white/50 truncate mt-0.5">{roleOrBio}</p>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 shrink-0 pt-2">
          {slug ? (
            <ShareQrDialog
              profileId={slug}
              profile={{
                name: connectProfile?.name ?? undefined,
                profilePhoto: connectProfile?.profilePhoto ?? undefined,
                position: connectProfile?.position ?? undefined,
                bio: connectProfile?.description ?? undefined,
              }}
              contact={contactData}
              links={linksData}
              socials={socialsData}
              slugMode
            />
          ) : (
            <AddSlugDialog />
          )}

          <Link href="/connect/artisan/threads" className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Messages"
            >
              <MessageSquare className="w-[18px] h-[18px]" />
            </Button>
            {unreadThreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-purple-500 text-white text-[8px] font-bold min-w-[15px] h-[15px] flex items-center justify-center rounded-full px-0.5">
                {unreadThreadCount > 99 ? "99+" : unreadThreadCount}
              </span>
            )}
          </Link>

          <Link href="/analytics">
            <Button
              size="icon"
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Analytics"
            >
              <BarChart2 className="w-[18px] h-[18px]" />
            </Button>
          </Link>

          <Link href="/notifications" className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Notifications"
            >
              <BellIcon className="w-[18px] h-[18px]" />
            </Button>
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold min-w-[15px] h-[15px] flex items-center justify-center rounded-full px-0.5">
                {notifCount > 99 ? "99+" : notifCount}
              </span>
            )}
          </Link>

          <Link href="/contacts">
            <Button
              size="icon"
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Contacts"
            >
              <Users className="w-[18px] h-[18px]" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
