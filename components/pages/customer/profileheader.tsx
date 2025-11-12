"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Mail, Phone, ShoppingCart } from "lucide-react";

export default function ProfileHeaderPublic({
  profile,
}: {
  profile: {
    name: string;
    position?: string;
    profilePhoto?: string;
    coverPhoto?: string;
  };
}) {
  return (
    <div className="relative bg-black text-white">
      {/* Cover */}
      <div className="h-40 w-full relative overflow-hidden">
        <Image
          src={profile.coverPhoto || "/assets/default-cover.jpg"}
          alt="Cover"
          fill
          className="object-cover"
        />
      </div>

      {/* Profile section */}
      <div className="p-5 -mt-12 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-black overflow-hidden">
            <Image
              src={profile.profilePhoto || "/assets/default-avatar.jpg"}
              alt={profile.name}
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-sm text-white/70">{profile.position}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-5">
          <Button className="rounded-full bg-white text-black hover:bg-gray-200">
            Send money
          </Button>
          <Button
            variant="secondary"
            className="rounded-full bg-neutral-800 hover:bg-neutral-700 text-white">
            Save contact
          </Button>
        </div>

        {/* Quick icons */}
        <div className="flex gap-5 mt-4">
          <Phone className="w-5 h-5 cursor-pointer hover:text-white/80" />
          <Mail className="w-5 h-5 cursor-pointer hover:text-white/80" />
          <ShoppingCart className="w-5 h-5 cursor-pointer hover:text-white/80" />
        </div>
      </div>
    </div>
  );
}
