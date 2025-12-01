"use client";

import { Button } from "@/components/ui/button";
import { URLS } from "@/lib/const";
import { toast } from "sonner";
import CloneProfileButton from "./clone-profile-button";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Profile {
  id: string;
  name: string;
  position: string;
  profilePhoto?: string | null;
  is_default: boolean;
}

export default function ProfileCard({
  profile,
  accessToken,
  onUpdated,
}: {
  profile: Profile;
  accessToken: string;
  onUpdated: () => Promise<void>;
}) {
  const router = useRouter();

  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSetDefault = async () => {
    if (isSettingDefault) return;

    setIsSettingDefault(true);

    try {
      const url = `${
        process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
      }${URLS.multi_profile.set_default_one.replace(
        "{profileId}",
        profile.id
      )}`;

      const res = await fetch(url, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (res.ok) {
        toast.success("Profile set as default");
      } else {
        toast.error(json.message);
      }

      await onUpdated();
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      const url = `${
        process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
      }${URLS.multi_profile.delete_one.replace("{profileId}", profile.id)}`;

      const res = await fetch(url, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (res.ok) toast.success("Profile deleted");
      else toast.error(json.message);

      router.refresh();
      await onUpdated();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 bg-neutral-900 rounded-xl border border-white/10">
      <div className="flex items-center gap-3">
        <img
          src={profile.profilePhoto ?? "/assets/default-avatar.png"}
          className="w-14 h-14 rounded-full object-cover"
        />

        <div className="flex-1">
          <p className="font-semibold">{profile.name}</p>
          <p className="text-white/40 text-sm">{profile.position}</p>

          {profile.is_default && (
            <span className="inline-block px-2 py-0.5 text-xs mt-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Default Profile
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            className="cursor-pointer"
            variant="secondary"
            onClick={() =>
              (window.location.href = `/settings/account/edit/${profile.id}`)
            }>
            Edit
          </Button>

          {!profile.is_default && (
            <Button
              size="sm"
              className="cursor-pointer"
              onClick={handleSetDefault}
              disabled={isSettingDefault}>
              {isSettingDefault ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Set default"
              )}
            </Button>
          )}

          <CloneProfileButton
            profileId={profile.id}
            accessToken={accessToken!}
          />

          <Button
            size="sm"
            className="cursor-pointer"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}>
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
