"use client";

import MaxWidthWrapper from "@/components/maxwidth-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, BarChart2, Bell } from "lucide-react";

export default function ProfileHeader() {
  return (
    <div className="flex flex-col w-full">
      {/* Cover Image */}
      <div className="relative w-full h-32">
        <img
          src="/cover-image.png"
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {/* Avatar overlapping cover */}
        <div className="absolute -bottom-10 left-6">
          <Avatar className="w-16 h-16">
            <AvatarImage src="/profile-image.png" alt="User Avatar" />
            <AvatarFallback>PO</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Profile Info */}
      <MaxWidthWrapper className="mt-14">
        <div className="flex flex-col w-full  space-y-4 ">
          {/* Role */}
          <div className="mb-3  items-start">
            <p className="text-sm text-gray-400">Software engineer</p>

            {/* Name */}
            <h2 className="text-xl font-semibold">Ignatius Emeka</h2>
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
            <div className="flex ">
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
