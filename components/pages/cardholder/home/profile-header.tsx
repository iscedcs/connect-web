"use client";

import { useEffect, useRef, useState } from "react";
import MaxWidthWrapper from "@/components/maxwidth-wrapper";
import ShareQrDialog from "@/components/customer/share-qr-dialog";
import AddSlugDialog from "./add-slug-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BellIcon } from "@/lib/icons";
import { cn, getDeterministicAvatarDataUri, getAvatarInitials } from "@/lib/utils";
import { BarChart2, MessageSquare, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

import ProfileQuickSwitch from "./profile-quick-switch";

type ProfileHeaderProfile = {
  id?: string;
  profilePhoto: string | null;
  coverPhoto: string | null;
  name: string | null;
  position: string | null;
  description: string | null;
  slug?: string | null;
  is_default?: boolean;
};

interface ProfileHeaderProps {
  connectProfile?: ProfileHeaderProfile | null;
  user?: UserInfo | null;
  profileId?: string | null;
  profiles?: ProfileHeaderProfile[] | null;
  contactData?: {
    primary?: { email?: string; phone_number?: string };
  };
  linksData?: { title?: string; url?: string; platform?: string }[];
  socialsData?: { title?: string; url?: string; platform?: string }[];
  unreadThreadCount?: number;
  unreadNotificationCount?: number;
  accessToken?: string;
}

export default function ProfileHeader({
  user,
  connectProfile,
  profileId,
  profiles,
  contactData,
  linksData,
  socialsData,
  unreadThreadCount = 0,
  unreadNotificationCount = 0,
  accessToken,
}: ProfileHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const mainEl =
        headerRef.current?.closest(".overflow-y-auto") ||
        document.querySelector("main");
      const currentScroll =
        (mainEl ? mainEl.scrollTop : 0) ||
        window.scrollY ||
        document.documentElement.scrollTop ||
        0;

      setIsScrolled(currentScroll > 20);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
      capture: true,
    });

    const mainEl =
      headerRef.current?.closest(".overflow-y-auto") ||
      document.querySelector("main");
    if (mainEl) {
      mainEl.addEventListener("scroll", handleScroll, { passive: true });
    }

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      if (mainEl) {
        mainEl.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Real-time notification count via WebSocket
  const { unreadCount: wsUnreadCount } = useNotificationSocket({
    accessToken: accessToken || "",
    enabled: !!accessToken,
  });

  // Use WebSocket count if available (> 0 means we've received an update),
  // otherwise fall back to server-side count
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

  return (
    <div
      ref={headerRef}
      className={cn(
        "relative flex flex-col w-full transition-all duration-300 ease-in-out z-50",
        isScrolled
          ? "border-b border-white/15 shadow-2xl py-0 overflow-hidden"
          : "backdrop-blur-md bg-black/70 pb-4"
      )}
    >
      {/* Cover Image & Header Section */}
      <div
        className={cn(
          "relative w-full transition-all duration-300 ease-in-out",
          isScrolled ? "h-16" : "h-32"
        )}
      >
        {/* Cover Photo Background Layer (Image clipped inside this layer only) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Image
            src={coverUrl}
            fill
            sizes="100vw"
            priority
            alt="Cover"
            className={cn(
              "w-full h-full object-cover transition-all duration-300 ease-in-out",
              isScrolled
                ? "blur-md scale-110 opacity-80"
                : "blur-0 scale-100 opacity-100"
            )}
          />
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-300",
              isScrolled
                ? "bg-black/40 backdrop-blur-sm"
                : "bg-gradient-to-t from-black/40 via-black/10 to-transparent"
            )}
          />
        </div>

        {/* Compact Scrolled State (Fades & Slides in when scrolled) */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-between px-4 transition-all duration-300 ease-in-out z-30",
            isScrolled
              ? "opacity-100 pointer-events-auto translate-y-0"
              : "opacity-0 pointer-events-none -translate-y-2"
          )}
        >
          {/* Left: Profile picture beside name */}
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
            <div className="relative shrink-0">
              <Link
                href={
                  profileId
                    ? `/settings/account/edit/${profileId}`
                    : "/settings/account"
                }
                title="Edit Profile"
                className="block rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <Avatar className="w-10 h-10 overflow-hidden ring-2 ring-white/40 shadow-md hover:opacity-90 transition-opacity">
                  <AvatarImage
                    src={avatarUrl}
                    alt={name}
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback className="text-xs bg-black/60 text-white font-bold">{initials}</AvatarFallback>
                </Avatar>
              </Link>

              <ProfileQuickSwitch
                currentProfileId={profileId}
                profiles={profiles}
                accessToken={accessToken}
                triggerSize="sm"
              />
            </div>

            {/* Name beside profile picture */}
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-white truncate leading-tight drop-shadow-sm">
                {name}
              </h2>
              {!!roleOrBio && (
                <p className="text-[11px] text-white/80 truncate leading-none mt-0.5 drop-shadow-sm">
                  {roleOrBio}
                </p>
              )}
            </div>
          </div>

          {/* Right: Quick Action Icons */}
          <div className="flex items-center gap-1 shrink-0">
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
                className="rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm cursor-pointer text-white h-8 w-8 border border-white/10"
                title="Messages"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
              {unreadThreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-1 shadow">
                  {unreadThreadCount > 99 ? "99+" : unreadThreadCount}
                </span>
              )}
            </Link>
            <Link href="/notifications" className="relative">
              <Button
                size="icon"
                className="rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm cursor-pointer text-white h-8 w-8 border border-white/10"
                title="Notifications"
              >
                <BellIcon className="w-4 h-4" />
              </Button>
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-1 shadow">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </Link>
            <Link href="/contacts">
              <Button
                size="icon"
                className="rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm cursor-pointer text-white h-8 w-8 border border-white/10"
                title="Contacts Received"
              >
                <Users className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Large Avatar Overlapping Cover (Expanded State) */}
        <div
          className={cn(
            "absolute -bottom-10 left-6 z-30 transition-all duration-300 ease-in-out",
            isScrolled
              ? "opacity-0 pointer-events-none scale-75 -translate-y-4"
              : "opacity-100 pointer-events-auto scale-100 translate-y-0"
          )}
        >
          <div className="relative">
            <Link
              href={
                profileId
                  ? `/settings/account/edit/${profileId}`
                  : "/settings/account"
              }
              title="Edit Profile"
              className="block rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <Avatar className="w-20 h-20 overflow-hidden ring-2 ring-black/80 hover:opacity-90 transition-opacity">
                <AvatarImage
                  src={avatarUrl}
                  alt={name}
                  className="object-cover w-full h-full"
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Link>

            <ProfileQuickSwitch
              currentProfileId={profileId}
              profiles={profiles}
              accessToken={accessToken}
              triggerSize="md"
            />
          </div>
        </div>
      </div>

      {/* Expanded Profile Info (Smoothly collapases and fades on scroll) */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isScrolled
            ? "max-h-0 opacity-0 pointer-events-none -translate-y-2 mt-0"
            : "max-h-96 opacity-100 pointer-events-auto translate-y-0 mt-14"
        )}
      >
        <MaxWidthWrapper>
          <div className="flex flex-col w-full space-y-4">
            {/* Role */}
            <div className="mb-3 items-start">
              {!!roleOrBio && <p className="text-sm text-white">{roleOrBio}</p>}
              {/* Name */}
              <h2 className="text-2xl font-extrabold">{name}</h2>
            </div>
            {/* Buttons + Icons in one row */}
            <div className="flex w-full items-center justify-between">
              <div className="flex gap-2">
                <Link href="/contacts">
                  <Button
                    variant="default"
                    className="rounded-full bg-white/10 border border-white/20 px-4 py-2 cursor-pointer text-xs text-white hover:bg-white/20"
                  >
                    View contacts
                  </Button>
                </Link>
              </div>

              {/* Icons */}
              <div className="flex items-center">
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
                    className="rounded-full bg-transparent hover:bg-transparent cursor-pointer text-white"
                    title="Messages"
                  >
                    <MessageSquare className="w-10 h-10" />
                  </Button>
                  {unreadThreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-purple-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                      {unreadThreadCount > 99 ? "99+" : unreadThreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/analytics">
                  <Button
                    size="icon"
                    className="rounded-full bg-transparent hover:bg-transparent cursor-pointer text-white"
                    title="Card Analytics"
                  >
                    <BarChart2 className="w-10 h-10" />
                  </Button>
                </Link>
                <Link href="/notifications" className="relative">
                  <Button
                    size="icon"
                    className="rounded-full bg-transparent hover:bg-transparent cursor-pointer text-white"
                    title="Notifications"
                  >
                    <BellIcon className="w-10 h-10" />
                  </Button>
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                      {notifCount > 99 ? "99+" : notifCount}
                    </span>
                  )}
                </Link>
                <Link href="/contacts">
                  <Button
                    size="icon"
                    className="rounded-full bg-transparent hover:bg-transparent cursor-pointer text-white"
                    title="Contacts Received"
                  >
                    <Users className="w-10 h-10" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    </div>
  );
}
