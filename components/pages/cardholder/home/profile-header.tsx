"use client";

import MaxWidthWrapper from "@/components/maxwidth-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BellIcon, NotificationIcon } from "@/lib/icons";
import { getDeterministicAvatarDataUri, getAvatarInitials } from "@/lib/utils";
import { Mail, BarChart2, Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type ConnectProfile = {
  profilePhoto: string | null;
  coverPhoto: string | null;
  name: string | null;
  position: string | null;
  description: string | null;
};

interface ProfileHeaderProps {
  connectProfile?: ConnectProfile | null;
  user?: UserInfo | null;
}

export default function ProfileHeader({
  user,
  connectProfile,
}: ProfileHeaderProps) {
  const coverUrl = connectProfile?.coverPhoto || "/cover-image.png";

  const avatarUrl =
    connectProfile?.profilePhoto ||
    user?.displayPicture ||
    getDeterministicAvatarDataUri(user?.id || connectProfile?.name, connectProfile?.name);

  const name =
    connectProfile?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Connect User";

  const roleOrBio = connectProfile?.position || "";

  const initials = getAvatarInitials(name);

  return (
    <div className="flex flex-col w-full backdrop-blur-md bg-black/70  pb-4">
      {/* Cover Image */}
      <div className="relative w-full h-32">
        <Image
          src={coverUrl}
          fill
          sizes="100vw"
          priority
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />

        {/* Avatar overlapping cover */}
        <div className="absolute -bottom-10 left-6">
          <Avatar className="w-20 h-20 overflow-hidden">
            <AvatarImage
              src={avatarUrl}
              alt="User Avatar"
              className="object-cover w-full h-full"
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Profile Info */}
      <MaxWidthWrapper className="mt-14">
        <div className="flex flex-col w-full  space-y-4 ">
          {/* Role */}
          <div className="mb-3  items-start">
            {!!roleOrBio && <p className="text-sm text-white">{roleOrBio}</p>}
            {/* Name */}
            <h2 className="text-2xl font-extrabold">{name}</h2>
          </div>
          {/* Buttons + Icons in one row */}
          <div className="flex w-full  items-center justify-between">
            <div className="flex gap-2">
              {/* <Button
                variant="secondary"
                className="rounded-full border-none px-4 py-2 cursor-pointer text-xs ">
                Send money
              </Button> */}
              <Link href="/contacts">
                <Button
                  variant="default"
                  className="rounded-full bg-[#151515D9] border-[#868686] border-[0.5px] px-4 py-2 cursor-pointer text-xs ">
                  View contacts
                </Button>
              </Link>
            </div>

            {/* Icons */}
            <div className="flex items-center">
              <Button
                size="icon"
                className="rounded-full bg-transparent hover:bg-transparent cursor-pointer">
                <Mail className="w-10 h-10" />
              </Button>
              <Button
                size="icon"
                className="rounded-full bg-transparent hover:bg-transparent cursor-pointer">
                <BarChart2 className="w-10 h-10" />
              </Button>
              <Button
                size="icon"
                className="rounded-full bg-transparent hover:bg-transparent cursor-pointer">
                <BellIcon className="w-10 h-10" />
              </Button>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
