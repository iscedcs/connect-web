"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { URLS } from "@/lib/const";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LeftIcon } from "@/lib/icons";

interface Profile {
  id: string;
  name: string;
  position: string;
  profilePhoto?: string | null;
  is_default: boolean;
}

export default function DeletedProfileList({
  profiles,
  accessToken,
}: {
  profiles: Profile[];
  accessToken: string;
}) {
  const router = useRouter();
  const [list, setList] = useState(profiles);

  // Track loading per profile
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function restoreProfile(id: string) {
    if (loadingId) return;
    setLoadingId(id);

    try {
      const url = `${
        process.env.NEXT_PUBLIC_CONNECT_API_URL
      }${URLS.multi_profile.restore_one.replace("{profileId}", id)}`;

      const res = await fetch(url, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (res.ok) {
        toast.success("Profile restored");
        setList(list.filter((p) => p.id !== id));

        router.push("/settings/account");
      } else {
        toast.error(json.message);
      }
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        type="button"
        className="cursor-pointer"
        onClick={() => router.back()}>
        <LeftIcon />
      </button>
      {list.length === 0 ? (
        <p className="text-white/40 text-sm">No deleted profiles found.</p>
      ) : (
        <div className="space-y-4">
          {list.map((profile) => (
            <div
              key={profile.id}
              className="p-4 bg-neutral-900 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="font-semibold">{profile.name}</p>
                <p className="text-white/40 text-sm">{profile.position}</p>
              </div>

              <Button
                size="sm"
                onClick={() => restoreProfile(profile.id)}
                disabled={loadingId === profile.id}>
                {loadingId === profile.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Restore"
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
