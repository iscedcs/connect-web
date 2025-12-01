"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProfileCard from "./profile-card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { URLS } from "@/lib/const";

interface Profile {
  id: string;
  name: string;
  position: string;
  profilePhoto?: string | null;
  is_default: boolean;
}

export default function ProfileList({
  profiles,
  accessToken,
}: {
  profiles: Profile[];
  accessToken: string;
}) {
  const [list, setList] = useState<Profile[]>(profiles);

  async function refresh() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL}${URLS.multi_profile.all}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const json = await res.json();
    setList(json.data?.profiles || []);
  }

  const router = useRouter();
  return (
    <div className="space-y-4">
      <div className="mb-3">
        <Button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 bg-transparent hover:bg-transparent cursor-pointer text-white/90">
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>
      {list.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          accessToken={accessToken}
          onUpdated={refresh}
        />
      ))}

      <Button
        className="w-full mt-6 cursor-pointer"
        onClick={() => (window.location.href = "/settings/account/create")}>
        Create new profile
      </Button>

      <Button
        variant="ghost"
        className="w-full text-white/50 cursor-pointer"
        onClick={() => (window.location.href = "/settings/account/deleted")}>
        View deleted profiles
      </Button>
    </div>
  );
}
