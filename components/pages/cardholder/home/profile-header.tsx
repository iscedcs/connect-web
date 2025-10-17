"use client";

import MaxWidthWrapper from "@/components/maxwidth-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, BarChart2, Bell } from "lucide-react";
import Image from "next/image";

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
    "/profile-image.png";

  const name =
    connectProfile?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "User";

  const roleOrBio = connectProfile?.position || "";

  const initials =
    name
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??";

  return (
    <div className="flex flex-col w-full">
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
            {!!roleOrBio && (
              <p className="text-md text-gray-400">{roleOrBio}</p>
            )}
            {/* Name */}
            <h2 className="text-xl font-semibold">{name}</h2>
          </div>
          {/* Buttons + Icons in one row */}
          <div className="flex w-full  items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="rounded-full border-none px-4 py-2">
                Send money
              </Button>
              <Button
                variant="default"
                className="rounded-full bg-[#151515D9] px-4 py-2">
                View contacts
              </Button>
            </div>

            {/* Icons */}
            <div className="flex items-center">
              <Button
                size="icon"
                className="rounded-full bg-transparent hover:bg-gray-800">
                <Mail className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                className="rounded-full bg-transparent hover:bg-gray-800">
                <BarChart2 className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                className="rounded-full bg-transparent hover:bg-gray-800">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
